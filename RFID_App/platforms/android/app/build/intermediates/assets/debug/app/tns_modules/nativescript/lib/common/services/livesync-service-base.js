"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const syncBatchLib = require("./livesync/sync-batch");
const shell = require("shelljs");
const path = require("path");
const temp = require("temp");
const minimatch = require("minimatch");
const constants = require("../constants");
const util = require("util");
const gaze = require("gaze");
class LiveSyncServiceBase {
    constructor($devicesService, $mobileHelper, $logger, $options, $deviceAppDataFactory, $fs, $injector, $hooksService, $projectFilesManager, $projectFilesProvider, $liveSyncProvider, $dispatcher, $processService) {
        this.$devicesService = $devicesService;
        this.$mobileHelper = $mobileHelper;
        this.$logger = $logger;
        this.$options = $options;
        this.$deviceAppDataFactory = $deviceAppDataFactory;
        this.$fs = $fs;
        this.$injector = $injector;
        this.$hooksService = $hooksService;
        this.$projectFilesManager = $projectFilesManager;
        this.$projectFilesProvider = $projectFilesProvider;
        this.$liveSyncProvider = $liveSyncProvider;
        this.$dispatcher = $dispatcher;
        this.$processService = $processService;
        this.showFullLiveSyncInformation = false;
        this.batch = Object.create(null);
        this.livesyncData = Object.create(null);
        this.fileHashes = Object.create(null);
    }
    sync(data, projectId, projectFilesConfig, filePaths) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.syncCore(data, filePaths);
            if (this.$options.watch) {
                yield this.$hooksService.executeBeforeHooks('watch');
                this.partialSync(data, data[0].syncWorkingDirectory, projectId, projectFilesConfig);
            }
        });
    }
    isFileExcluded(filePath, excludedPatterns) {
        let isFileExcluded = false;
        _.each(excludedPatterns, pattern => {
            if (minimatch(filePath, pattern, { nocase: true })) {
                isFileExcluded = true;
                return false;
            }
        });
        return isFileExcluded;
    }
    partialSync(data, syncWorkingDirectory, projectId, projectFilesConfig) {
        const that = this;
        this.showFullLiveSyncInformation = true;
        const gazeInstance = gaze(["**/*", "!node_modules/**/*", "!platforms/**/*"], { cwd: syncWorkingDirectory }, function (err, watcher) {
            this.on('all', (event, filePath) => {
                that.$logger.trace(`Received event  ${event} for filePath: ${filePath}. Add it to queue.`);
                that.$dispatcher.dispatch(() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        if (filePath.indexOf(constants.APP_RESOURCES_FOLDER_NAME) !== -1) {
                            that.$logger.warn(`Skipping livesync for changed file ${filePath}. This change requires a full build to update your application. `.yellow.bold);
                            return;
                        }
                        const fileHash = that.$fs.exists(filePath) && that.$fs.getFsStats(filePath).isFile() ? yield that.$fs.getFileShasum(filePath) : "";
                        if (fileHash === that.fileHashes[filePath]) {
                            that.$logger.trace(`Skipping livesync for ${filePath} file with ${fileHash} hash.`);
                            return;
                        }
                        that.$logger.trace(`Adding ${filePath} file with ${fileHash} hash.`);
                        that.fileHashes[filePath] = fileHash;
                        for (const dataItem of data) {
                            if (that.isFileExcluded(filePath, dataItem.excludedProjectDirsAndFiles)) {
                                that.$logger.trace(`Skipping livesync for changed file ${filePath} as it is excluded in the patterns: ${dataItem.excludedProjectDirsAndFiles.join(", ")}`);
                                continue;
                            }
                            const mappedFilePath = that.$projectFilesProvider.mapFilePath(filePath, dataItem.platform, projectId, projectFilesConfig);
                            that.$logger.trace(`Syncing filePath ${filePath}, mappedFilePath is ${mappedFilePath}`);
                            if (!mappedFilePath) {
                                that.$logger.warn(`Unable to sync ${filePath}.`);
                                continue;
                            }
                            if (event === "added" || event === "changed" || event === "renamed") {
                                that.batchSync(dataItem, mappedFilePath, projectId);
                            }
                            else if (event === "deleted") {
                                that.fileHashes = (_.omit(that.fileHashes, filePath));
                                yield that.syncRemovedFile(dataItem, mappedFilePath);
                            }
                        }
                    }
                    catch (err) {
                        that.$logger.info(`Unable to sync file ${filePath}. Error is:${err.message}`.red.bold);
                        that.$logger.info("Try saving it again or restart the livesync operation.");
                    }
                }));
            });
        });
        this.$processService.attachToProcessExitSignals(this, () => gazeInstance.close());
        this.$dispatcher.run();
    }
    batchSync(data, filePath, projectId) {
        const platformBatch = this.batch[data.platform];
        if (!platformBatch || !platformBatch.syncPending) {
            const done = () => {
                setTimeout(() => {
                    this.$dispatcher.dispatch(() => __awaiter(this, void 0, void 0, function* () {
                        try {
                            for (const platformName in this.batch) {
                                const batch = this.batch[platformName];
                                const livesyncData = this.livesyncData[platformName];
                                yield batch.syncFiles((filesToSync) => __awaiter(this, void 0, void 0, function* () {
                                    yield this.$liveSyncProvider.preparePlatformForSync(platformName, projectId);
                                    this.syncCore([livesyncData], filesToSync);
                                }));
                            }
                        }
                        catch (err) {
                            this.$logger.warn(`Unable to sync files. Error is:`, err.message);
                        }
                    }));
                }, syncBatchLib.SYNC_WAIT_THRESHOLD);
            };
            this.batch[data.platform] = this.$injector.resolve(syncBatchLib.SyncBatch, { done: done });
            this.livesyncData[data.platform] = data;
        }
        this.batch[data.platform].addFile(filePath);
    }
    syncRemovedFile(data, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePathArray = [filePath], deviceFilesAction = this.getSyncRemovedFilesAction(data);
            yield this.syncCore([data], filePathArray, deviceFilesAction);
        });
    }
    getSyncRemovedFilesAction(data) {
        return (deviceAppData, device, localToDevicePaths) => {
            const platformLiveSyncService = this.resolveDeviceLiveSyncService(data.platform, device);
            return platformLiveSyncService.removeFiles(deviceAppData.appIdentifier, localToDevicePaths);
        };
    }
    getSyncAction(data, filesToSync, deviceFilesAction, liveSyncOptions) {
        const appIdentifier = data.appIdentifier;
        const platform = data.platform;
        const projectFilesPath = data.projectFilesPath;
        let packageFilePath = null;
        return (device) => __awaiter(this, void 0, void 0, function* () {
            let shouldRefreshApplication = true;
            const deviceAppData = this.$deviceAppDataFactory.create(appIdentifier, this.$mobileHelper.normalizePlatformName(platform), device, liveSyncOptions);
            if (yield deviceAppData.isLiveSyncSupported()) {
                const platformLiveSyncService = this.resolveDeviceLiveSyncService(platform, device);
                if (platformLiveSyncService.beforeLiveSyncAction) {
                    yield platformLiveSyncService.beforeLiveSyncAction(deviceAppData);
                }
                yield device.applicationManager.checkForApplicationUpdates();
                let wasInstalled = true;
                if (!(yield device.applicationManager.isApplicationInstalled(appIdentifier)) && !this.$options.companion) {
                    this.$logger.warn(`The application with id "${appIdentifier}" is not installed on device with identifier ${device.deviceInfo.identifier}.`);
                    if (!packageFilePath) {
                        packageFilePath = yield this.$liveSyncProvider.buildForDevice(device);
                    }
                    yield device.applicationManager.installApplication(packageFilePath);
                    if (platformLiveSyncService.afterInstallApplicationAction) {
                        const localToDevicePaths = yield this.$projectFilesManager.createLocalToDevicePaths(deviceAppData, projectFilesPath, filesToSync, data.excludedProjectDirsAndFiles, liveSyncOptions);
                        shouldRefreshApplication = yield platformLiveSyncService.afterInstallApplicationAction(deviceAppData, localToDevicePaths);
                    }
                    else {
                        shouldRefreshApplication = false;
                    }
                    if (!shouldRefreshApplication) {
                        yield device.applicationManager.startApplication({ appId: appIdentifier, projectName: "" });
                    }
                    wasInstalled = false;
                }
                if (shouldRefreshApplication) {
                    const localToDevicePaths = yield this.$projectFilesManager.createLocalToDevicePaths(deviceAppData, projectFilesPath, filesToSync, data.excludedProjectDirsAndFiles, liveSyncOptions);
                    if (deviceFilesAction) {
                        yield deviceFilesAction(deviceAppData, device, localToDevicePaths);
                    }
                    else {
                        yield this.transferFiles(deviceAppData, localToDevicePaths, projectFilesPath, !filesToSync);
                    }
                    this.$logger.info("Applying changes...");
                    yield platformLiveSyncService.refreshApplication(deviceAppData, localToDevicePaths, data.forceExecuteFullSync || !wasInstalled);
                    this.$logger.info(`Successfully synced application ${data.appIdentifier} on device ${device.deviceInfo.identifier}.`);
                }
            }
            else {
                this.$logger.warn(`LiveSync is not supported for application: ${deviceAppData.appIdentifier} on device with identifier ${device.deviceInfo.identifier}.`);
            }
        });
    }
    syncCore(data, filesToSync, deviceFilesAction) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const dataItem of data) {
                const appIdentifier = dataItem.appIdentifier;
                const platform = dataItem.platform;
                const canExecute = yield this.getCanExecuteAction(platform, appIdentifier, dataItem.canExecute);
                const action = this.getSyncAction(dataItem, filesToSync, deviceFilesAction, { isForCompanionApp: this.$options.companion, additionalConfigurations: dataItem.additionalConfigurations, configuration: dataItem.configuration, isForDeletedFiles: false });
                yield this.$devicesService.execute(action, canExecute);
            }
        });
    }
    transferFiles(deviceAppData, localToDevicePaths, projectFilesPath, isFullSync) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$logger.info("Transferring project files...");
            this.logFilesSyncInformation(localToDevicePaths, "Transferring %s.", this.$logger.trace);
            const canTransferDirectory = isFullSync && (this.$devicesService.isAndroidDevice(deviceAppData.device) || this.$devicesService.isiOSSimulator(deviceAppData.device));
            if (canTransferDirectory) {
                const tempDir = temp.mkdirSync("tempDir");
                _.each(localToDevicePaths, localToDevicePath => {
                    const fileDirname = path.join(tempDir, path.dirname(localToDevicePath.getRelativeToProjectBasePath()));
                    shell.mkdir("-p", fileDirname);
                    if (!this.$fs.getFsStats(localToDevicePath.getLocalPath()).isDirectory()) {
                        shell.cp("-f", localToDevicePath.getLocalPath(), path.join(fileDirname, path.basename(localToDevicePath.getDevicePath())));
                    }
                });
                yield deviceAppData.device.fileSystem.transferDirectory(deviceAppData, localToDevicePaths, tempDir);
            }
            else {
                yield this.$liveSyncProvider.transferFiles(deviceAppData, localToDevicePaths, projectFilesPath, isFullSync);
            }
            this.logFilesSyncInformation(localToDevicePaths, "Successfully transferred %s.", this.$logger.info);
        });
    }
    logFilesSyncInformation(localToDevicePaths, message, action) {
        if (this.showFullLiveSyncInformation) {
            _.each(localToDevicePaths, (file) => {
                action.call(this.$logger, util.format(message, path.basename(file.getLocalPath()).yellow));
            });
        }
        else {
            action.call(this.$logger, util.format(message, "all files"));
        }
    }
    resolveDeviceLiveSyncService(platform, device) {
        return this.$injector.resolve(this.$liveSyncProvider.deviceSpecificLiveSyncServices[platform.toLowerCase()], { _device: device });
    }
    getCanExecuteAction(platform, appIdentifier, canExecute) {
        return __awaiter(this, void 0, void 0, function* () {
            canExecute = canExecute || ((dev) => dev.deviceInfo.platform.toLowerCase() === platform.toLowerCase());
            let finalCanExecute = canExecute;
            if (this.$options.device) {
                return (device) => canExecute(device) && device.deviceInfo.identifier === this.$devicesService.getDeviceByDeviceOption().deviceInfo.identifier;
            }
            if (this.$mobileHelper.isiOSPlatform(platform)) {
                if (this.$options.emulator) {
                    finalCanExecute = (device) => canExecute(device) && this.$devicesService.isiOSSimulator(device);
                }
                else {
                    const devices = this.$devicesService.getDevicesForPlatform(platform);
                    const simulator = _.find(devices, d => this.$devicesService.isiOSSimulator(d));
                    if (simulator) {
                        const iOSDevices = _.filter(devices, d => d.deviceInfo.identifier !== simulator.deviceInfo.identifier);
                        if (iOSDevices && iOSDevices.length) {
                            const isApplicationInstalledOnSimulator = yield simulator.applicationManager.isApplicationInstalled(appIdentifier);
                            const isInstalledPromises = yield Promise.all(iOSDevices.map(device => device.applicationManager.isApplicationInstalled(appIdentifier)));
                            const isApplicationInstalledOnAllDevices = _.intersection.apply(null, isInstalledPromises);
                            if (!isApplicationInstalledOnSimulator && !isApplicationInstalledOnAllDevices) {
                                finalCanExecute = (device) => canExecute(device) && this.$devicesService.isiOSDevice(device);
                            }
                        }
                    }
                }
            }
            return finalCanExecute;
        });
    }
}
$injector.register('liveSyncServiceBase', LiveSyncServiceBase);
