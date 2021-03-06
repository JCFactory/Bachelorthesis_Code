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
const os = require("os");
const constants = require("../../constants");
const helpers_1 = require("../../helpers");
const decorators_1 = require("../../decorators");
const url = require("url");
const { getCredentialsFromAuth } = require("proxy-lib/lib/utils");
class NpmService {
    constructor($childProcess, $errors, $fs, $hostInfo, $httpClient, $logger, $projectConstants) {
        this.$childProcess = $childProcess;
        this.$errors = $errors;
        this.$fs = $fs;
        this.$hostInfo = $hostInfo;
        this.$httpClient = $httpClient;
        this.$logger = $logger;
        this.$projectConstants = $projectConstants;
        this._hasCheckedNpmProxy = false;
    }
    get npmExecutableName() {
        if (!this._npmExecutableName) {
            this._npmExecutableName = "npm";
            if (this.$hostInfo.isWindows) {
                this._npmExecutableName += ".cmd";
            }
        }
        return this._npmExecutableName;
    }
    install(projectDir, dependencyToInstall) {
        return __awaiter(this, void 0, void 0, function* () {
            const npmInstallResult = {};
            if (dependencyToInstall) {
                npmInstallResult.result = {
                    isInstalled: false,
                    isTypesInstalled: false
                };
                try {
                    yield this.npmInstall(projectDir, dependencyToInstall.name, dependencyToInstall.version, ["--save", "--save-exact"]);
                    npmInstallResult.result.isInstalled = true;
                }
                catch (err) {
                    npmInstallResult.error = err;
                }
                if (dependencyToInstall.installTypes && npmInstallResult.result.isInstalled && (yield this.hasTypesForDependency(dependencyToInstall.name))) {
                    try {
                        yield this.installTypingsForDependency(projectDir, dependencyToInstall.name);
                        npmInstallResult.result.isTypesInstalled = true;
                    }
                    catch (err) {
                        npmInstallResult.error = err;
                    }
                }
            }
            else {
                try {
                    yield this.npmPrune(projectDir);
                    yield this.npmInstall(projectDir);
                }
                catch (err) {
                    npmInstallResult.error = err;
                }
            }
            this.generateReferencesFile(projectDir);
            return npmInstallResult;
        });
    }
    uninstall(projectDir, dependency) {
        return __awaiter(this, void 0, void 0, function* () {
            const packageJsonContent = this.getPackageJsonContent(projectDir);
            if (packageJsonContent && packageJsonContent.dependencies && packageJsonContent.dependencies[dependency]) {
                yield this.npmUninstall(projectDir, dependency, ["--save"]);
            }
            if (packageJsonContent && packageJsonContent.devDependencies && packageJsonContent.devDependencies[`${NpmService.TYPES_DIRECTORY}${dependency}`]) {
                yield this.npmUninstall(projectDir, `${NpmService.TYPES_DIRECTORY}${dependency}`, ["--save-dev"]);
            }
            this.generateReferencesFile(projectDir);
        });
    }
    search(projectDir, keywords, args) {
        return __awaiter(this, void 0, void 0, function* () {
            args = args === undefined ? [] : args;
            const result = [];
            const commandArguments = _.concat(["search"], args, keywords);
            const spawnResult = yield this.executeNpmCommandCore(projectDir, commandArguments);
            if (spawnResult.stderr) {
                const splitError = spawnResult.stderr.trim().split("\n");
                if (splitError.length > 1 || splitError[0].indexOf("Building the local index for the first time") === -1) {
                    this.$errors.failWithoutHelp(spawnResult.stderr);
                }
            }
            const pluginsRows = spawnResult.stdout.split("\n");
            pluginsRows.shift();
            const npmNameGroup = "(\\S+)";
            const npmDateGroup = "(\\d+-\\d+-\\d+)\\s";
            const npmFreeTextGroup = "([^=]+)";
            const npmAuthorsGroup = "((?:=\\S+\\s?)+)\\s+";
            const pluginRowRegExp = new RegExp(`${npmNameGroup}\\s+${npmFreeTextGroup}${npmAuthorsGroup}${npmDateGroup}${npmNameGroup}(\\s+${npmFreeTextGroup})?`);
            _.each(pluginsRows, (pluginRow) => {
                const matches = pluginRowRegExp.exec(pluginRow.trim());
                if (!matches || !matches[0]) {
                    return;
                }
                result.push({
                    name: matches[1],
                    description: matches[2],
                    author: matches[3],
                    version: matches[5]
                });
            });
            return result;
        });
    }
    getPackageJsonFromNpmRegistry(packageName, version) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeout = 6000;
            let packageJsonContent;
            version = version || "latest";
            try {
                const url = yield this.buildNpmRegistryUrl(packageName), proxySettings = yield this.getNpmProxySettings();
                const result = (yield this.$httpClient.httpRequest({ url, timeout }, proxySettings)).body;
                const fullData = JSON.parse(result);
                const distTags = fullData["dist-tags"];
                const versions = fullData.versions;
                _.each(distTags, (ver, tagName) => {
                    if (tagName === version) {
                        version = ver;
                        return false;
                    }
                });
                packageJsonContent = versions[version];
            }
            catch (err) {
                this.$logger.trace("Error caught while checking the NPM Registry for plugin with id: %s", packageName);
                this.$logger.trace(err.message);
            }
            return packageJsonContent;
        });
    }
    isScopedDependency(dependency) {
        const matches = dependency.match(NpmService.SCOPED_DEPENDENCY_REGEXP);
        return !!(matches && matches[0]);
    }
    getDependencyInformation(dependency) {
        const regExp = this.isScopedDependency(dependency) ? NpmService.SCOPED_DEPENDENCY_REGEXP : NpmService.DEPENDENCY_REGEXP;
        const matches = dependency.match(regExp);
        return {
            name: matches[1],
            version: matches[2]
        };
    }
    hasTypesForDependency(packageName) {
        return __awaiter(this, void 0, void 0, function* () {
            return !!(yield this.getPackageJsonFromNpmRegistry(`${NpmService.TYPES_DIRECTORY}${packageName}`));
        });
    }
    buildNpmRegistryUrl(packageName) {
        return __awaiter(this, void 0, void 0, function* () {
            let registryUrl = yield this.getNpmRegistryUrl();
            if (!_.endsWith(registryUrl, "/")) {
                registryUrl += "/";
            }
            return `${registryUrl}${packageName.replace("/", "%2F")}`;
        });
    }
    getNpmRegistryUrl() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._npmRegistryUrl) {
                let currentNpmRegistry;
                try {
                    currentNpmRegistry = ((yield this.$childProcess.exec("npm config get registry")) || "").toString().trim();
                }
                catch (err) {
                    this.$logger.trace(`Unable to get registry from npm config. Error is ${err.message}.`);
                }
                this._npmRegistryUrl = currentNpmRegistry || NpmService.NPM_REGISTRY_URL;
                this.$logger.trace(`Npm registry is: ${this._npmRegistryUrl}.`);
            }
            return this._npmRegistryUrl;
        });
    }
    getPackageJsonContent(projectDir) {
        const pathToPackageJson = this.getPathToPackageJson(projectDir);
        try {
            return this.$fs.readJson(pathToPackageJson);
        }
        catch (err) {
            if (err.code === "ENOENT") {
                this.$errors.failWithoutHelp(`Unable to find ${this.$projectConstants.PACKAGE_JSON_NAME} in ${projectDir}.`);
            }
            throw err;
        }
    }
    getPathToPackageJson(projectDir) {
        return path.join(projectDir, this.$projectConstants.PACKAGE_JSON_NAME);
    }
    getPathToReferencesFile(projectDir) {
        return path.join(projectDir, this.$projectConstants.REFERENCES_FILE_NAME);
    }
    installTypingsForDependency(projectDir, dependency) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.npmInstall(projectDir, `${NpmService.TYPES_DIRECTORY}${dependency}`, null, ["--save-dev", "--save-exact"]);
        });
    }
    generateReferencesFile(projectDir) {
        const packageJsonContent = this.getPackageJsonContent(projectDir);
        const pathToReferenceFile = this.getPathToReferencesFile(projectDir);
        let lines = [];
        if (packageJsonContent && packageJsonContent.dependencies && packageJsonContent.dependencies[constants.TNS_CORE_MODULES]) {
            const relativePathToTnsCoreModulesDts = `./${constants.NODE_MODULES_DIR_NAME}/${constants.TNS_CORE_MODULES}/${NpmService.TNS_CORE_MODULES_DEFINITION_FILE_NAME}`;
            if (this.$fs.exists(path.join(projectDir, relativePathToTnsCoreModulesDts))) {
                lines.push(this.getReferenceLine(relativePathToTnsCoreModulesDts));
            }
        }
        _(packageJsonContent.devDependencies)
            .keys()
            .each(devDependency => {
            if (this.isFromTypesRepo(devDependency)) {
                const nodeModulesDirectory = path.join(projectDir, constants.NODE_MODULES_DIR_NAME);
                const definitionFiles = this.$fs.enumerateFilesInDirectorySync(path.join(nodeModulesDirectory, devDependency), (file, stat) => _.endsWith(file, constants.FileExtensions.TYPESCRIPT_DEFINITION_FILE) || stat.isDirectory(), { enumerateDirectories: false });
                const defs = _.map(definitionFiles, def => this.getReferenceLine(helpers_1.fromWindowsRelativePathToUnix(path.relative(projectDir, def))));
                this.$logger.trace(`Adding lines for definition files: ${definitionFiles.join(", ")}`);
                lines = lines.concat(defs);
            }
        });
        if (lines.length) {
            this.$logger.trace("Updating reference file with new entries...");
            this.$fs.writeFile(pathToReferenceFile, lines.join(os.EOL), "utf8");
            this.removeOldAbReferencesFile(projectDir);
        }
        else {
            this.$logger.trace(`Could not find any .d.ts files for ${this.$projectConstants.REFERENCES_FILE_NAME} file. Deleting the old file.`);
            this.$fs.deleteFile(pathToReferenceFile);
        }
    }
    removeOldAbReferencesFile(projectDir) {
        const pathToOldReferencesFile = path.join(projectDir, this.$projectConstants.OLD_REFERENCES_FILE_NAME);
        if (this.$fs.exists(pathToOldReferencesFile)) {
            this.$fs.deleteFile(pathToOldReferencesFile);
        }
    }
    isFromTypesRepo(dependency) {
        return !!dependency.match(/^@types\//);
    }
    getReferenceLine(pathToReferencedFile) {
        return `/// <reference path="${pathToReferencedFile}" />`;
    }
    getNpmArguments(command, npmArguments) {
        npmArguments = npmArguments === undefined ? [] : npmArguments;
        return npmArguments.concat([command]);
    }
    npmInstall(projectDir, dependency, version, npmArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeNpmCommand(projectDir, this.getNpmArguments("install", npmArguments), dependency, version);
        });
    }
    npmUninstall(projectDir, dependency, npmArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeNpmCommand(projectDir, this.getNpmArguments("uninstall", npmArguments), dependency, null);
        });
    }
    npmPrune(projectDir, dependency, version) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeNpmCommand(projectDir, this.getNpmArguments("prune"), dependency, version);
        });
    }
    executeNpmCommand(projectDir, npmArguments, dependency, version) {
        return __awaiter(this, void 0, void 0, function* () {
            if (dependency) {
                let dependencyToInstall = dependency;
                if (version) {
                    dependencyToInstall += `@${version}`;
                }
                npmArguments.push(dependencyToInstall);
            }
            return yield this.executeNpmCommandCore(projectDir, npmArguments);
        });
    }
    executeNpmCommandCore(projectDir, npmArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.$childProcess.spawnFromEvent(this.npmExecutableName, npmArguments, "close", { cwd: projectDir, stdio: "inherit" });
        });
    }
    getNpmProxySettings() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._hasCheckedNpmProxy) {
                try {
                    const npmProxy = ((yield this.$childProcess.exec("npm config get proxy")) || "").toString().trim();
                    if (npmProxy && npmProxy !== "null") {
                        const strictSslString = ((yield this.$childProcess.exec("npm config get strict-ssl")) || "").toString().trim();
                        const uri = url.parse(npmProxy);
                        const { username, password } = getCredentialsFromAuth(uri.auth || "");
                        this._proxySettings = {
                            hostname: uri.hostname,
                            port: uri.port,
                            rejectUnauthorized: helpers_1.toBoolean(strictSslString),
                            username,
                            password
                        };
                    }
                }
                catch (err) {
                    this.$logger.trace(`Unable to get npm proxy configuration. Error is: ${err.message}.`);
                }
                this.$logger.trace("Npm proxy is: ", this._proxySettings);
                this._hasCheckedNpmProxy = true;
            }
            return this._proxySettings;
        });
    }
}
NpmService.TYPES_DIRECTORY = "@types/";
NpmService.TNS_CORE_MODULES_DEFINITION_FILE_NAME = `${constants.TNS_CORE_MODULES}${constants.FileExtensions.TYPESCRIPT_DEFINITION_FILE}`;
NpmService.NPM_REGISTRY_URL = "http://registry.npmjs.org";
NpmService.SCOPED_DEPENDENCY_REGEXP = /^(@.+?)(?:@(.+?))?$/;
NpmService.DEPENDENCY_REGEXP = /^(.+?)(?:@(.+?))?$/;
__decorate([
    decorators_1.exported("npmService")
], NpmService.prototype, "install", null);
__decorate([
    decorators_1.exported("npmService")
], NpmService.prototype, "uninstall", null);
exports.NpmService = NpmService;
$injector.register("npmService", NpmService);
