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
const iconv = require("iconv-lite");
const os_1 = require("os");
const osenv = require("osenv");
const path = require("path");
const helpers = require("../../helpers");
const net = require("net");
const device_android_debug_bridge_1 = require("./device-android-debug-bridge");
const decorators_1 = require("../../decorators");
class AndroidEmulatorServices {
    constructor($logger, $emulatorSettingsService, $errors, $childProcess, $fs, $staticConfig, $devicePlatformsConstants, $logcatHelper, $options, $utils, $injector, $hostInfo, $messages) {
        this.$logger = $logger;
        this.$emulatorSettingsService = $emulatorSettingsService;
        this.$errors = $errors;
        this.$childProcess = $childProcess;
        this.$fs = $fs;
        this.$staticConfig = $staticConfig;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.$logcatHelper = $logcatHelper;
        this.$options = $options;
        this.$utils = $utils;
        this.$injector = $injector;
        this.$hostInfo = $hostInfo;
        this.$messages = $messages;
        iconv.extendNodeEncodings();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.adbFilePath = yield this.$staticConfig.getAdbFilePath();
        });
    }
    get pathToEmulatorExecutable() {
        if (!this._pathToEmulatorExecutable) {
            const androidHome = process.env.ANDROID_HOME;
            const emulatorExecutableName = "emulator";
            this._pathToEmulatorExecutable = emulatorExecutableName;
            if (androidHome) {
                const pathToEmulatorFromAndroidStudio = path.join(androidHome, emulatorExecutableName, emulatorExecutableName);
                const realFilePath = this.$hostInfo.isWindows ? `${pathToEmulatorFromAndroidStudio}.exe` : pathToEmulatorFromAndroidStudio;
                if (this.$fs.exists(realFilePath)) {
                    this._pathToEmulatorExecutable = pathToEmulatorFromAndroidStudio;
                }
                else {
                    this._pathToEmulatorExecutable = path.join(androidHome, "tools", emulatorExecutableName);
                }
            }
        }
        return this._pathToEmulatorExecutable;
    }
    getEmulatorId() {
        return __awaiter(this, void 0, void 0, function* () {
            const image = this.getEmulatorImage();
            if (!image) {
                this.$errors.fail("Could not find an emulator image to run your project.");
            }
            const emulatorId = yield this.startEmulatorInstance(image);
            return emulatorId;
        });
    }
    checkDependencies() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkAndroidSDKConfiguration();
            if (this.$options.geny) {
                yield this.checkGenymotionConfiguration();
            }
        });
    }
    checkAvailability() {
        if (!this.getEmulatorImage()) {
            this.$errors.failWithoutHelp("You do not have any Android emulators installed. Please install at least one.");
        }
        const platform = this.$devicePlatformsConstants.Android;
        if (!this.$emulatorSettingsService.canStart(platform)) {
            this.$errors.fail("The current project does not target Android and cannot be run in the Android emulator.");
        }
    }
    startEmulator(emulatorImage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.$options.avd && this.$options.geny) {
                this.$errors.fail("You cannot specify both --avd and --geny options. Please use only one of them.");
            }
            let emulatorId = null;
            const image = this.getEmulatorImage(emulatorImage);
            if (image) {
                emulatorId = yield this.startEmulatorInstance(image);
                yield this.waitForEmulatorBootToComplete(emulatorId);
                yield this.unlockScreen(emulatorId);
            }
            else {
                if (emulatorImage) {
                    this.$errors.fail(`No emulator image available for device identifier '${emulatorImage}'.`);
                }
                else {
                    this.$errors.fail(this.$messages.Devices.NotFoundDeviceByIdentifierErrorMessage, this.$staticConfig.CLIENT_NAME.toLowerCase());
                }
            }
            return emulatorId;
        });
    }
    runApplicationOnEmulator(app, emulatorOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const emulatorId = yield this.startEmulator();
            yield this.runApplicationOnEmulatorCore(app, emulatorOptions.appId, emulatorId);
        });
    }
    checkAndroidSDKConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.$childProcess.tryExecuteApplication(this.pathToEmulatorExecutable, ['-help'], "exit", AndroidEmulatorServices.MISSING_SDK_MESSAGE);
            }
            catch (err) {
                this.$logger.trace(`Error while checking Android SDK configuration: ${err}`);
                this.$errors.failWithoutHelp("Android SDK is not configured properly. Make sure you have added tools and platform-tools to your PATH environment variable.");
            }
        });
    }
    getDeviceAndroidDebugBridge(deviceIdentifier) {
        return this.$injector.resolve(device_android_debug_bridge_1.DeviceAndroidDebugBridge, { identifier: deviceIdentifier });
    }
    checkGenymotionConfiguration() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const condition = (childProcess) => childProcess.stderr && !_.startsWith(childProcess.stderr, "Usage:");
                yield this.$childProcess.tryExecuteApplication("player", [], "exit", AndroidEmulatorServices.MISSING_GENYMOTION_MESSAGE, condition);
            }
            catch (err) {
                this.$logger.trace(`Error while checking Genymotion configuration: ${err}`);
                this.$errors.failWithoutHelp("Genymotion is not configured properly. Make sure you have added its installation directory to your PATH environment variable.");
            }
        });
    }
    getEmulatorImage(suggestedImage) {
        const image = this.$options.avd || this.$options.geny || this.getBestFit(suggestedImage);
        return image;
    }
    runApplicationOnEmulatorCore(app, appId, emulatorId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$logger.info("installing %s through adb", app);
            const adb = this.getDeviceAndroidDebugBridge(emulatorId);
            let childProcess = yield adb.executeCommand(["install", "-r", app], { returnChildProcess: true });
            yield this.$fs.futureFromEvent(childProcess, "close");
            yield this.unlockScreen(emulatorId);
            this.$logger.info("running %s through adb", app);
            const androidDebugBridgeCommandOptions = {
                childProcessOptions: { stdio: "ignore", detached: true },
                returnChildProcess: true
            };
            childProcess = yield adb.executeShellCommand(["monkey", "-p", appId, "-c", "android.intent.category.LAUNCHER", "1"], androidDebugBridgeCommandOptions);
            yield this.$fs.futureFromEvent(childProcess, "close");
            if (!this.$options.justlaunch) {
                yield this.$logcatHelper.start(emulatorId);
            }
        });
    }
    unlockScreen(emulatorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const adb = this.getDeviceAndroidDebugBridge(emulatorId);
            const childProcess = yield adb.executeShellCommand(["input", "keyevent", "82"], { returnChildProcess: true });
            return this.$fs.futureFromEvent(childProcess, "close");
        });
    }
    sleep(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(() => __awaiter(this, void 0, void 0, function* () { return resolve(); }), ms);
        });
    }
    getRunningEmulatorId(image) {
        return __awaiter(this, void 0, void 0, function* () {
            const runningEmulators = yield this.getRunningEmulators();
            if (runningEmulators.length === 0) {
                return "";
            }
            const getNameFunction = this.$options.geny ? this.getNameFromGenymotionEmulatorId : this.getNameFromSDKEmulatorId;
            for (const emulatorId of runningEmulators) {
                const currentEmulatorName = yield getNameFunction.apply(this, [emulatorId]);
                if (currentEmulatorName === image) {
                    return emulatorId;
                }
            }
        });
    }
    getNameFromGenymotionEmulatorId(emulatorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const modelOutputLines = yield this.$childProcess.execFile(this.adbFilePath, ["-s", emulatorId, "shell", "getprop", "ro.product.model"]);
            this.$logger.trace(modelOutputLines);
            const model = _.first(modelOutputLines.split(os_1.EOL)).trim();
            return model;
        });
    }
    getNameFromSDKEmulatorId(emulatorId) {
        const match = emulatorId.match(/^emulator-(\d+)/);
        let portNumber;
        if (match && match[1]) {
            portNumber = match[1];
        }
        else {
            return Promise.resolve("");
        }
        return new Promise((resolve, reject) => {
            let isResolved = false;
            let output = "";
            const client = net.connect(portNumber, () => {
                client.write(`avd name${os_1.EOL}`);
            });
            client.on('data', (data) => {
                output += data.toString();
                const name = this.getEmulatorNameFromClientOutput(output);
                if (name && !isResolved) {
                    isResolved = true;
                    resolve(name);
                }
                client.end();
            });
        });
    }
    getEmulatorNameFromClientOutput(output) {
        const lines = _.map(output.split(os_1.EOL), (line) => line.trim());
        let name;
        const firstIndexOfOk = _.indexOf(lines, "OK");
        if (firstIndexOfOk < 0) {
            return null;
        }
        const secondIndexOfOk = _.indexOf(lines, "OK", firstIndexOfOk + 1);
        if (secondIndexOfOk < 0) {
            return null;
        }
        name = lines[secondIndexOfOk - 1].trim();
        return name;
    }
    startEmulatorInstance(image) {
        return __awaiter(this, void 0, void 0, function* () {
            let emulatorId = yield this.getRunningEmulatorId(image);
            this.endTimeEpoch = helpers.getCurrentEpochTime() + this.$utils.getMilliSecondsTimeout(AndroidEmulatorServices.TIMEOUT_SECONDS);
            if (emulatorId) {
                return emulatorId;
            }
            this.$logger.info("Starting Android emulator with image %s", image);
            if (this.$options.geny) {
                this.$childProcess.spawn("player", ["--vm-name", image], { stdio: "ignore", detached: true }).unref();
            }
            else {
                this.$childProcess.spawn(this.pathToEmulatorExecutable, ['-avd', image], { stdio: "ignore", detached: true }).unref();
            }
            const isInfiniteWait = this.$utils.getMilliSecondsTimeout(AndroidEmulatorServices.TIMEOUT_SECONDS) === 0;
            let hasTimeLeft = helpers.getCurrentEpochTime() < this.endTimeEpoch;
            while (hasTimeLeft || isInfiniteWait) {
                emulatorId = yield this.getRunningEmulatorId(image);
                if (emulatorId) {
                    return emulatorId;
                }
                yield this.sleep(10000);
                hasTimeLeft = helpers.getCurrentEpochTime() < this.endTimeEpoch;
            }
            if (!hasTimeLeft && !isInfiniteWait) {
                this.$errors.fail(AndroidEmulatorServices.UNABLE_TO_START_EMULATOR_MESSAGE);
            }
            return emulatorId;
        });
    }
    getRunningGenymotionEmulators(adbDevicesOutput) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield Promise.all((_(adbDevicesOutput)
                .filter(r => !r.match(AndroidEmulatorServices.RUNNING_ANDROID_EMULATOR_REGEX))
                .map((row) => __awaiter(this, void 0, void 0, function* () {
                const match = row.match(/^(.+?)\s+device$/);
                if (match && match[1]) {
                    const emulatorId = match[1];
                    const result = (yield this.isGenymotionEmulator(emulatorId)) ? emulatorId : undefined;
                    return Promise.resolve(result);
                }
                return Promise.resolve(undefined);
            })).value()));
            return _(results).filter(r => !!r)
                .map(r => r.toString())
                .value();
        });
    }
    getRunningAvdEmulators(adbDevicesOutput) {
        return __awaiter(this, void 0, void 0, function* () {
            const emulatorDevices = [];
            _.each(adbDevicesOutput, (device) => {
                const rx = device.match(AndroidEmulatorServices.RUNNING_ANDROID_EMULATOR_REGEX);
                if (rx && rx[1]) {
                    emulatorDevices.push(rx[1]);
                }
            });
            return emulatorDevices;
        });
    }
    isGenymotionEmulator(emulatorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const manufacturer = yield this.$childProcess.execFile(this.adbFilePath, ["-s", emulatorId, "shell", "getprop", "ro.product.manufacturer"]);
            if (manufacturer.match(/^Genymotion/i)) {
                return true;
            }
            const buildProduct = yield this.$childProcess.execFile(this.adbFilePath, ["-s", emulatorId, "shell", "getprop", "ro.build.product"]);
            if (buildProduct && _.includes(buildProduct.toLowerCase(), "vbox")) {
                return true;
            }
            return false;
        });
    }
    getAllRunningEmulators() {
        return __awaiter(this, void 0, void 0, function* () {
            const outputRaw = (yield this.$childProcess.execFile(this.adbFilePath, ['devices'])).split(os_1.EOL);
            const emulators = (yield this.getRunningAvdEmulators(outputRaw)).concat(yield this.getRunningGenymotionEmulators(outputRaw));
            return emulators;
        });
    }
    getRunningEmulators() {
        return __awaiter(this, void 0, void 0, function* () {
            const outputRaw = (yield this.$childProcess.execFile(this.adbFilePath, ['devices'])).split(os_1.EOL);
            if (this.$options.geny) {
                return yield this.getRunningGenymotionEmulators(outputRaw);
            }
            else {
                return yield this.getRunningAvdEmulators(outputRaw);
            }
        });
    }
    getInfoFromAvd(avdName) {
        let iniFile = path.join(this.avdDir, avdName + ".ini");
        let avdInfo = this.parseAvdFile(avdName, iniFile);
        if (avdInfo.path && this.$fs.exists(avdInfo.path)) {
            iniFile = path.join(avdInfo.path, "config.ini");
            avdInfo = this.parseAvdFile(avdName, iniFile, avdInfo);
        }
        return avdInfo;
    }
    getAvds() {
        let result = [];
        if (this.$fs.exists(this.avdDir)) {
            const entries = this.$fs.readDirectory(this.avdDir);
            result = _.filter(entries, (e) => e.match(AndroidEmulatorServices.INI_FILES_MASK) !== null)
                .map((e) => e.match(AndroidEmulatorServices.INI_FILES_MASK)[1]);
        }
        return result;
    }
    getBestFit(suggestedImage) {
        const minVersion = this.$emulatorSettingsService.minVersion;
        let avdResults = this.getAvds();
        if (suggestedImage) {
            avdResults = avdResults.filter(avd => avd === suggestedImage);
        }
        const best = _(avdResults)
            .map(avd => this.getInfoFromAvd(avd))
            .filter(avd => !!avd)
            .maxBy(avd => avd.targetNum);
        return (best && best.targetNum >= minVersion) ? best.name : null;
    }
    parseAvdFile(avdName, avdFileName, avdInfo) {
        if (!this.$fs.exists(avdFileName)) {
            return null;
        }
        const encoding = this.getAvdEncoding(avdFileName);
        const contents = this.$fs.readText(avdFileName, encoding).split("\n");
        avdInfo = _.reduce(contents, (result, line) => {
            const parsedLine = line.split("=");
            const key = parsedLine[0];
            switch (key) {
                case "target":
                    result.target = parsedLine[1];
                    result.targetNum = this.readTargetNum(result.target);
                    break;
                case "path":
                    result.path = parsedLine[1];
                    break;
                case "hw.device.name":
                    result.device = parsedLine[1];
                    break;
                case "abi.type":
                    result.abi = parsedLine[1];
                    break;
                case "skin.name":
                    result.skin = parsedLine[1];
                    break;
                case "sdcard.size":
                    result.sdcard = parsedLine[1];
                    break;
            }
            return result;
        }, avdInfo || Object.create(null));
        avdInfo.name = avdName;
        return avdInfo;
    }
    readTargetNum(target) {
        const platform = target.replace('android-', '');
        let platformNumber = +platform;
        if (isNaN(platformNumber)) {
            const googlePlatform = target.split(":")[2];
            if (googlePlatform) {
                platformNumber = +googlePlatform;
            }
            else if (platform === "L") {
                platformNumber = 20;
            }
            else if (platform === "MNC") {
                platformNumber = 22;
            }
        }
        return platformNumber;
    }
    getAvdEncoding(avdName) {
        let encoding = "utf8";
        let contents = this.$fs.readText(avdName, "ascii");
        if (contents.length > 0) {
            contents = contents.split("\n", 1)[0];
            if (contents.length > 0) {
                const matches = contents.match(AndroidEmulatorServices.ENCODING_MASK);
                if (matches) {
                    encoding = matches[1];
                }
            }
        }
        return encoding;
    }
    get androidHomeDir() {
        return path.join(osenv.home(), AndroidEmulatorServices.ANDROID_DIR_NAME);
    }
    get avdDir() {
        return path.join(this.androidHomeDir, AndroidEmulatorServices.AVD_DIR_NAME);
    }
    waitForEmulatorBootToComplete(emulatorId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$logger.printInfoMessageOnSameLine("Waiting for emulator device initialization...");
            const isInfiniteWait = this.$utils.getMilliSecondsTimeout(AndroidEmulatorServices.TIMEOUT_SECONDS) === 0;
            while (helpers.getCurrentEpochTime() < this.endTimeEpoch || isInfiniteWait) {
                const isEmulatorBootCompleted = yield this.isEmulatorBootCompleted(emulatorId);
                if (isEmulatorBootCompleted) {
                    this.$logger.printInfoMessageOnSameLine(os_1.EOL);
                    return;
                }
                this.$logger.printInfoMessageOnSameLine(".");
                yield this.sleep(10000);
            }
            this.$logger.printInfoMessageOnSameLine(os_1.EOL);
            this.$errors.fail(AndroidEmulatorServices.UNABLE_TO_START_EMULATOR_MESSAGE);
        });
    }
    isEmulatorBootCompleted(emulatorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = yield this.$childProcess.execFile(this.adbFilePath, ["-s", emulatorId, "shell", "getprop", "dev.bootcomplete"]);
            const matches = output.match("1");
            return matches && matches.length > 0;
        });
    }
}
AndroidEmulatorServices.ANDROID_DIR_NAME = ".android";
AndroidEmulatorServices.AVD_DIR_NAME = "avd";
AndroidEmulatorServices.INI_FILES_MASK = /^(.*)\.ini$/i;
AndroidEmulatorServices.ENCODING_MASK = /^avd\.ini\.encoding=(.*)$/;
AndroidEmulatorServices.TIMEOUT_SECONDS = 120;
AndroidEmulatorServices.UNABLE_TO_START_EMULATOR_MESSAGE = "Cannot run your app in the native emulator. Increase the timeout of the operation with the --timeout option or try to restart your adb server with 'adb kill-server' command. Alternatively, run the Android Virtual Device manager and increase the allocated RAM for the virtual device.";
AndroidEmulatorServices.RUNNING_ANDROID_EMULATOR_REGEX = /^(emulator-\d+)\s+device$/;
AndroidEmulatorServices.MISSING_SDK_MESSAGE = "The Android SDK is not configured properly. " +
    "Verify that you have installed the Android SDK and that you have configured it as described in System Requirements.";
AndroidEmulatorServices.MISSING_GENYMOTION_MESSAGE = "Genymotion is not configured properly. " +
    "Verify that you have installed Genymotion and that you have added its installation directory to your PATH environment variable.";
__decorate([
    decorators_1.cache()
], AndroidEmulatorServices.prototype, "init", null);
__decorate([
    decorators_1.invokeInit()
], AndroidEmulatorServices.prototype, "getNameFromGenymotionEmulatorId", null);
__decorate([
    decorators_1.invokeInit()
], AndroidEmulatorServices.prototype, "isGenymotionEmulator", null);
__decorate([
    decorators_1.invokeInit()
], AndroidEmulatorServices.prototype, "getAllRunningEmulators", null);
__decorate([
    decorators_1.invokeInit()
], AndroidEmulatorServices.prototype, "getRunningEmulators", null);
__decorate([
    decorators_1.invokeInit()
], AndroidEmulatorServices.prototype, "isEmulatorBootCompleted", null);
$injector.register("androidEmulatorServices", AndroidEmulatorServices);
