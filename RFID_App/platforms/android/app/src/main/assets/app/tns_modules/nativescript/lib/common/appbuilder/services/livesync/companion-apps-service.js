"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const decorators_1 = require("../../../decorators");
const constants_1 = require("../../../constants");
const NS_COMPANION_APP_IDENTIFIER = "com.telerik.NativeScript";
const APPBUILDER_ANDROID_COMPANION_APP_IDENTIFIER = "com.telerik.AppBuilder";
const APPBUILDER_IOS_COMPANION_APP_IDENTIFIER = "com.telerik.Icenium";
const APPBUILDER_WP8_COMPANION_APP_IDENTIFIER = "{9155af5b-e7ed-486d-bc6b-35087fb59ecc}";
class CompanionAppsService {
    constructor($mobileHelper, $devicePlatformsConstants) {
        this.$mobileHelper = $mobileHelper;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
    }
    getCompanionAppIdentifier(framework, platform) {
        const lowerCasedFramework = (framework || "").toLowerCase();
        const lowerCasedPlatform = (platform || "").toLowerCase();
        if (lowerCasedFramework === constants_1.TARGET_FRAMEWORK_IDENTIFIERS.Cordova.toLowerCase()) {
            if (this.$mobileHelper.isAndroidPlatform(lowerCasedPlatform)) {
                return APPBUILDER_ANDROID_COMPANION_APP_IDENTIFIER;
            }
            else if (this.$mobileHelper.isiOSPlatform(lowerCasedPlatform)) {
                return APPBUILDER_IOS_COMPANION_APP_IDENTIFIER;
            }
            else if (this.$mobileHelper.isWP8Platform(lowerCasedPlatform)) {
                return APPBUILDER_WP8_COMPANION_APP_IDENTIFIER;
            }
        }
        else if (lowerCasedFramework === constants_1.TARGET_FRAMEWORK_IDENTIFIERS.NativeScript.toLowerCase()) {
            if (!this.$mobileHelper.isWP8Platform(lowerCasedPlatform)) {
                return NS_COMPANION_APP_IDENTIFIER;
            }
        }
        return null;
    }
    getAllCompanionAppIdentifiers() {
        const platforms = [
            this.$devicePlatformsConstants.Android,
            this.$devicePlatformsConstants.iOS,
            this.$devicePlatformsConstants.WP8
        ];
        const frameworks = [
            constants_1.TARGET_FRAMEWORK_IDENTIFIERS.Cordova.toLowerCase(),
            constants_1.TARGET_FRAMEWORK_IDENTIFIERS.NativeScript.toLowerCase()
        ];
        const companionAppIdentifiers = {};
        _.each(frameworks, framework => {
            const lowerCasedFramework = framework.toLowerCase();
            companionAppIdentifiers[lowerCasedFramework] = companionAppIdentifiers[lowerCasedFramework] || {};
            _.each(platforms, platform => {
                const lowerCasedPlatform = platform.toLowerCase();
                companionAppIdentifiers[lowerCasedFramework][lowerCasedPlatform] = this.getCompanionAppIdentifier(lowerCasedFramework, lowerCasedPlatform);
            });
        });
        return companionAppIdentifiers;
    }
}
__decorate([
    decorators_1.exported("companionAppsService")
], CompanionAppsService.prototype, "getCompanionAppIdentifier", null);
__decorate([
    decorators_1.exported("companionAppsService")
], CompanionAppsService.prototype, "getAllCompanionAppIdentifiers", null);
exports.CompanionAppsService = CompanionAppsService;
$injector.register("companionAppsService", CompanionAppsService);
