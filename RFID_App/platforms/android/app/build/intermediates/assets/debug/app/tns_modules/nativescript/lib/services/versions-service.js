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
const semver = require("semver");
const path = require("path");
var VersionInformationType;
(function (VersionInformationType) {
    VersionInformationType["UpToDate"] = "UpToDate";
    VersionInformationType["UpdateAvailable"] = "UpdateAvailable";
    VersionInformationType["NotInstalled"] = "NotInstalled";
})(VersionInformationType = exports.VersionInformationType || (exports.VersionInformationType = {}));
class VersionsService {
    constructor($fs, $npmInstallationManager, $injector, $logger, $staticConfig, $pluginsService, $terminalSpinnerService) {
        this.$fs = $fs;
        this.$npmInstallationManager = $npmInstallationManager;
        this.$injector = $injector;
        this.$logger = $logger;
        this.$staticConfig = $staticConfig;
        this.$pluginsService = $pluginsService;
        this.$terminalSpinnerService = $terminalSpinnerService;
        this.projectData = this.getProjectData();
    }
    getNativescriptCliVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentCliVersion = this.$staticConfig.version;
            const latestCliVersion = yield this.$npmInstallationManager.getLatestVersion(constants.NATIVESCRIPT_KEY_NAME);
            return {
                componentName: constants.NATIVESCRIPT_KEY_NAME,
                currentVersion: currentCliVersion,
                latestVersion: latestCliVersion
            };
        });
    }
    getTnsCoreModulesVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const latestTnsCoreModulesVersion = yield this.$npmInstallationManager.getLatestVersion(constants.TNS_CORE_MODULES_NAME);
            const nativescriptCoreModulesInfo = {
                componentName: constants.TNS_CORE_MODULES_NAME,
                latestVersion: latestTnsCoreModulesVersion
            };
            if (this.projectData) {
                const nodeModulesPath = path.join(this.projectData.projectDir, constants.NODE_MODULES_FOLDER_NAME);
                const tnsCoreModulesPath = path.join(nodeModulesPath, constants.TNS_CORE_MODULES_NAME);
                if (!this.$fs.exists(nodeModulesPath) ||
                    !this.$fs.exists(tnsCoreModulesPath)) {
                    yield this.$pluginsService.ensureAllDependenciesAreInstalled(this.projectData);
                }
                const currentTnsCoreModulesVersion = this.$fs.readJson(path.join(tnsCoreModulesPath, constants.PACKAGE_JSON_FILE_NAME)).version;
                nativescriptCoreModulesInfo.currentVersion = currentTnsCoreModulesVersion;
            }
            return nativescriptCoreModulesInfo;
        });
    }
    getRuntimesVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            const runtimes = [
                constants.TNS_ANDROID_RUNTIME_NAME,
                constants.TNS_IOS_RUNTIME_NAME
            ];
            let projectConfig;
            if (this.projectData) {
                projectConfig = this.$fs.readJson(this.projectData.projectFilePath);
            }
            const runtimesVersions = yield Promise.all(runtimes.map((runtime) => __awaiter(this, void 0, void 0, function* () {
                const latestRuntimeVersion = yield this.$npmInstallationManager.getLatestVersion(runtime);
                const runtimeInformation = {
                    componentName: runtime,
                    latestVersion: latestRuntimeVersion
                };
                if (projectConfig) {
                    const projectRuntimeInformation = projectConfig.nativescript && projectConfig.nativescript[runtime];
                    if (projectRuntimeInformation) {
                        const runtimeVersionInProject = projectRuntimeInformation.version;
                        runtimeInformation.currentVersion = runtimeVersionInProject;
                    }
                }
                return runtimeInformation;
            })));
            return runtimesVersions;
        });
    }
    getAllComponentsVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            let allComponents = [];
            const nativescriptCliInformation = yield this.getNativescriptCliVersion();
            if (nativescriptCliInformation) {
                allComponents.push(nativescriptCliInformation);
            }
            if (this.projectData) {
                const nativescriptCoreModulesInformation = yield this.getTnsCoreModulesVersion();
                if (nativescriptCoreModulesInformation) {
                    allComponents.push(nativescriptCoreModulesInformation);
                }
                const runtimesVersions = yield this.getRuntimesVersions();
                allComponents = allComponents.concat(runtimesVersions);
            }
            return allComponents
                .map(componentInformation => {
                if (componentInformation.currentVersion) {
                    if (this.hasUpdate(componentInformation)) {
                        componentInformation.type = VersionInformationType.UpdateAvailable;
                        componentInformation.message = `${VersionsService.UPDATE_AVAILABLE_MESSAGE} for component ${componentInformation.componentName}. Your current version is ${componentInformation.currentVersion} and the latest available version is ${componentInformation.latestVersion}.`;
                    }
                    else {
                        componentInformation.type = VersionInformationType.UpToDate;
                        componentInformation.message = `Component ${componentInformation.componentName} has ${componentInformation.currentVersion} version and is ${VersionsService.UP_TO_DATE_MESSAGE}.`;
                    }
                }
                else {
                    componentInformation.type = VersionInformationType.NotInstalled;
                    componentInformation.message = `Component ${componentInformation.componentName} is ${VersionsService.NOT_INSTALLED_MESSAGE}.`;
                }
                return componentInformation;
            });
        });
    }
    printVersionsInformation() {
        return __awaiter(this, void 0, void 0, function* () {
            const versionsInformation = yield this.$terminalSpinnerService.execute({
                text: `Getting NativeScript components versions information...`
            }, () => this.getAllComponentsVersions());
            if (!helpers.isInteractive()) {
                versionsInformation.map(componentInformation => this.$logger.out(componentInformation.message));
            }
            _.forEach(versionsInformation, componentInformation => {
                const spinner = this.$terminalSpinnerService.createSpinner();
                spinner.text = componentInformation.message;
                switch (componentInformation.type) {
                    case VersionInformationType.UpToDate:
                        spinner.succeed();
                        break;
                    case VersionInformationType.UpdateAvailable:
                        spinner.warn();
                        break;
                    case VersionInformationType.NotInstalled:
                        spinner.fail();
                        break;
                }
            });
        });
    }
    getProjectData() {
        try {
            const projectData = this.$injector.resolve("projectData");
            projectData.initializeProjectData();
            return projectData;
        }
        catch (error) {
            return null;
        }
    }
    hasUpdate(component) {
        return semver.lt(component.currentVersion, component.latestVersion);
    }
}
VersionsService.UP_TO_DATE_MESSAGE = "up to date";
VersionsService.UPDATE_AVAILABLE_MESSAGE = "Update available";
VersionsService.NOT_INSTALLED_MESSAGE = "not installed";
$injector.register("versionsService", VersionsService);
