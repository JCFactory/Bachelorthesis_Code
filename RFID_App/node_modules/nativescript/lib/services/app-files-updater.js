"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const minimatch = require("minimatch");
const constants = require("../constants");
const fs = require("fs");
class AppFilesUpdater {
    constructor(appSourceDirectoryPath, appDestinationDirectoryPath, options, fs) {
        this.appSourceDirectoryPath = appSourceDirectoryPath;
        this.appDestinationDirectoryPath = appDestinationDirectoryPath;
        this.options = options;
        this.fs = fs;
    }
    updateApp(updateAppOptions, projectData) {
        this.cleanDestinationApp(updateAppOptions);
        let sourceFiles = updateAppOptions.filesToSync || this.resolveAppSourceFiles(projectData);
        const appResourcesPathNormalized = path.normalize(projectData.appResourcesDirectoryPath + path.sep);
        sourceFiles = sourceFiles.filter(dirName => !path.normalize(dirName).startsWith(appResourcesPathNormalized));
        updateAppOptions.beforeCopyAction(sourceFiles);
        this.copyAppSourceFiles(sourceFiles);
    }
    cleanDestinationApp(updateAppOptions) {
        let itemsToRemove;
        if (updateAppOptions && updateAppOptions.filesToRemove) {
            itemsToRemove = updateAppOptions.filesToRemove.map(fileToRemove => path.relative(this.appSourceDirectoryPath, fileToRemove));
        }
        else {
            itemsToRemove = this.readDestinationDir();
            itemsToRemove = itemsToRemove.filter((directoryName) => directoryName !== constants.TNS_MODULES_FOLDER_NAME);
        }
        _(itemsToRemove).each((directoryItem) => {
            this.deleteDestinationItem(directoryItem);
        });
    }
    readDestinationDir() {
        if (this.fs.exists(this.appDestinationDirectoryPath)) {
            return this.fs.readDirectory(this.appDestinationDirectoryPath);
        }
        else {
            return [];
        }
    }
    deleteDestinationItem(directoryItem) {
        this.fs.deleteDirectory(path.join(this.appDestinationDirectoryPath, directoryItem));
    }
    readSourceDir(projectData) {
        const tnsDir = path.join(this.appSourceDirectoryPath, constants.TNS_MODULES_FOLDER_NAME);
        return this.fs.enumerateFilesInDirectorySync(this.appSourceDirectoryPath, null, { includeEmptyDirectories: true }).filter(dirName => dirName !== tnsDir);
    }
    resolveAppSourceFiles(projectData) {
        if (this.options.bundle) {
            return [];
        }
        let sourceFiles = this.readSourceDir(projectData);
        if (this.options.release) {
            const testsFolderPath = path.join(this.appSourceDirectoryPath, 'tests');
            sourceFiles = sourceFiles.filter(source => source.indexOf(testsFolderPath) === -1);
        }
        if (this.options.release) {
            constants.LIVESYNC_EXCLUDED_FILE_PATTERNS.forEach(pattern => sourceFiles = sourceFiles.filter(file => !minimatch(file, pattern, { nocase: true })));
        }
        return sourceFiles;
    }
    copyAppSourceFiles(sourceFiles) {
        sourceFiles.map(source => {
            const destinationPath = path.join(this.appDestinationDirectoryPath, path.relative(this.appSourceDirectoryPath, source));
            let exists = fs.lstatSync(source);
            if (exists.isSymbolicLink()) {
                source = fs.realpathSync(source);
                exists = fs.lstatSync(source);
            }
            if (exists.isDirectory()) {
                return this.fs.createDirectory(destinationPath);
            }
            return this.fs.copyFile(source, destinationPath);
        });
    }
}
exports.AppFilesUpdater = AppFilesUpdater;
