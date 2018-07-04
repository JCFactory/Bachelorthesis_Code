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
const constants_1 = require("../constants");
const helpers_1 = require("../common/helpers");
const prepareInfoFileName = ".nsprepareinfo";
class ProjectChangesInfo {
    get hasChanges() {
        return this.packageChanged ||
            this.appFilesChanged ||
            this.appResourcesChanged ||
            this.modulesChanged ||
            this.configChanged ||
            this.signingChanged;
    }
    get changesRequireBuild() {
        return this.packageChanged ||
            this.appResourcesChanged ||
            this.nativeChanged;
    }
    get changesRequirePrepare() {
        return this.appResourcesChanged ||
            this.signingChanged;
    }
}
class ProjectChangesService {
    constructor($platformsData, $devicePlatformsConstants, $fs, $filesHashService) {
        this.$platformsData = $platformsData;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.$fs = $fs;
        this.$filesHashService = $filesHashService;
        this._newFiles = 0;
    }
    get currentChanges() {
        return this._changesInfo;
    }
    checkForChanges(platform, projectData, projectChangesOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const platformData = this.$platformsData.getPlatformData(platform, projectData);
            this._changesInfo = new ProjectChangesInfo();
            const isNewPrepareInfo = yield this.ensurePrepareInfo(platform, projectData, projectChangesOptions);
            if (!isNewPrepareInfo) {
                this._newFiles = 0;
                this._changesInfo.appFilesChanged = yield this.hasChangedAppFiles(projectData);
                this._changesInfo.packageChanged = this.isProjectFileChanged(projectData, platform);
                const platformResourcesDir = path.join(projectData.appResourcesDirectoryPath, platformData.normalizedPlatformName);
                this._changesInfo.appResourcesChanged = this.containsNewerFiles(platformResourcesDir, null, projectData);
                this._changesInfo.nativeChanged = this.containsNewerFiles(path.join(projectData.projectDir, constants_1.NODE_MODULES_FOLDER_NAME), path.join(projectData.projectDir, constants_1.NODE_MODULES_FOLDER_NAME, "tns-ios-inspector"), projectData, this.fileChangeRequiresBuild);
                if (this._newFiles > 0 || this._changesInfo.nativeChanged) {
                    this._changesInfo.modulesChanged = true;
                }
                if (platform === this.$devicePlatformsConstants.iOS.toLowerCase()) {
                    this._changesInfo.configChanged = this.filesChanged([path.join(platformResourcesDir, platformData.configurationFileName),
                        path.join(platformResourcesDir, "LaunchScreen.storyboard"),
                        path.join(platformResourcesDir, constants_1.BUILD_XCCONFIG_FILE_NAME)
                    ]);
                }
                else {
                    this._changesInfo.configChanged = this.filesChanged([
                        path.join(platformResourcesDir, platformData.configurationFileName),
                        path.join(platformResourcesDir, constants_1.APP_GRADLE_FILE_NAME)
                    ]);
                }
            }
            const projectService = platformData.platformProjectService;
            yield projectService.checkForChanges(this._changesInfo, projectChangesOptions, projectData);
            if (projectChangesOptions.bundle !== this._prepareInfo.bundle || projectChangesOptions.release !== this._prepareInfo.release) {
                this._changesInfo.appFilesChanged = true;
                this._changesInfo.appResourcesChanged = true;
                this._changesInfo.modulesChanged = true;
                this._changesInfo.bundleChanged = true;
                this._changesInfo.configChanged = true;
                this._prepareInfo.release = projectChangesOptions.release;
                this._prepareInfo.bundle = projectChangesOptions.bundle;
            }
            if (this._changesInfo.packageChanged) {
                this._changesInfo.modulesChanged = true;
            }
            if (this._changesInfo.modulesChanged || this._changesInfo.appResourcesChanged) {
                this._changesInfo.configChanged = true;
            }
            if (this._changesInfo.hasChanges) {
                this._prepareInfo.changesRequireBuild = this._changesInfo.changesRequireBuild;
                this._prepareInfo.time = new Date().toString();
                if (this._prepareInfo.changesRequireBuild) {
                    this._prepareInfo.changesRequireBuildTime = this._prepareInfo.time;
                }
                this._prepareInfo.projectFileHash = this.getProjectFileStrippedHash(projectData, platform);
            }
            this._changesInfo.nativePlatformStatus = this._prepareInfo.nativePlatformStatus;
            return this._changesInfo;
        });
    }
    getPrepareInfoFilePath(platform, projectData) {
        const platformData = this.$platformsData.getPlatformData(platform, projectData);
        const prepareInfoFilePath = path.join(platformData.projectRoot, prepareInfoFileName);
        return prepareInfoFilePath;
    }
    getPrepareInfo(platform, projectData) {
        const prepareInfoFilePath = this.getPrepareInfoFilePath(platform, projectData);
        let prepareInfo = null;
        if (this.$fs.exists(prepareInfoFilePath)) {
            try {
                prepareInfo = this.$fs.readJson(prepareInfoFilePath);
            }
            catch (e) {
                prepareInfo = null;
            }
        }
        return prepareInfo;
    }
    savePrepareInfo(platform, projectData) {
        const prepareInfoFilePath = this.getPrepareInfoFilePath(platform, projectData);
        this.$fs.writeJson(prepareInfoFilePath, this._prepareInfo);
    }
    setNativePlatformStatus(platform, projectData, addedPlatform) {
        this._prepareInfo = this._prepareInfo || this.getPrepareInfo(platform, projectData);
        if (this._prepareInfo) {
            this._prepareInfo.nativePlatformStatus = addedPlatform.nativePlatformStatus;
            this.savePrepareInfo(platform, projectData);
        }
    }
    ensurePrepareInfo(platform, projectData, projectChangesOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            this._prepareInfo = this.getPrepareInfo(platform, projectData);
            if (this._prepareInfo) {
                this._prepareInfo.nativePlatformStatus = this._prepareInfo.nativePlatformStatus && this._prepareInfo.nativePlatformStatus < projectChangesOptions.nativePlatformStatus ?
                    projectChangesOptions.nativePlatformStatus :
                    this._prepareInfo.nativePlatformStatus || projectChangesOptions.nativePlatformStatus;
                const platformData = this.$platformsData.getPlatformData(platform, projectData);
                const prepareInfoFile = path.join(platformData.projectRoot, prepareInfoFileName);
                this._outputProjectMtime = this.$fs.getFsStats(prepareInfoFile).mtime.getTime();
                this._outputProjectCTime = this.$fs.getFsStats(prepareInfoFile).ctime.getTime();
                return false;
            }
            this._prepareInfo = {
                time: "",
                nativePlatformStatus: projectChangesOptions.nativePlatformStatus,
                bundle: projectChangesOptions.bundle,
                release: projectChangesOptions.release,
                changesRequireBuild: true,
                projectFileHash: this.getProjectFileStrippedHash(projectData, platform),
                changesRequireBuildTime: null,
                appFilesHashes: yield this.$filesHashService.generateHashes(this.getAppFiles(projectData))
            };
            this._outputProjectMtime = 0;
            this._outputProjectCTime = 0;
            this._changesInfo = this._changesInfo || new ProjectChangesInfo();
            this._changesInfo.appFilesChanged = true;
            this._changesInfo.appResourcesChanged = true;
            this._changesInfo.modulesChanged = true;
            this._changesInfo.configChanged = true;
            return true;
        });
    }
    getProjectFileStrippedHash(projectData, platform) {
        platform = platform.toLowerCase();
        const projectFilePath = path.join(projectData.projectDir, constants_1.PACKAGE_JSON_FILE_NAME);
        const projectFileContents = this.$fs.readJson(projectFilePath);
        _(this.$devicePlatformsConstants)
            .keys()
            .map(k => k.toLowerCase())
            .difference([platform])
            .each(otherPlatform => {
            delete projectFileContents.nativescript[`tns-${otherPlatform}`];
        });
        return helpers_1.getHash(JSON.stringify(projectFileContents));
    }
    isProjectFileChanged(projectData, platform) {
        const projectFileStrippedContentsHash = this.getProjectFileStrippedHash(projectData, platform);
        const prepareInfo = this.getPrepareInfo(platform, projectData);
        return projectFileStrippedContentsHash !== prepareInfo.projectFileHash;
    }
    filesChanged(files) {
        for (const file of files) {
            if (this.$fs.exists(file)) {
                const fileStats = this.$fs.getFsStats(file);
                if (fileStats.mtime.getTime() >= this._outputProjectMtime || fileStats.ctime.getTime() >= this._outputProjectCTime) {
                    return true;
                }
            }
        }
        return false;
    }
    containsNewerFiles(dir, skipDir, projectData, processFunc) {
        const dirName = path.basename(dir);
        if (_.startsWith(dirName, '.')) {
            return false;
        }
        const dirFileStat = this.$fs.getFsStats(dir);
        if (this.isFileModified(dirFileStat, dir)) {
            return true;
        }
        const files = this.$fs.readDirectory(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            if (filePath === skipDir) {
                continue;
            }
            const fileStats = this.$fs.getFsStats(filePath);
            const changed = this.isFileModified(fileStats, filePath);
            if (changed) {
                if (processFunc) {
                    this._newFiles++;
                    const filePathRelative = path.relative(projectData.projectDir, filePath);
                    if (processFunc.call(this, filePathRelative, projectData)) {
                        return true;
                    }
                }
                else {
                    return true;
                }
            }
            if (fileStats.isDirectory()) {
                if (this.containsNewerFiles(filePath, skipDir, projectData, processFunc)) {
                    return true;
                }
            }
        }
        return false;
    }
    isFileModified(filePathStat, filePath) {
        let changed = filePathStat.mtime.getTime() >= this._outputProjectMtime ||
            filePathStat.ctime.getTime() >= this._outputProjectCTime;
        if (!changed) {
            const lFileStats = this.$fs.getLsStats(filePath);
            changed = lFileStats.mtime.getTime() >= this._outputProjectMtime ||
                lFileStats.ctime.getTime() >= this._outputProjectCTime;
        }
        return changed;
    }
    fileChangeRequiresBuild(file, projectData) {
        if (path.basename(file) === "package.json") {
            return true;
        }
        const projectDir = projectData.projectDir;
        if (_.startsWith(path.join(projectDir, file), projectData.appResourcesDirectoryPath)) {
            return true;
        }
        if (_.startsWith(file, constants_1.NODE_MODULES_FOLDER_NAME)) {
            let filePath = file;
            while (filePath !== constants_1.NODE_MODULES_FOLDER_NAME) {
                filePath = path.dirname(filePath);
                const fullFilePath = path.join(projectDir, path.join(filePath, "package.json"));
                if (this.$fs.exists(fullFilePath)) {
                    const json = this.$fs.readJson(fullFilePath);
                    if (json["nativescript"] && _.startsWith(file, path.join(filePath, "platforms"))) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    getAppFiles(projectData) {
        return this.$fs.enumerateFilesInDirectorySync(projectData.appDirectoryPath, (filePath, stat) => filePath !== projectData.appResourcesDirectoryPath);
    }
    hasChangedAppFiles(projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = this.getAppFiles(projectData);
            const changedFiles = yield this.$filesHashService.getChanges(files, this._prepareInfo.appFilesHashes || {});
            const hasChanges = changedFiles && _.keys(changedFiles).length > 0;
            if (hasChanges) {
                this._prepareInfo.appFilesHashes = yield this.$filesHashService.generateHashes(files);
            }
            return hasChanges;
        });
    }
}
exports.ProjectChangesService = ProjectChangesService;
$injector.register("projectChangesService", ProjectChangesService);
