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
const util = require("util");
const appbuilder_device_app_data_base_1 = require("../mobile/appbuilder-device-app-data-base");
const appbuilder_companion_device_app_data_base_1 = require("../mobile/appbuilder-companion-device-app-data-base");
const constants_1 = require("../../constants");
const decorators_1 = require("../../decorators");
class AndroidAppIdentifier extends appbuilder_device_app_data_base_1.AppBuilderDeviceAppDataBase {
    constructor(_appIdentifier, device, platform, $deployHelper, $devicePlatformsConstants, $errors) {
        super(_appIdentifier, device, platform, $deployHelper);
        this.$errors = $errors;
    }
    getDeviceProjectRootPath() {
        return __awaiter(this, void 0, void 0, function* () {
            let deviceTmpDirFormat = "";
            const version = yield this.getLiveSyncVersion();
            if (version === 2) {
                deviceTmpDirFormat = constants_1.LiveSyncConstants.DEVICE_TMP_DIR_FORMAT_V2;
            }
            else if (version === 3) {
                deviceTmpDirFormat = constants_1.LiveSyncConstants.DEVICE_TMP_DIR_FORMAT_V3;
            }
            else {
                this.$errors.failWithoutHelp(`Unsupported LiveSync version: ${version}`);
            }
            return this._getDeviceProjectRootPath(util.format(deviceTmpDirFormat, this.appIdentifier));
        });
    }
    encodeLiveSyncHostUri(hostUri) {
        return hostUri;
    }
    isLiveSyncSupported() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            return (yield _super("isLiveSyncSupported").call(this)) && (yield this.getLiveSyncVersion()) !== 0;
        });
    }
    getLiveSyncVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.device.adb.sendBroadcastToDevice(constants_1.LiveSyncConstants.CHECK_LIVESYNC_INTENT_NAME, { "app-id": this.appIdentifier });
        });
    }
}
__decorate([
    decorators_1.cache()
], AndroidAppIdentifier.prototype, "getDeviceProjectRootPath", null);
__decorate([
    decorators_1.cache()
], AndroidAppIdentifier.prototype, "getLiveSyncVersion", null);
exports.AndroidAppIdentifier = AndroidAppIdentifier;
class AndroidCompanionAppIdentifier extends appbuilder_companion_device_app_data_base_1.AppBuilderCompanionDeviceAppDataBase {
    constructor(device, platform, $deployHelper, $devicePlatformsConstants, $companionAppsService) {
        super($companionAppsService.getCompanionAppIdentifier(constants_1.TARGET_FRAMEWORK_IDENTIFIERS.Cordova, platform), device, platform, $deployHelper);
    }
    getDeviceProjectRootPath() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._getDeviceProjectRootPath(util.format(constants_1.LiveSyncConstants.DEVICE_TMP_DIR_FORMAT_V3, this.appIdentifier));
        });
    }
    get liveSyncFormat() {
        return "icenium://%s?token=%s&appId=%s&configuration=%s";
    }
    getCompanionAppName() {
        return "companion app";
    }
}
exports.AndroidCompanionAppIdentifier = AndroidCompanionAppIdentifier;
class AndroidNativeScriptCompanionAppIdentifier extends appbuilder_companion_device_app_data_base_1.AppBuilderCompanionDeviceAppDataBase {
    constructor(device, platform, $deployHelper, $devicePlatformsConstants, $companionAppsService) {
        super($companionAppsService.getCompanionAppIdentifier(constants_1.TARGET_FRAMEWORK_IDENTIFIERS.NativeScript, platform), device, platform, $deployHelper);
    }
    getDeviceProjectRootPath() {
        return __awaiter(this, void 0, void 0, function* () {
            return util.format(constants_1.LiveSyncConstants.DEVICE_TMP_DIR_FORMAT_V3, this.appIdentifier);
        });
    }
    get liveSyncFormat() {
        return "nativescript://%s?token=%s&appId=%s&configuration=%s";
    }
    getCompanionAppName() {
        return "NativeScript companion app";
    }
}
exports.AndroidNativeScriptCompanionAppIdentifier = AndroidNativeScriptCompanionAppIdentifier;
class IOSAppIdentifier extends appbuilder_device_app_data_base_1.AppBuilderDeviceAppDataBase {
    constructor(_appIdentifier, device, platform, $deployHelper, $devicePlatformsConstants, $iOSSimResolver) {
        super(_appIdentifier, device, platform, $deployHelper);
        this.$iOSSimResolver = $iOSSimResolver;
    }
    getDeviceProjectRootPath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.device.isEmulator) {
                const applicationPath = this.$iOSSimResolver.iOSSim.getApplicationPath(this.device.deviceInfo.identifier, this.appIdentifier);
                return path.join(applicationPath, "www");
            }
            return constants_1.LiveSyncConstants.IOS_PROJECT_PATH;
        });
    }
    getLiveSyncNotSupportedError() {
        return `You can't LiveSync on device with id ${this.device.deviceInfo.identifier}! Deploy the app with LiveSync enabled and wait for the initial start up before LiveSyncing.`;
    }
}
__decorate([
    decorators_1.cache()
], IOSAppIdentifier.prototype, "getDeviceProjectRootPath", null);
exports.IOSAppIdentifier = IOSAppIdentifier;
class IOSNativeScriptAppIdentifier extends appbuilder_device_app_data_base_1.AppBuilderDeviceAppDataBase {
    constructor(_appIdentifier, device, platform, $deployHelper, $devicePlatformsConstants, $iOSSimResolver) {
        super(_appIdentifier, device, platform, $deployHelper);
        this.$iOSSimResolver = $iOSSimResolver;
    }
    getDeviceProjectRootPath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.device.isEmulator) {
                const applicationPath = this.$iOSSimResolver.iOSSim.getApplicationPath(this.device.deviceInfo.identifier, this.appIdentifier);
                return applicationPath;
            }
            return constants_1.LiveSyncConstants.IOS_PROJECT_PATH;
        });
    }
}
__decorate([
    decorators_1.cache()
], IOSNativeScriptAppIdentifier.prototype, "getDeviceProjectRootPath", null);
exports.IOSNativeScriptAppIdentifier = IOSNativeScriptAppIdentifier;
class IOSCompanionAppIdentifier extends appbuilder_companion_device_app_data_base_1.AppBuilderCompanionDeviceAppDataBase {
    constructor(device, platform, $deployHelper, $devicePlatformsConstants, $companionAppsService) {
        super($companionAppsService.getCompanionAppIdentifier(constants_1.TARGET_FRAMEWORK_IDENTIFIERS.Cordova, platform), device, platform, $deployHelper);
    }
    getDeviceProjectRootPath() {
        return __awaiter(this, void 0, void 0, function* () {
            return constants_1.LiveSyncConstants.IOS_PROJECT_PATH;
        });
    }
    get liveSyncFormat() {
        return "icenium://%s?LiveSyncToken=%s&appId=%s&configuration=%s";
    }
    getCompanionAppName() {
        return "companion app";
    }
}
exports.IOSCompanionAppIdentifier = IOSCompanionAppIdentifier;
class IOSNativeScriptCompanionAppIdentifier extends appbuilder_companion_device_app_data_base_1.AppBuilderCompanionDeviceAppDataBase {
    constructor(device, platform, $deployHelper, $devicePlatformsConstants, $companionAppsService) {
        super($companionAppsService.getCompanionAppIdentifier(constants_1.TARGET_FRAMEWORK_IDENTIFIERS.NativeScript, platform), device, platform, $deployHelper);
    }
    getDeviceProjectRootPath() {
        return __awaiter(this, void 0, void 0, function* () {
            return constants_1.LiveSyncConstants.IOS_PROJECT_PATH;
        });
    }
    get liveSyncFormat() {
        return "nativescript://%s?LiveSyncToken=%s&appId=%s&configuration=%s";
    }
    getCompanionAppName() {
        return "NativeScript companion app";
    }
}
exports.IOSNativeScriptCompanionAppIdentifier = IOSNativeScriptCompanionAppIdentifier;
class WP8CompanionAppIdentifier extends appbuilder_companion_device_app_data_base_1.AppBuilderCompanionDeviceAppDataBase {
    constructor(device, $deployHelper, $devicePlatformsConstants, platform, $companionAppsService) {
        super($companionAppsService.getCompanionAppIdentifier(constants_1.TARGET_FRAMEWORK_IDENTIFIERS.Cordova, platform), device, platform, $deployHelper);
        this.platform = platform;
    }
    getDeviceProjectRootPath() {
        return __awaiter(this, void 0, void 0, function* () {
            return "";
        });
    }
    get liveSyncFormat() {
        return "%s/Mist/MobilePackage/redirect?token=%s&appId=%s&configuration=%s";
    }
    encodeLiveSyncHostUri(hostUri) {
        return hostUri;
    }
    isLiveSyncSupported() {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    getLiveSyncNotSupportedError() {
        return "";
    }
    getCompanionAppName() {
        return "companion app";
    }
}
exports.WP8CompanionAppIdentifier = WP8CompanionAppIdentifier;
class DeviceAppDataProvider {
    constructor($project) {
        this.$project = $project;
    }
    createFactoryRules() {
        const rules = {
            Cordova: {
                Android: {
                    vanilla: AndroidAppIdentifier,
                    companion: AndroidCompanionAppIdentifier
                },
                iOS: {
                    vanilla: IOSAppIdentifier,
                    companion: IOSCompanionAppIdentifier
                },
                WP8: {
                    vanilla: "",
                    companion: WP8CompanionAppIdentifier
                }
            },
            NativeScript: {
                Android: {
                    vanilla: AndroidAppIdentifier,
                    companion: AndroidNativeScriptCompanionAppIdentifier
                },
                iOS: {
                    vanilla: IOSNativeScriptAppIdentifier,
                    companion: IOSNativeScriptCompanionAppIdentifier
                }
            }
        };
        return rules[this.$project.projectData.Framework];
    }
}
exports.DeviceAppDataProvider = DeviceAppDataProvider;
$injector.register("deviceAppDataProvider", DeviceAppDataProvider);
