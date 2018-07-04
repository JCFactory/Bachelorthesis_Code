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
const semver = require("semver");
const decorators_1 = require("./common/decorators");
const nativescript_doctor_1 = require("nativescript-doctor");
class AndroidToolsInfo {
    constructor($errors, $fs, $logger, $options, $staticConfig) {
        this.$errors = $errors;
        this.$fs = $fs;
        this.$logger = $logger;
        this.$options = $options;
        this.$staticConfig = $staticConfig;
    }
    get androidHome() {
        return process.env["ANDROID_HOME"];
    }
    getToolsInfo() {
        if (!this.toolsInfo) {
            const infoData = Object.create(null);
            infoData.androidHomeEnvVar = this.androidHome;
            infoData.compileSdkVersion = this.getCompileSdkVersion();
            infoData.buildToolsVersion = this.getBuildToolsVersion();
            infoData.targetSdkVersion = this.getTargetSdk();
            infoData.supportRepositoryVersion = this.getAndroidSupportRepositoryVersion();
            infoData.generateTypings = this.shouldGenerateTypings();
            this.toolsInfo = infoData;
        }
        return this.toolsInfo;
    }
    validateInfo(options) {
        let detectedErrors = false;
        this.showWarningsAsErrors = options && options.showWarningsAsErrors;
        const isAndroidHomeValid = this.validateAndroidHomeEnvVariable();
        detectedErrors = nativescript_doctor_1.androidToolsInfo.validateInfo().map(warning => this.printMessage(warning.warning)).length > 0;
        if (options && options.validateTargetSdk) {
            detectedErrors = this.validateTargetSdk();
        }
        return detectedErrors || !isAndroidHomeValid;
    }
    validateTargetSdk(options) {
        this.showWarningsAsErrors = options && options.showWarningsAsErrors;
        const toolsInfoData = this.getToolsInfo();
        const targetSdk = toolsInfoData.targetSdkVersion;
        const newTarget = `${AndroidToolsInfo.ANDROID_TARGET_PREFIX}-${targetSdk}`;
        if (!_.includes(AndroidToolsInfo.SUPPORTED_TARGETS, newTarget)) {
            const supportedVersions = AndroidToolsInfo.SUPPORTED_TARGETS.sort();
            const minSupportedVersion = this.parseAndroidSdkString(_.first(supportedVersions));
            if (targetSdk && (targetSdk < minSupportedVersion)) {
                this.printMessage(`The selected Android target SDK ${newTarget} is not supported. You must target ${minSupportedVersion} or later.`);
                return true;
            }
            else if (!targetSdk || targetSdk > this.getMaxSupportedVersion()) {
                this.$logger.warn(`Support for the selected Android target SDK ${newTarget} is not verified. Your Android app might not work as expected.`);
            }
        }
        return false;
    }
    validateJavacVersion(installedJavacVersion, options) {
        if (options) {
            this.showWarningsAsErrors = options.showWarningsAsErrors;
        }
        return nativescript_doctor_1.androidToolsInfo.validateJavacVersion(installedJavacVersion).map(warning => this.printMessage(warning.warning)).length > 0;
    }
    getPathToAdbFromAndroidHome() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return nativescript_doctor_1.androidToolsInfo.getPathToAdbFromAndroidHome();
            }
            catch (err) {
                this.$logger.trace(`Error while executing '${path.join(this.androidHome, "platform-tools", "adb")} help'. Error is: ${err.message}`);
            }
            return null;
        });
    }
    validateAndroidHomeEnvVariable(options) {
        if (options) {
            this.showWarningsAsErrors = options.showWarningsAsErrors;
        }
        return nativescript_doctor_1.androidToolsInfo.validateAndroidHomeEnvVariable().map(warning => this.printMessage(warning.warning)).length > 0;
    }
    shouldGenerateTypings() {
        return this.$options.androidTypings;
    }
    printMessage(msg, additionalMsg) {
        if (this.showWarningsAsErrors) {
            this.$errors.failWithoutHelp(msg);
        }
        else {
            this.$logger.warn(msg);
        }
        if (additionalMsg) {
            this.$logger.printMarkdown(additionalMsg);
        }
    }
    getCompileSdkVersion() {
        if (!this.selectedCompileSdk) {
            const userSpecifiedCompileSdk = this.$options.compileSdk;
            if (userSpecifiedCompileSdk) {
                const installedTargets = this.getInstalledTargets();
                const androidCompileSdk = `${AndroidToolsInfo.ANDROID_TARGET_PREFIX}-${userSpecifiedCompileSdk}`;
                if (!_.includes(installedTargets, androidCompileSdk)) {
                    this.$errors.failWithoutHelp(`You have specified '${userSpecifiedCompileSdk}' for compile sdk, but it is not installed on your system.`);
                }
                this.selectedCompileSdk = userSpecifiedCompileSdk;
            }
            else {
                const latestValidAndroidTarget = this.getLatestValidAndroidTarget();
                if (latestValidAndroidTarget) {
                    const integerVersion = this.parseAndroidSdkString(latestValidAndroidTarget);
                    if (integerVersion && integerVersion >= AndroidToolsInfo.MIN_REQUIRED_COMPILE_TARGET) {
                        this.selectedCompileSdk = integerVersion;
                    }
                }
            }
        }
        return this.selectedCompileSdk;
    }
    getTargetSdk() {
        const targetSdk = this.$options.sdk ? parseInt(this.$options.sdk) : this.getCompileSdkVersion();
        this.$logger.trace(`Selected targetSdk is: ${targetSdk}`);
        return targetSdk;
    }
    getMatchingDir(pathToDir, versionRange) {
        let selectedVersion;
        if (this.$fs.exists(pathToDir)) {
            const subDirs = this.$fs.readDirectory(pathToDir);
            this.$logger.trace(`Directories found in ${pathToDir} are ${subDirs.join(", ")}`);
            const subDirsVersions = subDirs
                .map(dirName => {
                const dirNameGroups = dirName.match(AndroidToolsInfo.VERSION_REGEX);
                if (dirNameGroups) {
                    return dirNameGroups[1];
                }
                return null;
            })
                .filter(dirName => !!dirName);
            this.$logger.trace(`Versions found in ${pathToDir} are ${subDirsVersions.join(", ")}`);
            const version = semver.maxSatisfying(subDirsVersions, versionRange);
            if (version) {
                selectedVersion = _.find(subDirs, dir => dir.indexOf(version) !== -1);
            }
        }
        this.$logger.trace("Selected version is: ", selectedVersion);
        return selectedVersion;
    }
    getBuildToolsRange() {
        return `${AndroidToolsInfo.REQUIRED_BUILD_TOOLS_RANGE_PREFIX} <=${this.getMaxSupportedVersion()}`;
    }
    getBuildToolsVersion() {
        let buildToolsVersion;
        if (this.androidHome) {
            const pathToBuildTools = path.join(this.androidHome, "build-tools");
            const buildToolsRange = this.getBuildToolsRange();
            buildToolsVersion = this.getMatchingDir(pathToBuildTools, buildToolsRange);
        }
        return buildToolsVersion;
    }
    getAppCompatRange() {
        const compileSdkVersion = this.getCompileSdkVersion();
        let requiredAppCompatRange;
        if (compileSdkVersion) {
            requiredAppCompatRange = `>=${compileSdkVersion} <${compileSdkVersion + 1}`;
        }
        return requiredAppCompatRange;
    }
    getAndroidSupportRepositoryVersion() {
        let selectedAppCompatVersion;
        const requiredAppCompatRange = this.getAppCompatRange();
        if (this.androidHome && requiredAppCompatRange) {
            const pathToAppCompat = path.join(this.androidHome, "extras", "android", "m2repository", "com", "android", "support", "appcompat-v7");
            selectedAppCompatVersion = this.getMatchingDir(pathToAppCompat, requiredAppCompatRange);
            if (!selectedAppCompatVersion) {
                selectedAppCompatVersion = this.getMatchingDir(pathToAppCompat, "*");
            }
        }
        this.$logger.trace(`Selected AppCompat version is: ${selectedAppCompatVersion}`);
        return selectedAppCompatVersion;
    }
    getLatestValidAndroidTarget() {
        const installedTargets = this.getInstalledTargets();
        return _.findLast(AndroidToolsInfo.SUPPORTED_TARGETS.sort(), supportedTarget => _.includes(installedTargets, supportedTarget));
    }
    parseAndroidSdkString(androidSdkString) {
        return parseInt(androidSdkString.replace(`${AndroidToolsInfo.ANDROID_TARGET_PREFIX}-`, ""));
    }
    getInstalledTargets() {
        let installedTargets = [];
        if (this.androidHome) {
            const pathToInstalledTargets = path.join(this.androidHome, "platforms");
            if (this.$fs.exists(pathToInstalledTargets)) {
                installedTargets = this.$fs.readDirectory(pathToInstalledTargets);
            }
        }
        this.$logger.trace("Installed Android Targets are: ", installedTargets);
        return installedTargets;
    }
    getMaxSupportedVersion() {
        return this.parseAndroidSdkString(_.last(AndroidToolsInfo.SUPPORTED_TARGETS.sort()));
    }
}
AndroidToolsInfo.ANDROID_TARGET_PREFIX = "android";
AndroidToolsInfo.SUPPORTED_TARGETS = ["android-17", "android-18", "android-19", "android-21", "android-22", "android-23", "android-24", "android-25", "android-26", "android-27"];
AndroidToolsInfo.MIN_REQUIRED_COMPILE_TARGET = 22;
AndroidToolsInfo.REQUIRED_BUILD_TOOLS_RANGE_PREFIX = ">=23";
AndroidToolsInfo.VERSION_REGEX = /((\d+\.){2}\d+)/;
__decorate([
    decorators_1.cache()
], AndroidToolsInfo.prototype, "getToolsInfo", null);
__decorate([
    decorators_1.cache()
], AndroidToolsInfo.prototype, "validateAndroidHomeEnvVariable", null);
__decorate([
    decorators_1.cache()
], AndroidToolsInfo.prototype, "getInstalledTargets", null);
exports.AndroidToolsInfo = AndroidToolsInfo;
$injector.register("androidToolsInfo", AndroidToolsInfo);
