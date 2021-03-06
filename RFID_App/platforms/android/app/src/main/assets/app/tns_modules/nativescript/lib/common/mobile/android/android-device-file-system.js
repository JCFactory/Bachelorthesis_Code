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
const path = require("path");
const temp = require("temp");
const android_device_hash_service_1 = require("./android-device-hash-service");
const helpers_1 = require("../../helpers");
const constants_1 = require("../../constants");
class AndroidDeviceFileSystem {
    constructor(adb, $fs, $logger, $mobileHelper, $injector, $options) {
        this.adb = adb;
        this.$fs = $fs;
        this.$logger = $logger;
        this.$mobileHelper = $mobileHelper;
        this.$injector = $injector;
        this.$options = $options;
        this._deviceHashServices = Object.create(null);
    }
    listFiles(devicePath, appIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            let listCommandArgs = ["ls", "-a", devicePath];
            if (appIdentifier) {
                listCommandArgs = ["run-as", appIdentifier].concat(listCommandArgs);
            }
            return this.adb.executeShellCommand(listCommandArgs);
        });
    }
    getFile(deviceFilePath, appIdentifier, outputPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const stdout = !outputPath;
            if (stdout) {
                temp.track();
                outputPath = temp.path({ prefix: "sync", suffix: ".tmp" });
            }
            yield this.adb.executeCommand(["pull", deviceFilePath, outputPath]);
            if (stdout) {
                yield new Promise((resolve, reject) => {
                    const readStream = this.$fs.createReadStream(outputPath);
                    readStream.pipe(process.stdout);
                    readStream.on("end", () => {
                        resolve();
                    });
                    readStream.on("error", (err) => {
                        reject(err);
                    });
                });
            }
        });
    }
    putFile(localFilePath, deviceFilePath, appIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.adb.executeCommand(["push", localFilePath, deviceFilePath]);
        });
    }
    transferFiles(deviceAppData, localToDevicePaths) {
        return __awaiter(this, void 0, void 0, function* () {
            const directoriesToChmod = [];
            const transferedFiles = [];
            const action = (localToDevicePathData) => __awaiter(this, void 0, void 0, function* () {
                const fstat = this.$fs.getFsStats(localToDevicePathData.getLocalPath());
                if (fstat.isFile()) {
                    const devicePath = localToDevicePathData.getDevicePath();
                    yield this.adb.executeCommand(["push", localToDevicePathData.getLocalPath(), devicePath]);
                    yield this.adb.executeShellCommand(["chmod", "0777", path.dirname(devicePath)]);
                    transferedFiles.push(localToDevicePathData);
                }
                else if (fstat.isDirectory()) {
                    const dirToChmod = localToDevicePathData.getDevicePath();
                    directoriesToChmod.push(dirToChmod);
                }
            });
            yield helpers_1.executeActionByChunks(localToDevicePaths, constants_1.DEFAULT_CHUNK_SIZE, action);
            const dirsChmodAction = (directoryToChmod) => this.adb.executeShellCommand(["chmod", "0777", directoryToChmod]);
            yield helpers_1.executeActionByChunks(_.uniq(directoriesToChmod), constants_1.DEFAULT_CHUNK_SIZE, dirsChmodAction);
            const deviceHashService = this.getDeviceHashService(deviceAppData.appIdentifier);
            if (!(yield deviceHashService.updateHashes(localToDevicePaths))) {
                this.$logger.trace("Unable to find hash file on device. The next livesync command will create it.");
            }
            return transferedFiles;
        });
    }
    transferDirectory(deviceAppData, localToDevicePaths, projectFilesPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentShasums = {};
            const deviceHashService = this.getDeviceHashService(deviceAppData.appIdentifier);
            const devicePaths = yield deviceHashService.generateHashesFromLocalToDevicePaths(localToDevicePaths, currentShasums);
            const commandsDeviceFilePath = this.$mobileHelper.buildDevicePath(yield deviceAppData.getDeviceProjectRootPath(), "nativescript.commands.sh");
            let filesToChmodOnDevice = devicePaths;
            let tranferredFiles = [];
            const oldShasums = yield deviceHashService.getShasumsFromDevice();
            if (this.$options.force || !oldShasums) {
                yield this.adb.executeShellCommand(["rm", "-rf", deviceHashService.hashFileDevicePath]);
                yield this.adb.executeCommand(["push", projectFilesPath, yield deviceAppData.getDeviceProjectRootPath()]);
                tranferredFiles = localToDevicePaths;
            }
            else {
                const changedShasums = _.omitBy(currentShasums, (hash, pathToFile) => !!_.find(oldShasums, (oldHash, oldPath) => pathToFile === oldPath && hash === oldHash));
                this.$logger.trace("Changed file hashes are:", changedShasums);
                filesToChmodOnDevice = [];
                const transferFileAction = (hash, filePath) => __awaiter(this, void 0, void 0, function* () {
                    const localToDevicePathData = _.find(localToDevicePaths, ldp => ldp.getLocalPath() === filePath);
                    tranferredFiles.push(localToDevicePathData);
                    filesToChmodOnDevice.push(`"${localToDevicePathData.getDevicePath()}"`);
                    return this.transferFile(localToDevicePathData.getLocalPath(), localToDevicePathData.getDevicePath());
                });
                yield helpers_1.executeActionByChunks(changedShasums, constants_1.DEFAULT_CHUNK_SIZE, transferFileAction);
            }
            if (filesToChmodOnDevice.length) {
                yield this.createFileOnDevice(commandsDeviceFilePath, "chmod 0777 " + filesToChmodOnDevice.join(" "));
                yield this.adb.executeShellCommand([commandsDeviceFilePath]);
            }
            yield deviceHashService.uploadHashFileToDevice(currentShasums);
            return tranferredFiles;
        });
    }
    transferFile(localPath, devicePath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$logger.trace(`Transfering ${localPath} to ${devicePath}`);
            const stats = this.$fs.getFsStats(localPath);
            if (stats.isDirectory()) {
                yield this.adb.executeShellCommand(["mkdir", path.dirname(devicePath)]);
            }
            else {
                yield this.adb.executeCommand(["push", localPath, devicePath]);
            }
        });
    }
    createFileOnDevice(deviceFilePath, fileContent) {
        return __awaiter(this, void 0, void 0, function* () {
            const hostTmpDir = this.getTempDir();
            const commandsFileHostPath = path.join(hostTmpDir, "temp.commands.file");
            this.$fs.writeFile(commandsFileHostPath, fileContent);
            yield this.transferFile(commandsFileHostPath, deviceFilePath);
            yield this.adb.executeShellCommand(["chmod", "0777", deviceFilePath]);
        });
    }
    getTempDir() {
        temp.track();
        return temp.mkdirSync("application-");
    }
    getDeviceHashService(appIdentifier) {
        if (!this._deviceHashServices[appIdentifier]) {
            this._deviceHashServices[appIdentifier] = this.$injector.resolve(android_device_hash_service_1.AndroidDeviceHashService, { adb: this.adb, appIdentifier });
        }
        return this._deviceHashServices[appIdentifier];
    }
}
exports.AndroidDeviceFileSystem = AndroidDeviceFileSystem;
