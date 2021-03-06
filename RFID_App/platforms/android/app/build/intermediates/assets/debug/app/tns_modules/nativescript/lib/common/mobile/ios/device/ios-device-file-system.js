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
const os_1 = require("os");
class IOSDeviceFileSystem {
    constructor(device, $logger, $iosDeviceOperations, $fs) {
        this.device = device;
        this.$logger = $logger;
        this.$iosDeviceOperations = $iosDeviceOperations;
        this.$fs = $fs;
    }
    listFiles(devicePath, appIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!devicePath) {
                devicePath = ".";
            }
            this.$logger.info("Listing %s", devicePath);
            const deviceIdentifier = this.device.deviceInfo.identifier;
            let children = [];
            const result = yield this.$iosDeviceOperations.listDirectory([{ deviceId: deviceIdentifier, path: devicePath, appId: appIdentifier }]);
            children = result[deviceIdentifier][0].response;
            this.$logger.out(children.join(os_1.EOL));
        });
    }
    getFile(deviceFilePath, appIdentifier, outputFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!outputFilePath) {
                const result = yield this.$iosDeviceOperations.readFiles([{ deviceId: this.device.deviceInfo.identifier, path: deviceFilePath, appId: appIdentifier }]);
                const response = result[this.device.deviceInfo.identifier][0];
                if (response) {
                    this.$logger.out(response.response);
                }
            }
            else {
                yield this.$iosDeviceOperations.downloadFiles([{ appId: appIdentifier, deviceId: this.device.deviceInfo.identifier, source: deviceFilePath, destination: outputFilePath }]);
            }
        });
    }
    putFile(localFilePath, deviceFilePath, appIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.uploadFilesCore([{ appId: appIdentifier, deviceId: this.device.deviceInfo.identifier, files: [{ source: localFilePath, destination: deviceFilePath }] }]);
        });
    }
    deleteFile(deviceFilePath, appIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$iosDeviceOperations.deleteFiles([{ appId: appIdentifier, destination: deviceFilePath, deviceId: this.device.deviceInfo.identifier }], (err) => {
                this.$logger.trace(`Error while deleting file: ${deviceFilePath}: ${err.message} with code: ${err.code}`);
                if (err.code !== IOSDeviceFileSystem.AFC_DELETE_FILE_NOT_FOUND_ERROR) {
                    this.$logger.warn(`Cannot delete file: ${deviceFilePath}. Reason: ${err.message}`);
                }
            });
        });
    }
    transferFiles(deviceAppData, localToDevicePaths) {
        return __awaiter(this, void 0, void 0, function* () {
            const filesToUpload = _.filter(localToDevicePaths, l => this.$fs.getFsStats(l.getLocalPath()).isFile());
            const files = filesToUpload.map(l => ({ source: l.getLocalPath(), destination: l.getDevicePath() }));
            yield this.uploadFilesCore([{
                    deviceId: this.device.deviceInfo.identifier,
                    appId: deviceAppData.appIdentifier,
                    files: files
                }]);
            return filesToUpload;
        });
    }
    transferDirectory(deviceAppData, localToDevicePaths, projectFilesPath) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.transferFiles(deviceAppData, localToDevicePaths);
            return localToDevicePaths;
        });
    }
    uploadFilesCore(filesToUpload) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$iosDeviceOperations.uploadFiles(filesToUpload, (err) => {
                if (err.deviceId === this.device.deviceInfo.identifier) {
                    throw err;
                }
            });
        });
    }
}
IOSDeviceFileSystem.AFC_DELETE_FILE_NOT_FOUND_ERROR = 8;
exports.IOSDeviceFileSystem = IOSDeviceFileSystem;
