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
const constants = require("../constants");
const os_1 = require("os");
class AndroidResourcesMigrationService {
    constructor($fs, $errors, $logger, $devicePlatformsConstants) {
        this.$fs = $fs;
        this.$errors = $errors;
        this.$logger = $logger;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
    }
    canMigrate(platformString) {
        return platformString.toLowerCase() === this.$devicePlatformsConstants.Android.toLowerCase();
    }
    hasMigrated(appResourcesDir) {
        return this.$fs.exists(path.join(appResourcesDir, AndroidResourcesMigrationService.ANDROID_DIR, constants.SRC_DIR, constants.MAIN_DIR));
    }
    migrate(appResourcesDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const originalAppResources = path.join(appResourcesDir, AndroidResourcesMigrationService.ANDROID_DIR);
            const appResourcesDestination = path.join(appResourcesDir, AndroidResourcesMigrationService.ANDROID_DIR_TEMP);
            const appResourcesBackup = path.join(appResourcesDir, AndroidResourcesMigrationService.ANDROID_DIR_OLD);
            try {
                yield this.tryMigrate(originalAppResources, appResourcesDestination, appResourcesBackup);
                this.$logger.out(`Successfully updated your project's application resources '/Android' directory structure.${os_1.EOL}The previous version of your Android application resources has been renamed to '/${AndroidResourcesMigrationService.ANDROID_DIR_OLD}'`);
            }
            catch (error) {
                try {
                    this.recover(originalAppResources, appResourcesDestination, appResourcesBackup);
                    this.$logger.out("Failed to update resources. They should be in their initial state.");
                }
                catch (err) {
                    this.$logger.trace(err);
                    this.$logger.out(`Failed to update resources.${os_1.EOL} Backup of original content is inside "${appResourcesBackup}".${os_1.EOL}If "${originalAppResources} is missing copy from backup folder."`);
                }
                finally {
                    this.$errors.failWithoutHelp(error.message);
                }
            }
        });
    }
    tryMigrate(originalAppResources, appResourcesDestination, appResourcesBackup) {
        return __awaiter(this, void 0, void 0, function* () {
            const appMainSourceSet = path.join(appResourcesDestination, constants.SRC_DIR, constants.MAIN_DIR);
            const appResourcesMainSourceSetResourcesDestination = path.join(appMainSourceSet, constants.RESOURCES_DIR);
            this.$fs.ensureDirectoryExists(appResourcesDestination);
            this.$fs.ensureDirectoryExists(appMainSourceSet);
            this.$fs.ensureDirectoryExists(appResourcesMainSourceSetResourcesDestination);
            this.$fs.ensureDirectoryExists(path.join(appMainSourceSet, "java"));
            this.$fs.ensureDirectoryExists(path.join(appMainSourceSet, constants.ASSETS_DIR));
            const isDirectory = (source) => this.$fs.getLsStats(source).isDirectory();
            const getAllFiles = (source) => this.$fs.readDirectory(source).map(name => path.join(source, name));
            const getDirectories = (files) => files.filter(isDirectory);
            const getFiles = (files) => files.filter((file) => !isDirectory(file));
            this.$fs.copyFile(path.join(originalAppResources, constants.APP_GRADLE_FILE_NAME), path.join(appResourcesDestination, constants.APP_GRADLE_FILE_NAME));
            const appResourcesFiles = getAllFiles(originalAppResources);
            const resourceDirectories = getDirectories(appResourcesFiles);
            const resourceFiles = getFiles(appResourcesFiles);
            resourceDirectories.forEach(dir => {
                if (path.basename(dir) !== "libs") {
                    this.$fs.copyFile(dir, appResourcesMainSourceSetResourcesDestination);
                }
                else {
                    this.$fs.copyFile(dir, path.join(appResourcesDestination));
                }
            });
            resourceFiles.forEach(file => {
                const fileName = path.basename(file);
                if (fileName !== constants.MANIFEST_FILE_NAME) {
                    this.$fs.copyFile(file, path.join(appResourcesDestination, fileName));
                }
            });
            this.$fs.copyFile(path.join(originalAppResources, constants.MANIFEST_FILE_NAME), path.join(appMainSourceSet, constants.MANIFEST_FILE_NAME));
            this.$fs.rename(originalAppResources, appResourcesBackup);
            this.$fs.rename(appResourcesDestination, originalAppResources);
        });
    }
    recover(originalAppResources, appResourcesDestination, appResourcesBackup) {
        if (!this.$fs.exists(originalAppResources)) {
            this.$fs.rename(appResourcesBackup, originalAppResources);
        }
        if (this.$fs.exists(appResourcesDestination)) {
            this.$fs.deleteDirectory(appResourcesDestination);
        }
    }
}
AndroidResourcesMigrationService.ANDROID_DIR = "Android";
AndroidResourcesMigrationService.ANDROID_DIR_TEMP = "Android-Updated";
AndroidResourcesMigrationService.ANDROID_DIR_OLD = "Android-Pre-v4";
exports.AndroidResourcesMigrationService = AndroidResourcesMigrationService;
$injector.register("androidResourcesMigrationService", AndroidResourcesMigrationService);
