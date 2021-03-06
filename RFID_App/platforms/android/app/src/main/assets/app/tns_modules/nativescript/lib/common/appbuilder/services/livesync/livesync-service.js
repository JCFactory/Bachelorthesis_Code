"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const decorators_1 = require("../../../decorators");
class ProtonLiveSyncService {
    constructor($devicesService, $fs, $injector, $project, $logger, $companionAppsService) {
        this.$devicesService = $devicesService;
        this.$fs = $fs;
        this.$injector = $injector;
        this.$project = $project;
        this.$logger = $logger;
        this.$companionAppsService = $companionAppsService;
        this.excludedProjectDirsAndFiles = ["app_resources", "plugins", ".*.tmp", ".ab"];
    }
    get $liveSyncServiceBase() {
        return this.$injector.resolve("liveSyncServiceBase");
    }
    livesync(deviceDescriptors, projectDir, filePaths) {
        this.$project.projectDir = projectDir;
        this.$logger.trace(`Called livesync for identifiers ${_.map(deviceDescriptors, d => d.deviceIdentifier)}. Project dir is ${projectDir}. Files are: ${filePaths}`);
        return _.map(deviceDescriptors, deviceDescriptor => this.liveSyncOnDevice(deviceDescriptor, filePaths));
    }
    deleteFiles(deviceDescriptors, projectDir, filePaths) {
        this.$project.projectDir = projectDir;
        this.$logger.trace(`Called deleteFiles for identifiers ${_.map(deviceDescriptors, d => d.deviceIdentifier)}. Project dir is ${projectDir}. Files are: ${filePaths}`);
        return _.map(deviceDescriptors, deviceDescriptor => this.liveSyncOnDevice(deviceDescriptor, filePaths, { isForDeletedFiles: true }));
    }
    liveSyncOnDevice(deviceDescriptor, filePaths, liveSyncOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const isForDeletedFiles = liveSyncOptions && liveSyncOptions.isForDeletedFiles;
            const result = {
                deviceIdentifier: deviceDescriptor.deviceIdentifier
            };
            const device = _.find(this.$devicesService.getDeviceInstances(), d => d.deviceInfo.identifier === deviceDescriptor.deviceIdentifier);
            if (!device) {
                result.liveSyncToApp = result.liveSyncToCompanion = {
                    isResolved: false,
                    error: new Error(`Cannot find connected device with identifier ${deviceDescriptor.deviceIdentifier}. Available device identifiers are: ${this.$devicesService.getDeviceInstances()}`)
                };
                return result;
            }
            if (!this.$fs.exists(this.$project.projectDir)) {
                result.liveSyncToApp = result.liveSyncToCompanion = {
                    isResolved: false,
                    error: new Error(`Cannot execute LiveSync operation as the project dir ${this.$project.projectDir} does not exist on the file system.`)
                };
                return result;
            }
            if (!isForDeletedFiles && filePaths && filePaths.length) {
                const missingFiles = filePaths.filter(filePath => !this.$fs.exists(filePath));
                if (missingFiles && missingFiles.length) {
                    result.liveSyncToApp = result.liveSyncToCompanion = {
                        isResolved: false,
                        error: new Error(`Cannot LiveSync files ${missingFiles.join(", ")} as they do not exist on the file system.`)
                    };
                    return result;
                }
            }
            const appIdentifier = yield this.$project.getAppIdentifierForPlatform(this.$devicesService.platform), canExecute = (d) => d.deviceInfo.identifier === device.deviceInfo.identifier, livesyncData = {
                platform: device.deviceInfo.platform,
                appIdentifier: appIdentifier,
                projectFilesPath: this.$project.projectDir,
                syncWorkingDirectory: this.$project.projectDir,
                excludedProjectDirsAndFiles: this.excludedProjectDirsAndFiles,
            };
            const canExecuteAction = yield this.$liveSyncServiceBase.getCanExecuteAction(device.deviceInfo.platform, appIdentifier, canExecute);
            if (deviceDescriptor.syncToApp) {
                result.liveSyncToApp = yield this.liveSyncCore(livesyncData, device, appIdentifier, canExecuteAction, { isForCompanionApp: false, isForDeletedFiles: isForDeletedFiles }, filePaths);
            }
            if (deviceDescriptor.syncToCompanion) {
                result.liveSyncToCompanion = yield this.liveSyncCore(livesyncData, device, appIdentifier, canExecuteAction, { isForCompanionApp: true, isForDeletedFiles: isForDeletedFiles }, filePaths);
            }
            return result;
        });
    }
    liveSyncCore(livesyncData, device, appIdentifier, canExecuteAction, liveSyncOptions, filePaths) {
        return __awaiter(this, void 0, void 0, function* () {
            const liveSyncOperationResult = {
                isResolved: false
            };
            if (liveSyncOptions.isForCompanionApp) {
                livesyncData.appIdentifier = appIdentifier = this.$companionAppsService.getCompanionAppIdentifier(this.$project.projectData.Framework, device.deviceInfo.platform);
            }
            if (yield device.applicationManager.isApplicationInstalled(appIdentifier)) {
                const deletedFilesAction = liveSyncOptions && liveSyncOptions.isForDeletedFiles ? this.$liveSyncServiceBase.getSyncRemovedFilesAction(livesyncData) : null;
                const action = this.$liveSyncServiceBase.getSyncAction(livesyncData, filePaths, deletedFilesAction, liveSyncOptions);
                try {
                    yield this.$devicesService.execute(action, canExecuteAction);
                    liveSyncOperationResult.isResolved = true;
                }
                catch (err) {
                    liveSyncOperationResult.error = err;
                    liveSyncOperationResult.isResolved = false;
                }
            }
            else {
                liveSyncOperationResult.error = new Error(`Application with id ${appIdentifier} is not installed on device with id ${device.deviceInfo.identifier} and it cannot be livesynced.`);
                liveSyncOperationResult.isResolved = false;
            }
            return liveSyncOperationResult;
        });
    }
}
__decorate([
    decorators_1.exported("liveSyncService")
], ProtonLiveSyncService.prototype, "livesync", null);
__decorate([
    decorators_1.exported("liveSyncService")
], ProtonLiveSyncService.prototype, "deleteFiles", null);
exports.ProtonLiveSyncService = ProtonLiveSyncService;
$injector.register("liveSyncService", ProtonLiveSyncService);
