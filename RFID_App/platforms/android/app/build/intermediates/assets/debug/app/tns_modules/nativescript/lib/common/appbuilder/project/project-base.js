"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const path = require("path");
const constants_1 = require("../../constants");
const decorators_1 = require("../../decorators");
class ProjectBase {
    constructor($cordovaProjectCapabilities, $errors, $fs, $logger, $nativeScriptProjectCapabilities, $options, $projectConstants, $staticConfig) {
        this.$cordovaProjectCapabilities = $cordovaProjectCapabilities;
        this.$errors = $errors;
        this.$fs = $fs;
        this.$logger = $logger;
        this.$nativeScriptProjectCapabilities = $nativeScriptProjectCapabilities;
        this.$options = $options;
        this.$projectConstants = $projectConstants;
        this.$staticConfig = $staticConfig;
        this._shouldSaveProject = false;
        this._hasBuildConfigurations = false;
        this.configurationSpecificData = Object.create(null);
    }
    getShouldSaveProject() {
        return this._shouldSaveProject;
    }
    setShouldSaveProject(shouldSaveProject) {
        this._shouldSaveProject = shouldSaveProject;
    }
    get projectData() {
        this.readProjectData();
        return this._projectData;
    }
    set projectData(projectData) {
        this._projectData = projectData;
    }
    getProjectDir() {
        return this.projectDir;
    }
    get capabilities() {
        const projectData = this.projectData;
        if (projectData) {
            if (projectData.Framework && projectData.Framework.toLowerCase() === constants_1.TARGET_FRAMEWORK_IDENTIFIERS.NativeScript.toLowerCase()) {
                return this.$nativeScriptProjectCapabilities;
            }
            else if (projectData.Framework && projectData.Framework.toLowerCase() === constants_1.TARGET_FRAMEWORK_IDENTIFIERS.Cordova.toLowerCase()) {
                return this.$cordovaProjectCapabilities;
            }
        }
        return null;
    }
    get hasBuildConfigurations() {
        return this._hasBuildConfigurations;
    }
    get projectInformation() {
        return {
            projectData: this.projectData,
            configurationSpecificData: this.configurationSpecificData,
            hasBuildConfigurations: this.hasBuildConfigurations,
            configurations: _.keys(this.configurationSpecificData)
        };
    }
    getAppIdentifierForPlatform(platform) {
        let platformSpecificAppIdentifier = this.projectData.AppIdentifier;
        if (platform &&
            platform.toLowerCase() === this.$projectConstants.ANDROID_PLATFORM_NAME.toLowerCase() &&
            this.projectData.Framework === constants_1.TARGET_FRAMEWORK_IDENTIFIERS.Cordova) {
            const pathToAndroidResources = path.join(this.projectDir, this.$staticConfig.APP_RESOURCES_DIR_NAME, this.$projectConstants.ANDROID_PLATFORM_NAME);
            const pathToAndroidManifest = path.join(pathToAndroidResources, ProjectBase.ANDROID_MANIFEST_NAME);
            const appIdentifierInAndroidManifest = this.getAppIdentifierFromConfigFile(pathToAndroidManifest, /package\s*=\s*"(\S*)"/);
            if (appIdentifierInAndroidManifest && appIdentifierInAndroidManifest !== ProjectBase.APP_IDENTIFIER_PLACEHOLDER) {
                platformSpecificAppIdentifier = appIdentifierInAndroidManifest;
            }
        }
        return platformSpecificAppIdentifier;
    }
    readProjectData() {
        const projectDir = this.getProjectDir();
        this.setShouldSaveProject(false);
        if (projectDir) {
            const projectFilePath = path.join(projectDir, this.$projectConstants.PROJECT_FILE);
            try {
                this.projectData = this.getProjectData(projectFilePath);
                this.validate();
                _.each(this.$fs.enumerateFilesInDirectorySync(projectDir), (configProjectFile) => {
                    const configMatch = path.basename(configProjectFile).match(ProjectBase.CONFIGURATION_FROM_FILE_NAME_REGEX);
                    if (configMatch && configMatch.length > 1) {
                        const configurationName = configMatch[1];
                        const configProjectContent = this.$fs.readJson(configProjectFile), configurationLowerCase = configurationName.toLowerCase();
                        this.configurationSpecificData[configurationLowerCase] = _.merge(_.cloneDeep(this._projectData), configProjectContent);
                        this._hasBuildConfigurations = true;
                    }
                });
            }
            catch (err) {
                if (err.message === "FUTURE_PROJECT_VER") {
                    this.$errors.failWithoutHelp("This project is created by a newer version of AppBuilder. Upgrade AppBuilder CLI to work with it.");
                }
                this.$errors.failWithoutHelp("The project file %s is corrupted." + os_1.EOL +
                    "Consider restoring an earlier version from your source control or backup." + os_1.EOL +
                    "To create a new one with the default settings, delete this file and run $ appbuilder init hybrid." + os_1.EOL +
                    "Additional technical information: %s", projectFilePath, err.toString());
            }
            this.saveProjectIfNeeded();
        }
    }
    getProjectData(projectFilePath) {
        const data = this.$fs.readJson(projectFilePath);
        if (data.projectVersion && data.projectVersion.toString() !== "1") {
            this.$errors.fail("FUTURE_PROJECT_VER");
        }
        if (!_.has(data, "Framework")) {
            if (_.has(data, "projectType")) {
                data["Framework"] = data["projectType"];
                delete data["projectType"];
            }
            else {
                data["Framework"] = constants_1.TARGET_FRAMEWORK_IDENTIFIERS.Cordova;
            }
            this.setShouldSaveProject(true);
        }
        return data;
    }
    getAppIdentifierFromConfigFile(pathToConfigFile, regExp) {
        if (this.$fs.exists(pathToConfigFile)) {
            const fileContent = this.$fs.readText(pathToConfigFile);
            const matches = fileContent.match(regExp);
            if (matches && matches[1]) {
                return matches[1];
            }
        }
        return null;
    }
}
ProjectBase.VALID_CONFIGURATION_CHARACTERS_REGEX = "[-_A-Za-z0-9]";
ProjectBase.CONFIGURATION_FROM_FILE_NAME_REGEX = new RegExp(`^[.](${ProjectBase.VALID_CONFIGURATION_CHARACTERS_REGEX}+?)[.]abproject$`, "i");
ProjectBase.ANDROID_MANIFEST_NAME = "AndroidManifest.xml";
ProjectBase.APP_IDENTIFIER_PLACEHOLDER = "$AppIdentifier$";
__decorate([
    decorators_1.cache()
], ProjectBase.prototype, "getAppIdentifierForPlatform", null);
exports.ProjectBase = ProjectBase;
