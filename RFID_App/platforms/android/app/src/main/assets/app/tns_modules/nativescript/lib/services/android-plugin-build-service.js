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
const constants_1 = require("../constants");
const helpers_1 = require("../common/helpers");
const xml2js_1 = require("xml2js");
class AndroidPluginBuildService {
    constructor($injector, $fs, $childProcess, $hostInfo, $androidToolsInfo, $logger) {
        this.$injector = $injector;
        this.$fs = $fs;
        this.$childProcess = $childProcess;
        this.$hostInfo = $hostInfo;
        this.$androidToolsInfo = $androidToolsInfo;
        this.$logger = $logger;
    }
    get $hooksService() {
        return this.$injector.resolve("hooksService");
    }
    getAndroidSourceDirectories(source) {
        const directories = [constants_1.RESOURCES_DIR, "java", constants_1.ASSETS_DIR, "jniLibs"];
        const resultArr = [];
        this.$fs.enumerateFilesInDirectorySync(source, (file, stat) => {
            if (stat.isDirectory() && _.some(directories, (element) => file.endsWith(element))) {
                resultArr.push(file);
                return true;
            }
        });
        return resultArr;
    }
    getManifest(platformsDir) {
        const manifest = path.join(platformsDir, constants_1.MANIFEST_FILE_NAME);
        return this.$fs.exists(manifest) ? manifest : null;
    }
    updateManifestContent(oldManifestContent, defaultPackageName) {
        return __awaiter(this, void 0, void 0, function* () {
            let xml = yield this.getXml(oldManifestContent);
            let packageName = defaultPackageName;
            if (xml["manifest"]) {
                if (xml["manifest"]["$"]["package"]) {
                    packageName = xml["manifest"]["$"]["package"];
                }
                xml = xml["manifest"];
            }
            const newManifest = { manifest: {} };
            for (const prop in xml) {
                newManifest.manifest[prop] = xml[prop];
            }
            newManifest.manifest["$"]["package"] = packageName;
            const xmlBuilder = new xml2js_1.Builder();
            const newManifestContent = xmlBuilder.buildObject(newManifest);
            return newManifestContent;
        });
    }
    createManifestContent(packageName) {
        const newManifest = { manifest: AndroidPluginBuildService.MANIFEST_ROOT };
        newManifest.manifest["$"]["package"] = packageName;
        const xmlBuilder = new xml2js_1.Builder();
        const newManifestContent = xmlBuilder.buildObject(newManifest);
        return newManifestContent;
    }
    getXml(stringContent) {
        return __awaiter(this, void 0, void 0, function* () {
            const promise = new Promise((resolve, reject) => xml2js_1.parseString(stringContent, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            }));
            return promise;
        });
    }
    getIncludeGradleCompileDependenciesScope(includeGradleFileContent) {
        const indexOfDependenciesScope = includeGradleFileContent.indexOf("dependencies");
        const result = [];
        if (indexOfDependenciesScope === -1) {
            return result;
        }
        const indexOfRepositoriesScope = includeGradleFileContent.indexOf("repositories");
        let repositoriesScope = "";
        if (indexOfRepositoriesScope >= 0) {
            repositoriesScope = this.getScope("repositories", includeGradleFileContent);
            result.push(repositoriesScope);
        }
        const dependenciesScope = this.getScope("dependencies", includeGradleFileContent);
        result.push(dependenciesScope);
        return result;
    }
    getScope(scopeName, content) {
        const indexOfScopeName = content.indexOf(scopeName);
        let result = "";
        const openingBracket = "{";
        const closingBracket = "}";
        let openBrackets = 0;
        let foundFirstBracket = false;
        let i = indexOfScopeName;
        while (i < content.length) {
            const currCharacter = content[i];
            if (currCharacter === openingBracket) {
                if (openBrackets === 0) {
                    foundFirstBracket = true;
                }
                openBrackets++;
            }
            if (currCharacter === closingBracket) {
                openBrackets--;
            }
            result += currCharacter;
            if (openBrackets === 0 && foundFirstBracket) {
                break;
            }
            i++;
        }
        return result;
    }
    buildAar(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validateOptions(options);
            const shortPluginName = helpers_1.getShortPluginName(options.pluginName);
            const newPluginDir = path.join(options.tempPluginDirPath, shortPluginName);
            const newPluginMainSrcDir = path.join(newPluginDir, "src", "main");
            const defaultPackageName = "org.nativescript." + shortPluginName;
            const manifestFilePath = this.getManifest(options.platformsAndroidDirPath);
            let shouldBuildAar = false;
            if (manifestFilePath) {
                shouldBuildAar = true;
            }
            const androidSourceSetDirectories = this.getAndroidSourceDirectories(options.platformsAndroidDirPath);
            if (androidSourceSetDirectories.length > 0) {
                shouldBuildAar = true;
            }
            if (shouldBuildAar) {
                let updatedManifestContent;
                this.$fs.ensureDirectoryExists(newPluginMainSrcDir);
                if (manifestFilePath) {
                    let androidManifestContent;
                    try {
                        androidManifestContent = this.$fs.readText(manifestFilePath);
                    }
                    catch (err) {
                        throw new Error(`Failed to fs.readFileSync the manifest file located at ${manifestFilePath}`);
                    }
                    updatedManifestContent = yield this.updateManifestContent(androidManifestContent, defaultPackageName);
                }
                else {
                    updatedManifestContent = this.createManifestContent(defaultPackageName);
                }
                const pathToNewAndroidManifest = path.join(newPluginMainSrcDir, constants_1.MANIFEST_FILE_NAME);
                try {
                    this.$fs.writeFile(pathToNewAndroidManifest, updatedManifestContent);
                }
                catch (e) {
                    throw new Error(`Failed to write the updated AndroidManifest in the new location - ${pathToNewAndroidManifest}`);
                }
                for (const dir of androidSourceSetDirectories) {
                    const dirNameParts = dir.split(path.sep);
                    const dirName = dirNameParts[dirNameParts.length - 1];
                    const destination = path.join(newPluginMainSrcDir, dirName);
                    this.$fs.ensureDirectoryExists(destination);
                    this.$fs.copyFile(path.join(dir, "*"), destination);
                }
                this.$fs.copyFile(path.join(path.resolve(path.join(__dirname, AndroidPluginBuildService.ANDROID_PLUGIN_GRADLE_TEMPLATE), "*")), newPluginDir);
                const includeGradlePath = path.join(options.platformsAndroidDirPath, constants_1.INCLUDE_GRADLE_NAME);
                if (this.$fs.exists(includeGradlePath)) {
                    const includeGradleContent = this.$fs.readText(includeGradlePath);
                    const repositoriesAndDependenciesScopes = this.getIncludeGradleCompileDependenciesScope(includeGradleContent);
                    if (repositoriesAndDependenciesScopes.length > 0) {
                        const buildGradlePath = path.join(newPluginDir, "build.gradle");
                        this.$fs.appendFile(buildGradlePath, "\n" + repositoriesAndDependenciesScopes.join("\n"));
                    }
                }
                this.$androidToolsInfo.validateInfo({ showWarningsAsErrors: true, validateTargetSdk: true });
                const androidToolsInfo = this.$androidToolsInfo.getToolsInfo();
                yield this.buildPlugin({ pluginDir: newPluginDir, pluginName: options.pluginName, androidToolsInfo });
                const finalAarName = `${shortPluginName}-release.aar`;
                const pathToBuiltAar = path.join(newPluginDir, "build", "outputs", "aar", finalAarName);
                if (this.$fs.exists(pathToBuiltAar)) {
                    try {
                        if (options.aarOutputDir) {
                            this.$fs.copyFile(pathToBuiltAar, path.join(options.aarOutputDir, `${shortPluginName}.aar`));
                        }
                    }
                    catch (e) {
                        throw new Error(`Failed to copy built aar to destination. ${e.message}`);
                    }
                    return true;
                }
                else {
                    throw new Error(`No built aar found at ${pathToBuiltAar}`);
                }
            }
            return false;
        });
    }
    migrateIncludeGradle(options) {
        this.validatePlatformsAndroidDirPathOption(options);
        const includeGradleFilePath = path.join(options.platformsAndroidDirPath, constants_1.INCLUDE_GRADLE_NAME);
        if (this.$fs.exists(includeGradleFilePath)) {
            let includeGradleFileContent;
            try {
                includeGradleFileContent = this.$fs.readFile(includeGradleFilePath).toString();
            }
            catch (err) {
                throw new Error(`Failed to fs.readFileSync the include.gradle file located at ${includeGradleFilePath}`);
            }
            const productFlavorsScope = this.getScope("productFlavors", includeGradleFileContent);
            try {
                const newIncludeGradleFileContent = includeGradleFileContent.replace(productFlavorsScope, "");
                this.$fs.writeFile(includeGradleFilePath, newIncludeGradleFileContent);
                return true;
            }
            catch (e) {
                throw new Error(`Failed to write the updated include.gradle in - ${includeGradleFilePath}`);
            }
        }
        return false;
    }
    buildPlugin(pluginBuildSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            const gradlew = this.$hostInfo.isWindows ? "gradlew.bat" : "./gradlew";
            const localArgs = [
                "-p",
                pluginBuildSettings.pluginDir,
                "assembleRelease",
                `-PcompileSdk=android-${pluginBuildSettings.androidToolsInfo.compileSdkVersion}`,
                `-PbuildToolsVersion=${pluginBuildSettings.androidToolsInfo.buildToolsVersion}`,
                `-PsupportVersion=${pluginBuildSettings.androidToolsInfo.supportRepositoryVersion}`
            ];
            try {
                yield this.$childProcess.spawnFromEvent(gradlew, localArgs, "close", { cwd: pluginBuildSettings.pluginDir });
            }
            catch (err) {
                throw new Error(`Failed to build plugin ${pluginBuildSettings.pluginName} : \n${err}`);
            }
        });
    }
    validateOptions(options) {
        if (!options) {
            throw new Error("Android plugin cannot be built without passing an 'options' object.");
        }
        if (!options.pluginName) {
            this.$logger.info("No plugin name provided, defaulting to 'myPlugin'.");
        }
        if (!options.aarOutputDir) {
            this.$logger.info("No aarOutputDir provided, defaulting to the build outputs directory of the plugin");
        }
        if (!options.tempPluginDirPath) {
            throw new Error("Android plugin cannot be built without passing the path to a directory where the temporary project should be built.");
        }
        this.validatePlatformsAndroidDirPathOption(options);
    }
    validatePlatformsAndroidDirPathOption(options) {
        if (!options) {
            throw new Error("Android plugin cannot be built without passing an 'options' object.");
        }
        if (!options.platformsAndroidDirPath) {
            throw new Error("Android plugin cannot be built without passing the path to the platforms/android dir.");
        }
    }
}
AndroidPluginBuildService.MANIFEST_ROOT = {
    $: {
        "xmlns:android": "http://schemas.android.com/apk/res/android"
    }
};
AndroidPluginBuildService.ANDROID_PLUGIN_GRADLE_TEMPLATE = "../../vendor/gradle-plugin";
__decorate([
    helpers_1.hook("buildAndroidPlugin")
], AndroidPluginBuildService.prototype, "buildPlugin", null);
exports.AndroidPluginBuildService = AndroidPluginBuildService;
$injector.register("androidPluginBuildService", AndroidPluginBuildService);
