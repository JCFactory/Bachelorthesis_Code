"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants = require("./constants");
const path = require("path");
const helpers_1 = require("./common/helpers");
const os_1 = require("os");
class ProjectData {
    constructor($fs, $errors, $projectHelper, $staticConfig, $options, $logger, $androidResourcesMigrationService, $devicePlatformsConstants) {
        this.$fs = $fs;
        this.$errors = $errors;
        this.$projectHelper = $projectHelper;
        this.$staticConfig = $staticConfig;
        this.$options = $options;
        this.$logger = $logger;
        this.$androidResourcesMigrationService = $androidResourcesMigrationService;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
    }
    initializeProjectData(projectDir) {
        projectDir = projectDir || this.$projectHelper.projectDir;
        if (projectDir) {
            const projectFilePath = this.getProjectFilePath(projectDir);
            if (this.$fs.exists(projectFilePath)) {
                const packageJsonContent = this.$fs.readText(projectFilePath);
                const nsConfigContent = this.getNsConfigContent(projectDir);
                this.initializeProjectDataFromContent(packageJsonContent, nsConfigContent, projectDir);
            }
            return;
        }
        this.errorInvalidProject(projectDir);
    }
    initializeProjectDataFromContent(packageJsonContent, nsconfigContent, projectDir) {
        projectDir = projectDir || this.$projectHelper.projectDir || "";
        const projectFilePath = this.getProjectFilePath(projectDir);
        let nsData = null;
        let nsConfig = null;
        let packageJsonData = null;
        try {
            packageJsonData = helpers_1.parseJson(packageJsonContent);
            nsData = packageJsonData[this.$staticConfig.CLIENT_NAME_KEY_IN_PROJECT_FILE];
        }
        catch (err) {
            this.$errors.failWithoutHelp(`The project file ${this.projectFilePath} is corrupted. ${os_1.EOL}` +
                `Consider restoring an earlier version from your source control or backup.${os_1.EOL}` +
                `Additional technical info: ${err.toString()}`);
        }
        try {
            nsConfig = nsconfigContent ? helpers_1.parseJson(nsconfigContent) : null;
        }
        catch (err) {
            this.$errors.failWithoutHelp(`The NativeScript configuration file ${constants.CONFIG_NS_FILE_NAME} is corrupted. ${os_1.EOL}` +
                `Consider restoring an earlier version from your source control or backup.${os_1.EOL}` +
                `Additional technical info: ${err.toString()}`);
        }
        if (nsData) {
            this.projectDir = projectDir;
            this.projectName = this.$projectHelper.sanitizeName(path.basename(projectDir));
            this.platformsDir = path.join(projectDir, constants.PLATFORMS_DIR_NAME);
            this.projectFilePath = projectFilePath;
            this.projectId = nsData.id;
            this.dependencies = packageJsonData.dependencies;
            this.devDependencies = packageJsonData.devDependencies;
            this.projectType = this.getProjectType();
            this.nsConfig = nsConfig;
            this.appDirectoryPath = this.getAppDirectoryPath();
            this.appResourcesDirectoryPath = this.getAppResourcesDirectoryPath();
            this.androidManifestPath = this.getPathToAndroidManifest(this.appResourcesDirectoryPath);
            this.gradleFilesDirectoryPath = path.join(this.appResourcesDirectoryPath, this.$devicePlatformsConstants.Android);
            this.appGradlePath = path.join(this.gradleFilesDirectoryPath, constants.APP_GRADLE_FILE_NAME);
            this.infoPlistPath = path.join(this.appResourcesDirectoryPath, this.$devicePlatformsConstants.iOS, constants.INFO_PLIST_FILE_NAME);
            this.buildXcconfigPath = path.join(this.appResourcesDirectoryPath, this.$devicePlatformsConstants.iOS, constants.BUILD_XCCONFIG_FILE_NAME);
            return;
        }
        this.errorInvalidProject(projectDir);
    }
    getPathToAndroidManifest(appResourcesDir) {
        const androidDirPath = path.join(appResourcesDir, this.$devicePlatformsConstants.Android);
        const androidManifestDir = this.$androidResourcesMigrationService.hasMigrated(appResourcesDir) ?
            path.join(androidDirPath, constants.SRC_DIR, constants.MAIN_DIR) :
            androidDirPath;
        return path.join(androidManifestDir, constants.MANIFEST_FILE_NAME);
    }
    errorInvalidProject(projectDir) {
        const currentDir = path.resolve(".");
        this.$logger.trace(`Unable to find project. projectDir: ${projectDir}, options.path: ${this.$options.path}, ${currentDir}`);
        this.$errors.fail("No project found at or above '%s' and neither was a --path specified.", projectDir || this.$options.path || currentDir);
    }
    getProjectFilePath(projectDir) {
        return path.join(projectDir, this.$staticConfig.PROJECT_FILE_NAME);
    }
    getAppResourcesDirectoryPath(projectDir) {
        const appResourcesRelativePath = this.getAppResourcesRelativeDirectoryPath();
        return this.resolveToProjectDir(appResourcesRelativePath, projectDir);
    }
    getAppResourcesRelativeDirectoryPath() {
        if (this.nsConfig && this.nsConfig[constants.CONFIG_NS_APP_RESOURCES_ENTRY]) {
            return this.nsConfig[constants.CONFIG_NS_APP_RESOURCES_ENTRY];
        }
        return path.join(this.getAppDirectoryRelativePath(), constants.APP_RESOURCES_FOLDER_NAME);
    }
    getAppDirectoryPath(projectDir) {
        const appRelativePath = this.getAppDirectoryRelativePath();
        return this.resolveToProjectDir(appRelativePath, projectDir);
    }
    getAppDirectoryRelativePath() {
        if (this.nsConfig && this.nsConfig[constants.CONFIG_NS_APP_ENTRY]) {
            return this.nsConfig[constants.CONFIG_NS_APP_ENTRY];
        }
        return constants.APP_FOLDER_NAME;
    }
    getNsConfigContent(projectDir) {
        if (!projectDir) {
            return null;
        }
        const configNSFilePath = path.join(projectDir, this.getNsConfigRelativePath());
        if (!this.$fs.exists(configNSFilePath)) {
            return null;
        }
        return this.$fs.readText(configNSFilePath);
    }
    getNsConfigRelativePath() {
        return constants.CONFIG_NS_FILE_NAME;
    }
    resolveToProjectDir(pathToResolve, projectDir) {
        if (!projectDir) {
            projectDir = this.projectDir;
        }
        if (!projectDir) {
            return null;
        }
        return path.resolve(projectDir, pathToResolve);
    }
    getProjectType() {
        let detectedProjectType = _.find(ProjectData.PROJECT_TYPES, (projectType) => projectType.isDefaultProjectType).type;
        const deps = _.keys(this.dependencies).concat(_.keys(this.devDependencies));
        _.each(ProjectData.PROJECT_TYPES, projectType => {
            if (_.some(projectType.requiredDependencies, requiredDependency => deps.indexOf(requiredDependency) !== -1)) {
                detectedProjectType = projectType.type;
                return false;
            }
        });
        return detectedProjectType;
    }
}
ProjectData.PROJECT_TYPES = [
    {
        type: "Pure JavaScript",
        isDefaultProjectType: true
    },
    {
        type: "Angular",
        requiredDependencies: ["@angular/core", "nativescript-angular"]
    },
    {
        type: "Vue.js",
        requiredDependencies: ["nativescript-vue"]
    },
    {
        type: "Pure TypeScript",
        requiredDependencies: ["typescript", "nativescript-dev-typescript"]
    }
];
exports.ProjectData = ProjectData;
$injector.register("projectData", ProjectData);
