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
const shell = require("shelljs");
const constants = require("../constants");
const semver = require("semver");
const projectServiceBaseLib = require("./platform-project-service-base");
const device_android_debug_bridge_1 = require("../common/mobile/android/device-android-debug-bridge");
const helpers_1 = require("../common/helpers");
const constants_1 = require("../common/constants");
class AndroidProjectService extends projectServiceBaseLib.PlatformProjectServiceBase {
    constructor($androidEmulatorServices, $androidToolsInfo, $childProcess, $errors, $fs, $hostInfo, $logger, $projectDataService, $injector, $pluginVariablesService, $devicePlatformsConstants, $npm, $androidPluginBuildService, $platformEnvironmentRequirements, $androidResourcesMigrationService) {
        super($fs, $projectDataService);
        this.$androidEmulatorServices = $androidEmulatorServices;
        this.$androidToolsInfo = $androidToolsInfo;
        this.$childProcess = $childProcess;
        this.$errors = $errors;
        this.$hostInfo = $hostInfo;
        this.$logger = $logger;
        this.$injector = $injector;
        this.$pluginVariablesService = $pluginVariablesService;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.$npm = $npm;
        this.$androidPluginBuildService = $androidPluginBuildService;
        this.$platformEnvironmentRequirements = $platformEnvironmentRequirements;
        this.$androidResourcesMigrationService = $androidResourcesMigrationService;
        this._platformsDirCache = null;
        this._platformData = null;
        this.isAndroidStudioTemplate = false;
    }
    getPlatformData(projectData) {
        if (!projectData && !this._platformData) {
            throw new Error("First call of getPlatformData without providing projectData.");
        }
        if (projectData && projectData.platformsDir) {
            const projectRoot = path.join(projectData.platformsDir, AndroidProjectService.ANDROID_PLATFORM_NAME);
            if (this.isAndroidStudioCompatibleTemplate(projectData)) {
                this.isAndroidStudioTemplate = true;
            }
            const appDestinationDirectoryArr = [projectRoot];
            if (this.isAndroidStudioTemplate) {
                appDestinationDirectoryArr.push(constants.APP_FOLDER_NAME);
            }
            appDestinationDirectoryArr.push(constants.SRC_DIR, constants.MAIN_DIR, constants.ASSETS_DIR);
            const configurationsDirectoryArr = [projectRoot];
            if (this.isAndroidStudioTemplate) {
                configurationsDirectoryArr.push(constants.APP_FOLDER_NAME);
            }
            configurationsDirectoryArr.push(constants.SRC_DIR, constants.MAIN_DIR, constants.MANIFEST_FILE_NAME);
            const deviceBuildOutputArr = [projectRoot];
            if (this.isAndroidStudioTemplate) {
                deviceBuildOutputArr.push(constants.APP_FOLDER_NAME);
            }
            deviceBuildOutputArr.push(constants.BUILD_DIR, constants.OUTPUTS_DIR, constants.APK_DIR);
            this._platformsDirCache = projectData.platformsDir;
            const packageName = this.getProjectNameFromId(projectData);
            this._platformData = {
                frameworkPackageName: constants.TNS_ANDROID_RUNTIME_NAME,
                normalizedPlatformName: "Android",
                appDestinationDirectoryPath: path.join(...appDestinationDirectoryArr),
                platformProjectService: this,
                emulatorServices: this.$androidEmulatorServices,
                projectRoot: projectRoot,
                deviceBuildOutputPath: path.join(...deviceBuildOutputArr),
                getValidBuildOutputData: (buildOptions) => {
                    const buildMode = buildOptions.isReleaseBuild ? constants_1.Configurations.Release.toLowerCase() : constants_1.Configurations.Debug.toLowerCase();
                    return {
                        packageNames: [
                            `${packageName}-${buildMode}${constants.APK_EXTENSION_NAME}`,
                            `${projectData.projectName}-${buildMode}${constants.APK_EXTENSION_NAME}`,
                            `${projectData.projectName}${constants.APK_EXTENSION_NAME}`,
                            `${constants.APP_FOLDER_NAME}-${buildMode}${constants.APK_EXTENSION_NAME}`
                        ],
                        regexes: [new RegExp(`${constants.APP_FOLDER_NAME}-.*-(${constants_1.Configurations.Debug}|${constants_1.Configurations.Release})${constants.APK_EXTENSION_NAME}`, "i"), new RegExp(`${packageName}-.*-(${constants_1.Configurations.Debug}|${constants_1.Configurations.Release})${constants.APK_EXTENSION_NAME}`, "i")]
                    };
                },
                frameworkFilesExtensions: [".jar", ".dat", ".so"],
                configurationFileName: constants.MANIFEST_FILE_NAME,
                configurationFilePath: path.join(...configurationsDirectoryArr),
                relativeToFrameworkConfigurationFilePath: path.join(constants.SRC_DIR, constants.MAIN_DIR, constants.MANIFEST_FILE_NAME),
                fastLivesyncFileExtensions: [".jpg", ".gif", ".png", ".bmp", ".webp"]
            };
        }
        return this._platformData;
    }
    getCurrentPlatformVersion(platformData, projectData) {
        const currentPlatformData = this.$projectDataService.getNSValue(projectData.projectDir, platformData.frameworkPackageName);
        return currentPlatformData && currentPlatformData[constants.VERSION_STRING];
    }
    validateOptions() {
        return Promise.resolve(true);
    }
    getAppResourcesDestinationDirectoryPath(projectData) {
        const appResourcesDirStructureHasMigrated = this.$androidResourcesMigrationService.hasMigrated(projectData.getAppResourcesDirectoryPath());
        if (appResourcesDirStructureHasMigrated) {
            return this.getUpdatedAppResourcesDestinationDirPath(projectData);
        }
        else {
            return this.getLegacyAppResourcesDestinationDirPath(projectData);
        }
    }
    validate(projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validatePackageName(projectData.projectId);
            this.validateProjectName(projectData.projectName);
            yield this.$platformEnvironmentRequirements.checkEnvironmentRequirements(this.getPlatformData(projectData).normalizedPlatformName, projectData.projectDir);
            this.$androidToolsInfo.validateTargetSdk({ showWarningsAsErrors: true });
        });
    }
    validatePlugins() {
        return __awaiter(this, void 0, void 0, function* () {
            Promise.resolve();
        });
    }
    createProject(frameworkDir, frameworkVersion, projectData, config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (semver.lt(frameworkVersion, AndroidProjectService.MIN_RUNTIME_VERSION_WITH_GRADLE)) {
                this.$errors.failWithoutHelp(`The NativeScript CLI requires Android runtime ${AndroidProjectService.MIN_RUNTIME_VERSION_WITH_GRADLE} or later to work properly.`);
            }
            this.$fs.ensureDirectoryExists(this.getPlatformData(projectData).projectRoot);
            const androidToolsInfo = this.$androidToolsInfo.getToolsInfo();
            const targetSdkVersion = androidToolsInfo && androidToolsInfo.targetSdkVersion;
            this.$logger.trace(`Using Android SDK '${targetSdkVersion}'.`);
            this.isAndroidStudioTemplate = this.isAndroidStudioCompatibleTemplate(projectData);
            if (this.isAndroidStudioTemplate) {
                this.copy(this.getPlatformData(projectData).projectRoot, frameworkDir, "*", "-R");
            }
            else {
                this.copy(this.getPlatformData(projectData).projectRoot, frameworkDir, "libs", "-R");
                if (config.pathToTemplate) {
                    const mainPath = path.join(this.getPlatformData(projectData).projectRoot, constants.SRC_DIR, constants.MAIN_DIR);
                    this.$fs.createDirectory(mainPath);
                    shell.cp("-R", path.join(path.resolve(config.pathToTemplate), "*"), mainPath);
                }
                else {
                    this.copy(this.getPlatformData(projectData).projectRoot, frameworkDir, constants.SRC_DIR, "-R");
                }
                this.copy(this.getPlatformData(projectData).projectRoot, frameworkDir, "build.gradle settings.gradle build-tools", "-Rf");
                try {
                    this.copy(this.getPlatformData(projectData).projectRoot, frameworkDir, "gradle.properties", "-Rf");
                }
                catch (e) {
                    this.$logger.warn(`\n${e}\nIt's possible, the final .apk file will contain all architectures instead of the ones described in the abiFilters!\nYou can fix this by using the latest android platform.`);
                }
                this.copy(this.getPlatformData(projectData).projectRoot, frameworkDir, "gradle", "-R");
                this.copy(this.getPlatformData(projectData).projectRoot, frameworkDir, "gradlew gradlew.bat", "-f");
            }
            this.cleanResValues(targetSdkVersion, projectData);
            const npmConfig = {
                save: true,
                "save-dev": true,
                "save-exact": true,
                silent: true,
                disableNpmInstall: false,
                frameworkPath: config.frameworkPath,
                ignoreScripts: config.ignoreScripts
            };
            const projectPackageJson = this.$fs.readJson(projectData.projectFilePath);
            for (const dependency of AndroidProjectService.REQUIRED_DEV_DEPENDENCIES) {
                let dependencyVersionInProject = (projectPackageJson.dependencies && projectPackageJson.dependencies[dependency.name]) ||
                    (projectPackageJson.devDependencies && projectPackageJson.devDependencies[dependency.name]);
                if (!dependencyVersionInProject) {
                    yield this.$npm.install(`${dependency.name}@${dependency.version}`, projectData.projectDir, npmConfig);
                }
                else {
                    const cleanedVerson = semver.clean(dependencyVersionInProject);
                    if (!cleanedVerson) {
                        const pathToPluginPackageJson = path.join(projectData.projectDir, constants.NODE_MODULES_FOLDER_NAME, dependency.name, constants.PACKAGE_JSON_FILE_NAME);
                        dependencyVersionInProject = this.$fs.exists(pathToPluginPackageJson) && this.$fs.readJson(pathToPluginPackageJson).version;
                    }
                    if (!semver.satisfies(dependencyVersionInProject || cleanedVerson, dependency.version)) {
                        this.$errors.failWithoutHelp(`Your project have installed ${dependency.name} version ${cleanedVerson} but Android platform requires version ${dependency.version}.`);
                    }
                }
            }
        });
    }
    cleanResValues(targetSdkVersion, projectData) {
        const resDestinationDir = this.getAppResourcesDestinationDirectoryPath(projectData);
        const directoriesInResFolder = this.$fs.readDirectory(resDestinationDir);
        const directoriesToClean = directoriesInResFolder
            .map(dir => {
            return {
                dirName: dir,
                sdkNum: parseInt(dir.substr(AndroidProjectService.VALUES_VERSION_DIRNAME_PREFIX.length))
            };
        })
            .filter(dir => dir.dirName.match(AndroidProjectService.VALUES_VERSION_DIRNAME_PREFIX)
            && dir.sdkNum
            && (!targetSdkVersion || (targetSdkVersion < dir.sdkNum)))
            .map(dir => path.join(resDestinationDir, dir.dirName));
        this.$logger.trace("Directories to clean:");
        this.$logger.trace(directoriesToClean);
        _.map(directoriesToClean, dir => this.$fs.deleteDirectory(dir));
    }
    interpolateData(projectData, platformSpecificData) {
        return __awaiter(this, void 0, void 0, function* () {
            this.interpolateConfigurationFile(projectData, platformSpecificData);
            const appResourcesDirectoryPath = projectData.getAppResourcesDirectoryPath();
            let stringsFilePath;
            const appResourcesDestinationDirectoryPath = this.getAppResourcesDestinationDirectoryPath(projectData);
            if (this.$androidResourcesMigrationService.hasMigrated(appResourcesDirectoryPath)) {
                stringsFilePath = path.join(appResourcesDestinationDirectoryPath, constants.MAIN_DIR, constants.RESOURCES_DIR, 'values', 'strings.xml');
            }
            else {
                stringsFilePath = path.join(appResourcesDestinationDirectoryPath, 'values', 'strings.xml');
            }
            shell.sed('-i', /__NAME__/, projectData.projectName, stringsFilePath);
            shell.sed('-i', /__TITLE_ACTIVITY__/, projectData.projectName, stringsFilePath);
            const gradleSettingsFilePath = path.join(this.getPlatformData(projectData).projectRoot, "settings.gradle");
            shell.sed('-i', /__PROJECT_NAME__/, this.getProjectNameFromId(projectData), gradleSettingsFilePath);
            try {
                const appGradleContent = this.$fs.readText(projectData.appGradlePath);
                if (appGradleContent.indexOf(constants.PACKAGE_PLACEHOLDER_NAME) !== -1) {
                    shell.sed('-i', new RegExp(constants.PACKAGE_PLACEHOLDER_NAME), projectData.projectId, projectData.appGradlePath);
                }
            }
            catch (e) {
                this.$logger.warn(`\n${e}.\nCheck if you're using an outdated template and update it.`);
            }
        });
    }
    interpolateConfigurationFile(projectData, platformSpecificData) {
        const manifestPath = this.getPlatformData(projectData).configurationFilePath;
        shell.sed('-i', /__PACKAGE__/, projectData.projectId, manifestPath);
        if (this.$androidToolsInfo.getToolsInfo().androidHomeEnvVar) {
            const sdk = (platformSpecificData && platformSpecificData.sdk) || (this.$androidToolsInfo.getToolsInfo().compileSdkVersion || "").toString();
            shell.sed('-i', /__APILEVEL__/, sdk, manifestPath);
        }
    }
    getProjectNameFromId(projectData) {
        let id;
        if (projectData && projectData.projectId) {
            const idParts = projectData.projectId.split(".");
            id = idParts[idParts.length - 1];
        }
        return id;
    }
    afterCreateProject(projectRoot) {
        return null;
    }
    canUpdatePlatform(newInstalledModuleDir, projectData) {
        return true;
    }
    updatePlatform(currentVersion, newVersion, canUpdate, projectData, addPlatform, removePlatforms) {
        return __awaiter(this, void 0, void 0, function* () {
            if (semver.eq(newVersion, AndroidProjectService.MIN_RUNTIME_VERSION_WITH_GRADLE)) {
                const platformLowercase = this.getPlatformData(projectData).normalizedPlatformName.toLowerCase();
                yield removePlatforms([platformLowercase.split("@")[0]]);
                yield addPlatform(platformLowercase);
                return false;
            }
            return true;
        });
    }
    buildProject(projectRoot, projectData, buildConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const buildOptions = this.getGradleBuildOptions(buildConfig, projectData);
            if (this.$logger.getLevel() === "TRACE") {
                buildOptions.unshift("--stacktrace");
                buildOptions.unshift("--debug");
            }
            if (buildConfig.release) {
                buildOptions.unshift("assembleRelease");
            }
            else {
                buildOptions.unshift("assembleDebug");
            }
            const handler = (data) => {
                this.emit(constants.BUILD_OUTPUT_EVENT_NAME, data);
            };
            yield helpers_1.attachAwaitDetach(constants.BUILD_OUTPUT_EVENT_NAME, this.$childProcess, handler, this.executeCommand(this.getPlatformData(projectData).projectRoot, buildOptions, { stdio: buildConfig.buildOutputStdio || "inherit" }, { emitOptions: { eventName: constants.BUILD_OUTPUT_EVENT_NAME }, throwError: true }));
        });
    }
    getGradleBuildOptions(settings, projectData) {
        const configurationFilePath = this.getPlatformData(projectData).configurationFilePath;
        const buildOptions = this.getBuildOptions(configurationFilePath);
        if (settings.release) {
            buildOptions.push("-Prelease");
            buildOptions.push(`-PksPath=${path.resolve(settings.keyStorePath)}`);
            buildOptions.push(`-Palias=${settings.keyStoreAlias}`);
            buildOptions.push(`-Ppassword=${settings.keyStoreAliasPassword}`);
            buildOptions.push(`-PksPassword=${settings.keyStorePassword}`);
        }
        return buildOptions;
    }
    getBuildOptions(configurationFilePath) {
        this.$androidToolsInfo.validateInfo({ showWarningsAsErrors: true, validateTargetSdk: true });
        const androidToolsInfo = this.$androidToolsInfo.getToolsInfo();
        const compileSdk = androidToolsInfo.compileSdkVersion;
        const targetSdk = this.getTargetFromAndroidManifest(configurationFilePath) || compileSdk;
        const buildToolsVersion = androidToolsInfo.buildToolsVersion;
        const appCompatVersion = androidToolsInfo.supportRepositoryVersion;
        const generateTypings = androidToolsInfo.generateTypings;
        const buildOptions = [
            `-PcompileSdk=android-${compileSdk}`,
            `-PtargetSdk=${targetSdk}`,
            `-PbuildToolsVersion=${buildToolsVersion}`,
            `-PsupportVersion=${appCompatVersion}`,
            `-PgenerateTypings=${generateTypings}`
        ];
        return buildOptions;
    }
    buildForDeploy(projectRoot, projectData, buildConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.buildProject(projectRoot, projectData, buildConfig);
        });
    }
    isPlatformPrepared(projectRoot, projectData) {
        return this.$fs.exists(path.join(this.getPlatformData(projectData).appDestinationDirectoryPath, constants.APP_FOLDER_NAME));
    }
    getFrameworkFilesExtensions() {
        return [".jar", ".dat"];
    }
    prepareProject() {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    ensureConfigurationFileInAppResources(projectData) {
        const appResourcesDirectoryPath = projectData.appResourcesDirectoryPath;
        const appResourcesDirStructureHasMigrated = this.$androidResourcesMigrationService.hasMigrated(appResourcesDirectoryPath);
        let originalAndroidManifestFilePath;
        if (appResourcesDirStructureHasMigrated) {
            originalAndroidManifestFilePath = path.join(appResourcesDirectoryPath, this.$devicePlatformsConstants.Android, "src", "main", this.getPlatformData(projectData).configurationFileName);
        }
        else {
            originalAndroidManifestFilePath = path.join(appResourcesDirectoryPath, this.$devicePlatformsConstants.Android, this.getPlatformData(projectData).configurationFileName);
        }
        const manifestExists = this.$fs.exists(originalAndroidManifestFilePath);
        if (!manifestExists) {
            this.$logger.warn('No manifest found in ' + originalAndroidManifestFilePath);
            return;
        }
        if (!appResourcesDirStructureHasMigrated) {
            this.$fs.copyFile(originalAndroidManifestFilePath, this.getPlatformData(projectData).configurationFilePath);
        }
    }
    prepareAppResources(appResourcesDirectoryPath, projectData) {
        this.cleanUpPreparedResources(appResourcesDirectoryPath, projectData);
    }
    preparePluginNativeCode(pluginData, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.runtimeVersionIsGreaterThanOrEquals(projectData, "3.3.0")) {
                const pluginPlatformsFolderPath = this.getPluginPlatformsFolderPath(pluginData, AndroidProjectService.ANDROID_PLATFORM_NAME);
                yield this.processResourcesFromPlugin(pluginData, pluginPlatformsFolderPath, projectData);
            }
            else if (this.runtimeVersionIsGreaterThanOrEquals(projectData, "4.0.0")) {
                const pluginPlatformsFolderPath = this.getPluginPlatformsFolderPath(pluginData, AndroidProjectService.ANDROID_PLATFORM_NAME);
                if (this.$fs.exists(pluginPlatformsFolderPath)) {
                    const options = {
                        pluginName: pluginData.name,
                        platformsAndroidDirPath: pluginPlatformsFolderPath,
                        aarOutputDir: pluginPlatformsFolderPath,
                        tempPluginDirPath: path.join(projectData.platformsDir, "tempPlugin")
                    };
                    yield this.prebuildNativePlugin(options);
                }
            }
        });
    }
    checkIfPluginsNeedBuild(projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            const detectedPlugins = [];
            const platformsAndroid = path.join(constants.PLATFORMS_DIR_NAME, "android");
            const pathToPlatformsAndroid = path.join(projectData.projectDir, platformsAndroid);
            const dependenciesJson = yield this.$fs.readJson(path.join(pathToPlatformsAndroid, constants.DEPENDENCIES_JSON_NAME));
            const productionDependencies = dependenciesJson.map((item) => {
                return path.resolve(pathToPlatformsAndroid, item.directory);
            });
            for (const dependency of productionDependencies) {
                const jsonContent = this.$fs.readJson(path.join(dependency, constants.PACKAGE_JSON_FILE_NAME));
                const isPlugin = !!jsonContent.nativescript;
                const pluginName = jsonContent.name;
                if (isPlugin) {
                    const platformsAndroidDirPath = path.join(dependency, platformsAndroid);
                    if (this.$fs.exists(platformsAndroidDirPath)) {
                        let hasGeneratedAar = false;
                        let generatedAarPath = "";
                        const nativeFiles = this.$fs.enumerateFilesInDirectorySync(platformsAndroidDirPath).filter((item) => {
                            if (helpers_1.isRecommendedAarFile(item, pluginName)) {
                                generatedAarPath = item;
                                hasGeneratedAar = true;
                            }
                            return this.isAllowedFile(item);
                        });
                        if (hasGeneratedAar) {
                            const aarStat = this.$fs.getFsStats(generatedAarPath);
                            nativeFiles.forEach((item) => {
                                const currentItemStat = this.$fs.getFsStats(item);
                                if (currentItemStat.mtime > aarStat.mtime) {
                                    detectedPlugins.push({
                                        platformsAndroidDirPath,
                                        pluginName
                                    });
                                }
                            });
                        }
                        else if (nativeFiles.length > 0) {
                            detectedPlugins.push({
                                platformsAndroidDirPath,
                                pluginName
                            });
                        }
                    }
                }
            }
            return detectedPlugins;
        });
    }
    isAllowedFile(item) {
        return item.endsWith(constants.MANIFEST_FILE_NAME) || item.endsWith(constants.RESOURCES_DIR);
    }
    prebuildNativePlugin(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.$androidPluginBuildService.buildAar(options)) {
                this.$logger.info(`Built aar for ${options.pluginName}`);
            }
            this.$androidPluginBuildService.migrateIncludeGradle(options);
        });
    }
    processConfigurationFilesFromAppResources() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    processResourcesFromPlugin(pluginData, pluginPlatformsFolderPath, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            const configurationsDirectoryPath = path.join(this.getPlatformData(projectData).projectRoot, "configurations");
            this.$fs.ensureDirectoryExists(configurationsDirectoryPath);
            const pluginConfigurationDirectoryPath = path.join(configurationsDirectoryPath, pluginData.name);
            if (this.$fs.exists(pluginPlatformsFolderPath)) {
                this.$fs.ensureDirectoryExists(pluginConfigurationDirectoryPath);
                const isScoped = pluginData.name.indexOf("@") === 0;
                const flattenedDependencyName = isScoped ? pluginData.name.replace("/", "_") : pluginData.name;
                const resourcesDestinationDirectoryPath = path.join(this.getPlatformData(projectData).projectRoot, constants.SRC_DIR, flattenedDependencyName);
                this.$fs.ensureDirectoryExists(resourcesDestinationDirectoryPath);
                shell.cp("-Rf", path.join(pluginPlatformsFolderPath, "*"), resourcesDestinationDirectoryPath);
                const filesForInterpolation = this.$fs.enumerateFilesInDirectorySync(resourcesDestinationDirectoryPath, file => this.$fs.getFsStats(file).isDirectory() || path.extname(file) === constants.XML_FILE_EXTENSION) || [];
                for (const file of filesForInterpolation) {
                    this.$logger.trace(`Interpolate data for plugin file: ${file}`);
                    yield this.$pluginVariablesService.interpolate(pluginData, file, projectData);
                }
            }
            const includeGradleFilePath = path.join(pluginPlatformsFolderPath, constants.INCLUDE_GRADLE_NAME);
            if (this.$fs.exists(includeGradleFilePath)) {
                shell.cp("-f", includeGradleFilePath, pluginConfigurationDirectoryPath);
            }
        });
    }
    removePluginNativeCode(pluginData, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.runtimeVersionIsGreaterThanOrEquals(projectData, "3.3.0")) {
                    const pluginConfigDir = path.join(this.getPlatformData(projectData).projectRoot, "configurations", pluginData.name);
                    if (this.$fs.exists(pluginConfigDir)) {
                        yield this.cleanProject(this.getPlatformData(projectData).projectRoot, projectData);
                    }
                }
            }
            catch (e) {
                if (e.code === "ENOENT") {
                    this.$logger.debug("No native code jars found: " + e.message);
                }
                else {
                    throw e;
                }
            }
        });
    }
    afterPrepareAllPlugins(projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    beforePrepareAllPlugins(projectData, dependencies) {
        return __awaiter(this, void 0, void 0, function* () {
            const shouldUseNewRoutine = this.runtimeVersionIsGreaterThanOrEquals(projectData, "3.3.0");
            if (dependencies) {
                dependencies = this.filterUniqueDependencies(dependencies);
                if (shouldUseNewRoutine) {
                    this.provideDependenciesJson(projectData, dependencies);
                }
                else {
                    const platformDir = path.join(projectData.platformsDir, AndroidProjectService.ANDROID_PLATFORM_NAME);
                    const buildDir = path.join(platformDir, "build-tools");
                    const checkV8dependants = path.join(buildDir, "check-v8-dependants.js");
                    if (this.$fs.exists(checkV8dependants)) {
                        const stringifiedDependencies = JSON.stringify(dependencies);
                        try {
                            yield this.spawn('node', [checkV8dependants, stringifiedDependencies, projectData.platformsDir], { stdio: "inherit" });
                        }
                        catch (e) {
                            this.$logger.info("Checking for dependants on v8 public API failed. This is likely caused because of cyclic production dependencies. Error code: " + e.code + "\nMore information: https://github.com/NativeScript/nativescript-cli/issues/2561");
                        }
                    }
                }
            }
            if (!shouldUseNewRoutine) {
                const projectRoot = this.getPlatformData(projectData).projectRoot;
                yield this.cleanProject(projectRoot, projectData);
            }
        });
    }
    filterUniqueDependencies(dependencies) {
        const depsDictionary = dependencies.reduce((dict, dep) => {
            const collision = dict[dep.name];
            if (!collision || collision.depth > dep.depth) {
                dict[dep.name] = dep;
            }
            return dict;
        }, {});
        return _.values(depsDictionary);
    }
    provideDependenciesJson(projectData, dependencies) {
        const platformDir = path.join(projectData.platformsDir, AndroidProjectService.ANDROID_PLATFORM_NAME);
        const dependenciesJsonPath = path.join(platformDir, constants.DEPENDENCIES_JSON_NAME);
        const nativeDependencies = dependencies
            .filter(AndroidProjectService.isNativeAndroidDependency)
            .map(({ name, directory }) => ({ name, directory: path.relative(platformDir, directory) }));
        const jsonContent = JSON.stringify(nativeDependencies, null, 4);
        this.$fs.writeFile(dependenciesJsonPath, jsonContent);
    }
    static isNativeAndroidDependency({ nativescript }) {
        return nativescript && (nativescript.android || (nativescript.platforms && nativescript.platforms.android));
    }
    stopServices(projectRoot) {
        return this.executeCommand(projectRoot, ["--stop", "--quiet"], { stdio: "pipe" });
    }
    cleanProject(projectRoot, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.$androidToolsInfo.getToolsInfo().androidHomeEnvVar) {
                const buildOptions = this.getGradleBuildOptions({ release: false }, projectData);
                buildOptions.unshift("clean");
                yield this.executeCommand(projectRoot, buildOptions);
            }
        });
    }
    cleanDeviceTempFolder(deviceIdentifier, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            const adb = this.$injector.resolve(device_android_debug_bridge_1.DeviceAndroidDebugBridge, { identifier: deviceIdentifier });
            const deviceRootPath = `/data/local/tmp/${projectData.projectId}`;
            yield adb.executeShellCommand(["rm", "-rf", deviceRootPath]);
        });
    }
    checkForChanges(changesInfo, options, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    copy(projectRoot, frameworkDir, files, cpArg) {
        const paths = files.split(' ').map(p => path.join(frameworkDir, p));
        shell.cp(cpArg, paths, projectRoot);
    }
    spawn(command, args, opts, spawnOpts) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.$childProcess.spawnFromEvent(command, args, "close", opts || { stdio: "inherit" }, spawnOpts);
        });
    }
    validatePackageName(packageName) {
        if (!/^[a-zA-Z]+(\.[a-zA-Z0-9][a-zA-Z0-9_]*)+$/.test(packageName)) {
            this.$errors.fail("Package name must look like: com.company.Name");
        }
        if (/\b[Cc]lass\b/.test(packageName)) {
            this.$errors.fail("class is a reserved word");
        }
    }
    validateProjectName(projectName) {
        if (projectName === '') {
            this.$errors.fail("Project name cannot be empty");
        }
        if (/^[0-9]/.test(projectName)) {
            this.$errors.fail("Project name must not begin with a number");
        }
    }
    getTargetFromAndroidManifest(configurationFilePath) {
        let versionInManifest;
        if (this.$fs.exists(configurationFilePath)) {
            const targetFromAndroidManifest = this.$fs.readText(configurationFilePath);
            if (targetFromAndroidManifest) {
                const match = targetFromAndroidManifest.match(/.*?android:targetSdkVersion=\"(.*?)\"/);
                if (match && match[1]) {
                    versionInManifest = match[1];
                }
            }
        }
        return versionInManifest;
    }
    executeCommand(projectRoot, gradleArgs, childProcessOpts, spawnFromEventOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.$androidToolsInfo.getToolsInfo().androidHomeEnvVar) {
                const gradlew = this.$hostInfo.isWindows ? "gradlew.bat" : "./gradlew";
                if (this.$logger.getLevel() === "INFO") {
                    gradleArgs.push("--quiet");
                    this.$logger.info("Gradle build...");
                }
                childProcessOpts = childProcessOpts || {};
                childProcessOpts.cwd = childProcessOpts.cwd || projectRoot;
                childProcessOpts.stdio = childProcessOpts.stdio || "inherit";
                return yield this.spawn(gradlew, gradleArgs, childProcessOpts, spawnFromEventOptions);
            }
        });
    }
    isAndroidStudioCompatibleTemplate(projectData) {
        const currentPlatformData = this.$projectDataService.getNSValue(projectData.projectDir, constants.TNS_ANDROID_RUNTIME_NAME);
        let platformVersion = currentPlatformData && currentPlatformData[constants.VERSION_STRING];
        if (!platformVersion) {
            const tnsAndroidPackageJsonPath = path.join(projectData.projectDir, constants.NODE_MODULES_FOLDER_NAME, constants.TNS_ANDROID_RUNTIME_NAME, constants.PACKAGE_JSON_FILE_NAME);
            if (this.$fs.exists(tnsAndroidPackageJsonPath)) {
                const projectPackageJson = this.$fs.readJson(tnsAndroidPackageJsonPath);
                if (projectPackageJson && projectPackageJson.version) {
                    platformVersion = projectPackageJson.version;
                }
            }
            else {
                return true;
            }
        }
        if (platformVersion === constants.PackageVersion.NEXT || platformVersion === constants.PackageVersion.LATEST || platformVersion === constants.PackageVersion.RC) {
            return true;
        }
        const androidStudioCompatibleTemplate = "3.4.0";
        const normalizedPlatformVersion = `${semver.major(platformVersion)}.${semver.minor(platformVersion)}.0`;
        return semver.gte(normalizedPlatformVersion, androidStudioCompatibleTemplate);
    }
    runtimeVersionIsGreaterThanOrEquals(projectData, versionString) {
        const platformVersion = this.getCurrentPlatformVersion(this.getPlatformData(projectData), projectData);
        if (platformVersion === constants.PackageVersion.NEXT) {
            return true;
        }
        const normalizedPlatformVersion = `${semver.major(platformVersion)}.${semver.minor(platformVersion)}.0`;
        return semver.gte(normalizedPlatformVersion, versionString);
    }
    getLegacyAppResourcesDestinationDirPath(projectData) {
        const resourcePath = [constants.SRC_DIR, constants.MAIN_DIR, constants.RESOURCES_DIR];
        if (this.isAndroidStudioTemplate) {
            resourcePath.unshift(constants.APP_FOLDER_NAME);
        }
        return path.join(this.getPlatformData(projectData).projectRoot, ...resourcePath);
    }
    getUpdatedAppResourcesDestinationDirPath(projectData) {
        const resourcePath = [constants.SRC_DIR];
        if (this.isAndroidStudioTemplate) {
            resourcePath.unshift(constants.APP_FOLDER_NAME);
        }
        return path.join(this.getPlatformData(projectData).projectRoot, ...resourcePath);
    }
    cleanUpPreparedResources(appResourcesDirectoryPath, projectData) {
        let resourcesDirPath = path.join(appResourcesDirectoryPath, this.getPlatformData(projectData).normalizedPlatformName);
        if (this.$androidResourcesMigrationService.hasMigrated(projectData.appResourcesDirectoryPath)) {
            resourcesDirPath = path.join(resourcesDirPath, constants.MAIN_DIR, constants.RESOURCES_DIR);
        }
        const valuesDirRegExp = /^values/;
        if (this.$fs.exists(resourcesDirPath)) {
            const resourcesDirs = this.$fs.readDirectory(resourcesDirPath).filter(resDir => !resDir.match(valuesDirRegExp));
            const appResourcesDestinationDirectoryPath = this.getAppResourcesDestinationDirectoryPath(projectData);
            _.each(resourcesDirs, resourceDir => {
                this.$fs.deleteDirectory(path.join(appResourcesDestinationDirectoryPath, resourceDir));
            });
        }
    }
}
AndroidProjectService.VALUES_DIRNAME = "values";
AndroidProjectService.VALUES_VERSION_DIRNAME_PREFIX = AndroidProjectService.VALUES_DIRNAME + "-v";
AndroidProjectService.ANDROID_PLATFORM_NAME = "android";
AndroidProjectService.MIN_RUNTIME_VERSION_WITH_GRADLE = "1.5.0";
AndroidProjectService.REQUIRED_DEV_DEPENDENCIES = [
    { name: "babel-traverse", version: "^6.4.5" },
    { name: "babel-types", version: "^6.4.5" },
    { name: "babylon", version: "^6.4.5" },
    { name: "lazy", version: "^1.0.11" }
];
exports.AndroidProjectService = AndroidProjectService;
$injector.register("androidProjectService", AndroidProjectService);
