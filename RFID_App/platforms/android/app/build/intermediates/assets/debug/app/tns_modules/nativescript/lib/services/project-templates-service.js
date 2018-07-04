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
const constants = require("../constants");
const util_1 = require("util");
temp.track();
class ProjectTemplatesService {
    constructor($analyticsService, $fs, $logger, $npmInstallationManager, $errors) {
        this.$analyticsService = $analyticsService;
        this.$fs = $fs;
        this.$logger = $logger;
        this.$npmInstallationManager = $npmInstallationManager;
        this.$errors = $errors;
    }
    prepareTemplate(originalTemplateName, projectDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = originalTemplateName.split("@"), name = data[0], version = data[1];
            const templateName = constants.RESERVED_TEMPLATE_NAMES[name.toLowerCase()] || name;
            const templatePath = yield this.prepareNativeScriptTemplate(templateName, version, projectDir);
            yield this.$analyticsService.track("Template used for project creation", templateName);
            const templateNameToBeTracked = this.getTemplateNameToBeTracked(templateName, templatePath);
            const templateVersion = this.getTemplateVersion(templatePath);
            if (templateNameToBeTracked) {
                yield this.$analyticsService.trackEventActionInGoogleAnalytics({
                    action: "Create project",
                    isForDevice: null,
                    additionalData: templateNameToBeTracked
                });
                yield this.$analyticsService.trackEventActionInGoogleAnalytics({
                    action: "Using Template",
                    additionalData: `${templateNameToBeTracked}${constants.AnalyticsEventLabelDelimiter}${templateVersion}`
                });
            }
            this.$fs.deleteDirectory(path.join(templatePath, constants.NODE_MODULES_FOLDER_NAME));
            return { templatePath, templateVersion };
        });
    }
    getTemplateVersion(templatePath) {
        this.$logger.trace(`Checking the NativeScript version of the template located at ${templatePath}.`);
        const pathToPackageJson = path.join(templatePath, constants.PACKAGE_JSON_FILE_NAME);
        if (this.$fs.exists(pathToPackageJson)) {
            const packageJsonContent = this.$fs.readJson(pathToPackageJson);
            const templateVersionFromPackageJson = packageJsonContent && packageJsonContent.nativescript && packageJsonContent.nativescript.templateVersion;
            if (templateVersionFromPackageJson) {
                this.$logger.trace(`The template ${templatePath} has version ${templateVersionFromPackageJson}.`);
                if (_.values(constants.TemplateVersions).indexOf(templateVersionFromPackageJson) === -1) {
                    this.$errors.failWithoutHelp(util_1.format(constants.ProjectTemplateErrors.InvalidTemplateVersionStringFormat, templatePath, templateVersionFromPackageJson));
                }
                return templateVersionFromPackageJson;
            }
        }
        const defaultVersion = constants.TemplateVersions.v1;
        this.$logger.trace(`The template ${templatePath} does not specify version or we were unable to find out the version. Using default one ${defaultVersion}`);
        return defaultVersion;
    }
    prepareNativeScriptTemplate(templateName, version, projectDir) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$logger.trace(`Using NativeScript verified template: ${templateName} with version ${version}.`);
            return this.$npmInstallationManager.install(templateName, projectDir, { version: version, dependencyType: "save" });
        });
    }
    getTemplateNameToBeTracked(templateName, realTemplatePath) {
        try {
            if (this.$fs.exists(templateName)) {
                const pathToPackageJson = path.join(realTemplatePath, constants.PACKAGE_JSON_FILE_NAME);
                let templateNameToTrack = path.basename(templateName);
                if (this.$fs.exists(pathToPackageJson)) {
                    const templatePackageJsonContent = this.$fs.readJson(pathToPackageJson);
                    templateNameToTrack = templatePackageJsonContent.name;
                }
                return `${constants.ANALYTICS_LOCAL_TEMPLATE_PREFIX}${templateNameToTrack}`;
            }
            return templateName;
        }
        catch (err) {
            this.$logger.trace(`Unable to get template name to be tracked, error is: ${err}`);
        }
    }
}
exports.ProjectTemplatesService = ProjectTemplatesService;
$injector.register("projectTemplatesService", ProjectTemplatesService);
