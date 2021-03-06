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
const constants = require("../constants");
const helpers = require("../common/helpers");
const path = require("path");
const semver = require("semver");
class InitService {
    constructor($fs, $logger, $options, $injector, $staticConfig, $projectHelper, $prompter, $npm, $npmInstallationManager) {
        this.$fs = $fs;
        this.$logger = $logger;
        this.$options = $options;
        this.$injector = $injector;
        this.$staticConfig = $staticConfig;
        this.$projectHelper = $projectHelper;
        this.$prompter = $prompter;
        this.$npm = $npm;
        this.$npmInstallationManager = $npmInstallationManager;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            let projectData = {};
            if (this.$fs.exists(this.projectFilePath)) {
                projectData = this.$fs.readJson(this.projectFilePath);
            }
            const projectDataBackup = _.extend({}, projectData);
            if (!projectData[this.$staticConfig.CLIENT_NAME_KEY_IN_PROJECT_FILE]) {
                projectData[this.$staticConfig.CLIENT_NAME_KEY_IN_PROJECT_FILE] = {};
                this.$fs.writeJson(this.projectFilePath, projectData);
            }
            try {
                projectData[this.$staticConfig.CLIENT_NAME_KEY_IN_PROJECT_FILE]["id"] = yield this.getProjectId();
                if (this.$options.frameworkName && this.$options.frameworkVersion) {
                    const currentPlatformData = projectData[this.$staticConfig.CLIENT_NAME_KEY_IN_PROJECT_FILE][this.$options.frameworkName] || {};
                    projectData[this.$staticConfig.CLIENT_NAME_KEY_IN_PROJECT_FILE][this.$options.frameworkName] = _.extend(currentPlatformData, this.buildVersionData(this.$options.frameworkVersion));
                }
                else {
                    const $platformsData = this.$injector.resolve("platformsData");
                    const $projectData = this.$injector.resolve("projectData");
                    $projectData.initializeProjectData(path.dirname(this.projectFilePath));
                    for (const platform of $platformsData.platformsNames) {
                        const platformData = $platformsData.getPlatformData(platform, $projectData);
                        if (!platformData.targetedOS || (platformData.targetedOS && _.includes(platformData.targetedOS, process.platform))) {
                            const currentPlatformData = projectData[this.$staticConfig.CLIENT_NAME_KEY_IN_PROJECT_FILE][platformData.frameworkPackageName] || {};
                            projectData[this.$staticConfig.CLIENT_NAME_KEY_IN_PROJECT_FILE][platformData.frameworkPackageName] = _.extend(currentPlatformData, yield this.getVersionData(platformData.frameworkPackageName));
                        }
                    }
                }
                const dependencies = projectData.dependencies;
                if (!dependencies) {
                    projectData.dependencies = Object.create(null);
                }
                const tnsCoreModulesVersionInPackageJson = this.useDefaultValue ? projectData.dependencies[constants.TNS_CORE_MODULES_NAME] : null;
                projectData.dependencies[constants.TNS_CORE_MODULES_NAME] = tnsCoreModulesVersionInPackageJson || (yield this.getVersionData(constants.TNS_CORE_MODULES_NAME))["version"];
                this.$fs.writeJson(this.projectFilePath, projectData);
            }
            catch (err) {
                this.$fs.writeJson(this.projectFilePath, projectDataBackup);
                throw err;
            }
            this.$logger.out("Project successfully initialized.");
        });
    }
    get projectFilePath() {
        if (!this._projectFilePath) {
            const projectDir = path.resolve(this.$options.path || ".");
            this._projectFilePath = path.join(projectDir, constants.PACKAGE_JSON_FILE_NAME);
        }
        return this._projectFilePath;
    }
    getProjectId() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.$options.appid) {
                return this.$options.appid;
            }
            const defaultAppId = this.$projectHelper.generateDefaultAppId(path.basename(path.dirname(this.projectFilePath)), constants.DEFAULT_APP_IDENTIFIER_PREFIX);
            if (this.useDefaultValue) {
                return defaultAppId;
            }
            return yield this.$prompter.getString("Id:", { defaultAction: () => defaultAppId });
        });
    }
    getVersionData(packageName) {
        return __awaiter(this, void 0, void 0, function* () {
            const latestVersion = yield this.$npmInstallationManager.getLatestCompatibleVersion(packageName);
            if (this.useDefaultValue) {
                return this.buildVersionData(latestVersion);
            }
            const allVersions = yield this.$npm.view(packageName, { "versions": true });
            const versions = _.filter(allVersions, (version) => semver.gte(version, InitService.MIN_SUPPORTED_FRAMEWORK_VERSIONS[packageName]));
            if (versions.length === 1) {
                this.$logger.info(`Only ${versions[0]} version is available for ${packageName}.`);
                return this.buildVersionData(versions[0]);
            }
            const sortedVersions = versions.sort(helpers.versionCompare).reverse();
            const version = yield this.$prompter.promptForChoice(`${packageName} version:`, sortedVersions);
            return this.buildVersionData(version);
        });
    }
    buildVersionData(version) {
        const result = {};
        result[InitService.VERSION_KEY_NAME] = version;
        return result;
    }
    get useDefaultValue() {
        return !helpers.isInteractive() || this.$options.force;
    }
}
InitService.MIN_SUPPORTED_FRAMEWORK_VERSIONS = {
    "tns-ios": "1.1.0",
    "tns-android": "1.1.0",
    "tns-core-modules": "1.2.0"
};
InitService.VERSION_KEY_NAME = "version";
exports.InitService = InitService;
$injector.register("initService", InitService);
