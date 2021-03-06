"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const decorators_1 = require("../common/decorators");
const constants = require("../constants");
const helpers_1 = require("../common/helpers");
class ExtensibilityService {
    constructor($fs, $logger, $npm, $settingsService, $requireService) {
        this.$fs = $fs;
        this.$logger = $logger;
        this.$npm = $npm;
        this.$settingsService = $settingsService;
        this.$requireService = $requireService;
    }
    get pathToExtensions() {
        return path.join(this.$settingsService.getProfileDir(), "extensions");
    }
    get pathToPackageJson() {
        return path.join(this.pathToExtensions, constants.PACKAGE_JSON_FILE_NAME);
    }
    installExtension(extensionName) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$logger.trace(`Start installation of extension '${extensionName}'.`);
            yield this.assertPackageJsonExists();
            const npmOpts = {
                save: true,
                ["save-exact"]: true
            };
            const localPath = path.resolve(extensionName);
            const packageName = this.$fs.exists(localPath) ? localPath : extensionName;
            const installResultInfo = yield this.$npm.install(packageName, this.pathToExtensions, npmOpts);
            this.$logger.trace(`Finished installation of extension '${extensionName}'. Trying to load it now.`);
            return this.getInstalledExtensionData(installResultInfo.name);
        });
    }
    uninstallExtension(extensionName) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$logger.trace(`Start uninstallation of extension '${extensionName}'.`);
            yield this.assertPackageJsonExists();
            yield this.$npm.uninstall(extensionName, { save: true }, this.pathToExtensions);
            this.$logger.trace(`Finished uninstallation of extension '${extensionName}'.`);
        });
    }
    getInstalledExtensionsData() {
        const installedExtensions = this.getInstalledExtensions();
        return _.keys(installedExtensions).map(installedExtension => this.getInstalledExtensionData(installedExtension));
    }
    loadExtensions() {
        this.$logger.trace("Loading extensions.");
        let dependencies = null;
        try {
            dependencies = this.getInstalledExtensions();
        }
        catch (err) {
            this.$logger.trace(`Error while getting installed dependencies: ${err.message}. No extensions will be loaded.`);
        }
        return _.keys(dependencies)
            .map(name => this.loadExtension(name));
    }
    getInstalledExtensions() {
        if (this.$fs.exists(this.pathToPackageJson)) {
            return this.$fs.readJson(this.pathToPackageJson).dependencies;
        }
        return null;
    }
    getInstalledExtensionData(extensionName) {
        const packageJsonData = this.getExtensionPackageJsonData(extensionName);
        const pathToExtension = this.getPathToExtension(extensionName);
        const docs = packageJsonData && packageJsonData.nativescript && packageJsonData.nativescript.docs && path.join(pathToExtension, packageJsonData.nativescript.docs);
        return {
            extensionName: packageJsonData.name,
            version: packageJsonData.version,
            docs,
            pathToExtension
        };
    }
    loadExtension(extensionName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.assertExtensionIsInstalled(extensionName);
                const pathToExtension = this.getPathToExtension(extensionName);
                this.$requireService.require(pathToExtension);
                return this.getInstalledExtensionData(extensionName);
            }
            catch (error) {
                this.$logger.warn(`Error while loading ${extensionName} is: ${error.message}`);
                const err = new Error(`Unable to load extension ${extensionName}. You will not be able to use the functionality that it adds. Error: ${error.message}`);
                err.extensionName = extensionName;
                throw err;
            }
        });
    }
    getExtensionNameWhereCommandIsRegistered(inputOpts) {
        return __awaiter(this, void 0, void 0, function* () {
            let allExtensions = [];
            try {
                const npmsResult = yield this.$npm.searchNpms("nativescript:extension");
                allExtensions = npmsResult.results || [];
            }
            catch (err) {
                this.$logger.trace(`Unable to find extensions via npms. Error is: ${err}`);
                return null;
            }
            const defaultCommandRegExp = new RegExp(`${helpers_1.regExpEscape(inputOpts.defaultCommandDelimiter)}.*`);
            const commandDelimiterRegExp = helpers_1.createRegExp(inputOpts.commandDelimiter, "g");
            for (const extensionData of allExtensions) {
                const extensionName = extensionData.package.name;
                try {
                    const registryData = yield this.$npm.getRegistryPackageData(extensionName);
                    const latestPackageData = registryData.versions[registryData["dist-tags"].latest];
                    const commands = latestPackageData && latestPackageData.nativescript && latestPackageData.nativescript.commands;
                    if (commands && commands.length) {
                        _.filter(commands, command => command.indexOf(inputOpts.defaultCommandDelimiter) !== -1)
                            .forEach(defaultCommand => {
                            commands.push(defaultCommand.replace(defaultCommandRegExp, ""));
                        });
                        const copyOfFullArgs = _.clone(inputOpts.inputStrings);
                        while (copyOfFullArgs.length) {
                            const currentCommand = copyOfFullArgs.join(inputOpts.commandDelimiter).toLowerCase();
                            if (_.some(commands, c => c.toLowerCase() === currentCommand)) {
                                const beautifiedCommandName = currentCommand.replace(commandDelimiterRegExp, " ");
                                return {
                                    extensionName,
                                    registeredCommandName: currentCommand,
                                    installationMessage: `The command ${beautifiedCommandName} is registered in extension ${extensionName}. You can install it by executing 'tns extension install ${extensionName}'`
                                };
                            }
                            copyOfFullArgs.splice(-1, 1);
                        }
                    }
                }
                catch (err) {
                    this.$logger.trace(`Unable to get data for ${extensionName}. Error is: ${err}`);
                }
            }
            return null;
        });
    }
    getPathToExtension(extensionName) {
        return path.join(this.pathToExtensions, constants.NODE_MODULES_FOLDER_NAME, extensionName);
    }
    getExtensionPackageJsonData(extensionName) {
        const pathToExtension = this.getPathToExtension(extensionName);
        const pathToPackageJson = path.join(pathToExtension, constants.PACKAGE_JSON_FILE_NAME);
        const jsonData = this.$fs.readJson(pathToPackageJson);
        return jsonData;
    }
    assertExtensionIsInstalled(extensionName) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$logger.trace(`Asserting extension ${extensionName} is installed.`);
            const installedExtensions = this.$fs.readDirectory(path.join(this.pathToExtensions, constants.NODE_MODULES_FOLDER_NAME));
            if (installedExtensions.indexOf(extensionName) === -1) {
                this.$logger.trace(`Extension ${extensionName} is not installed, starting installation.`);
                yield this.installExtension(extensionName);
            }
            this.$logger.trace(`Extension ${extensionName} is installed.`);
        });
    }
    assertExtensionsDirExists() {
        if (!this.$fs.exists(this.pathToExtensions)) {
            this.$fs.createDirectory(this.pathToExtensions);
        }
    }
    assertPackageJsonExists() {
        this.assertExtensionsDirExists();
        if (!this.$fs.exists(this.pathToPackageJson)) {
            this.$logger.trace(`Creating ${this.pathToPackageJson}.`);
            this.$fs.writeJson(this.pathToPackageJson, {
                name: "nativescript-extensibility",
                version: "1.0.0",
                description: "The place where all packages that extend CLI will be installed.",
                license: "Apache-2.0",
                readme: "The place where all packages that extend CLI will be installed.",
                repository: "none",
                dependencies: {}
            });
            this.$logger.trace(`Created ${this.pathToPackageJson}.`);
        }
    }
}
__decorate([
    decorators_1.exported("extensibilityService")
], ExtensibilityService.prototype, "installExtension", null);
__decorate([
    decorators_1.exported("extensibilityService")
], ExtensibilityService.prototype, "uninstallExtension", null);
__decorate([
    decorators_1.exported("extensibilityService")
], ExtensibilityService.prototype, "loadExtensions", null);
__decorate([
    decorators_1.exported("extensibilityService")
], ExtensibilityService.prototype, "getInstalledExtensions", null);
__decorate([
    decorators_1.exported("extensibilityService")
], ExtensibilityService.prototype, "loadExtension", null);
__decorate([
    decorators_1.cache()
], ExtensibilityService.prototype, "assertExtensionsDirExists", null);
__decorate([
    decorators_1.cache()
], ExtensibilityService.prototype, "assertPackageJsonExists", null);
exports.ExtensibilityService = ExtensibilityService;
$injector.register("extensibilityService", ExtensibilityService);
