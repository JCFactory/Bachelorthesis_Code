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
const device_android_debug_bridge_1 = require("./device-android-debug-bridge");
const applicationManagerPath = require("./android-application-manager");
const fileSystemPath = require("./android-device-file-system");
const constants = require("../../constants");
const decorators_1 = require("../../decorators");
class AndroidDevice {
    constructor(identifier, status, $androidEmulatorServices, $logger, $devicePlatformsConstants, $logcatHelper, $injector) {
        this.identifier = identifier;
        this.status = status;
        this.$androidEmulatorServices = $androidEmulatorServices;
        this.$logger = $logger;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.$logcatHelper = $logcatHelper;
        this.$injector = $injector;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.adb = this.$injector.resolve(device_android_debug_bridge_1.DeviceAndroidDebugBridge, { identifier: this.identifier });
            this.applicationManager = this.$injector.resolve(applicationManagerPath.AndroidApplicationManager, { adb: this.adb, identifier: this.identifier });
            this.fileSystem = this.$injector.resolve(fileSystemPath.AndroidDeviceFileSystem, { adb: this.adb });
            let details = yield this.getDeviceDetails(["getprop"]);
            if (!details || !details.name) {
                details = yield this.getDeviceDetails(["cat", "/system/build.prop"]);
            }
            this.$logger.trace(details);
            const adbStatusInfo = AndroidDevice.ADB_DEVICE_STATUS_INFO[this.status];
            this.deviceInfo = {
                identifier: this.identifier,
                displayName: details.name,
                model: details.model,
                version: details.release,
                vendor: details.brand,
                platform: this.$devicePlatformsConstants.Android,
                status: adbStatusInfo ? adbStatusInfo.deviceStatus : this.status,
                errorHelp: adbStatusInfo ? adbStatusInfo.errorHelp : "Unknown status",
                isTablet: this.getIsTablet(details),
                type: yield this.getType()
            };
            this.$logger.trace(this.deviceInfo);
        });
    }
    get isEmulator() {
        return this.deviceInfo.type === constants.DeviceTypes.Emulator;
    }
    getApplicationInfo(applicationIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield this.fileSystem.listFiles(constants.LiveSyncConstants.ANDROID_FILES_PATH, applicationIdentifier);
            const androidFilesMatch = files.match(/(\S+)\.abproject/);
            let result = null;
            if (androidFilesMatch && androidFilesMatch[1]) {
                result = {
                    deviceIdentifier: this.deviceInfo.identifier,
                    configuration: androidFilesMatch[1],
                    applicationIdentifier
                };
            }
            return result;
        });
    }
    openDeviceLogStream() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.deviceInfo.status === constants.CONNECTED_STATUS) {
                yield this.$logcatHelper.start(this.identifier);
            }
        });
    }
    getDeviceDetails(shellCommandArgs) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsedDetails = {};
            this.$logger.trace(`Trying to get information for Android device. Command is: ${shellCommandArgs}`);
            try {
                const details = yield this.adb.executeShellCommand(shellCommandArgs);
                details.split(/\r?\n|\r/).forEach((value) => {
                    const match = /(?:\[?ro\.build\.version|ro\.product|ro\.build)\.(.+?)]?(?:\:|=)(?:\s*?\[)?(.*?)]?$/.exec(value);
                    if (match) {
                        parsedDetails[match[1]] = match[2];
                    }
                });
            }
            catch (err) {
                this.$logger.trace(`Error while getting details from Android device. Command is: ${shellCommandArgs}. Error is: ${err}`);
            }
            this.$logger.trace(parsedDetails);
            return parsedDetails;
        });
    }
    getIsTablet(details) {
        return details && (_.startsWith(details.release, "3.") || _.includes((details.characteristics || '').toLowerCase(), "tablet"));
    }
    getType() {
        return __awaiter(this, void 0, void 0, function* () {
            const runningEmulators = yield this.$androidEmulatorServices.getAllRunningEmulators();
            if (_.includes(runningEmulators, this.identifier)) {
                return constants.DeviceTypes.Emulator;
            }
            return constants.DeviceTypes.Device;
        });
    }
}
AndroidDevice.ADB_DEVICE_STATUS_INFO = {
    "device": {
        errorHelp: null,
        deviceStatus: constants.CONNECTED_STATUS
    },
    "offline": {
        errorHelp: "The device instance is not connected to adb or is not responding.",
        deviceStatus: constants.UNREACHABLE_STATUS
    },
    "unauthorized": {
        errorHelp: "Allow USB Debugging on your device.",
        deviceStatus: constants.UNREACHABLE_STATUS
    },
    "recovery": {
        errorHelp: "Your device is in recovery mode. This mode is used to recover your phone when it is broken or to install custom roms.",
        deviceStatus: constants.UNREACHABLE_STATUS
    },
    "no permissions": {
        errorHelp: "Insufficient permissions to communicate with the device.",
        deviceStatus: constants.UNREACHABLE_STATUS
    },
};
__decorate([
    decorators_1.cache()
], AndroidDevice.prototype, "init", null);
exports.AndroidDevice = AndroidDevice;
