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
const shelljs = require("shelljs");
class IOSSimulatorFileSystem {
    constructor(iosSim, $fs, $logger) {
        this.iosSim = iosSim;
        this.$fs = $fs;
        this.$logger = $logger;
    }
    listFiles(devicePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.iosSim.listFiles(devicePath);
        });
    }
    getFile(deviceFilePath, appIdentifier, outputFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (outputFilePath) {
                shelljs.cp("-f", deviceFilePath, outputFilePath);
            }
        });
    }
    putFile(localFilePath, deviceFilePath, appIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            shelljs.cp("-f", localFilePath, deviceFilePath);
        });
    }
    deleteFile(deviceFilePath, appIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            shelljs.rm("-rf", deviceFilePath);
        });
    }
    transferFiles(deviceAppData, localToDevicePaths) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(_.map(localToDevicePaths, localToDevicePathData => this.transferFile(localToDevicePathData.getLocalPath(), localToDevicePathData.getDevicePath())));
            return localToDevicePaths;
        });
    }
    transferDirectory(deviceAppData, localToDevicePaths, projectFilesPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const destinationPath = yield deviceAppData.getDeviceProjectRootPath();
            this.$logger.trace(`Transferring from ${projectFilesPath} to ${destinationPath}`);
            const sourcePath = path.join(projectFilesPath, "*");
            shelljs.cp("-Rf", sourcePath, destinationPath);
            return localToDevicePaths;
        });
    }
    transferFile(localFilePath, deviceFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$logger.trace(`Transferring from ${localFilePath} to ${deviceFilePath}`);
            if (this.$fs.getFsStats(localFilePath).isDirectory()) {
                this.$fs.ensureDirectoryExists(deviceFilePath);
            }
            else {
                this.$fs.ensureDirectoryExists(path.dirname(deviceFilePath));
                shelljs.cp("-f", localFilePath, deviceFilePath);
            }
        });
    }
}
exports.IOSSimulatorFileSystem = IOSSimulatorFileSystem;
