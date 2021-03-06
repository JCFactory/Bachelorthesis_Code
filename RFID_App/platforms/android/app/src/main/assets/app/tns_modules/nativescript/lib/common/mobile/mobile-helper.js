"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers = require("../helpers");
class MobileHelper {
    constructor($mobilePlatformsCapabilities, $errors, $devicePlatformsConstants) {
        this.$mobilePlatformsCapabilities = $mobilePlatformsCapabilities;
        this.$errors = $errors;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
    }
    get platformNames() {
        this.platformNamesCache = this.platformNamesCache ||
            _.map(this.$mobilePlatformsCapabilities.getPlatformNames(), platform => this.normalizePlatformName(platform));
        return this.platformNamesCache;
    }
    getPlatformCapabilities(platform) {
        const platformNames = this.$mobilePlatformsCapabilities.getPlatformNames();
        const validPlatformName = this.validatePlatformName(platform);
        if (!_.some(platformNames, platformName => platformName === validPlatformName)) {
            this.$errors.failWithoutHelp("'%s' is not a valid device platform. Valid platforms are %s.", platform, platformNames);
        }
        return this.$mobilePlatformsCapabilities.getAllCapabilities()[validPlatformName];
    }
    isAndroidPlatform(platform) {
        return !!(platform && (this.$devicePlatformsConstants.Android.toLowerCase() === platform.toLowerCase()));
    }
    isiOSPlatform(platform) {
        return !!(platform && (this.$devicePlatformsConstants.iOS.toLowerCase() === platform.toLowerCase()));
    }
    isWP8Platform(platform) {
        return !!(platform && (this.$devicePlatformsConstants.WP8.toLowerCase() === platform.toLowerCase()));
    }
    normalizePlatformName(platform) {
        if (this.isAndroidPlatform(platform)) {
            return "Android";
        }
        else if (this.isiOSPlatform(platform)) {
            return "iOS";
        }
        else if (this.isWP8Platform(platform)) {
            return "WP8";
        }
        return undefined;
    }
    isPlatformSupported(platform) {
        return _.includes(this.getPlatformCapabilities(platform).hostPlatformsForDeploy, process.platform);
    }
    validatePlatformName(platform) {
        if (!platform) {
            this.$errors.fail("No device platform specified.");
        }
        const normalizedPlatform = this.normalizePlatformName(platform);
        if (!normalizedPlatform || !_.includes(this.platformNames, normalizedPlatform)) {
            this.$errors.fail("'%s' is not a valid device platform. Valid platforms are %s.", platform, helpers.formatListOfNames(this.platformNames));
        }
        return normalizedPlatform;
    }
    buildDevicePath(...args) {
        return this.correctDevicePath(args.join(MobileHelper.DEVICE_PATH_SEPARATOR));
    }
    correctDevicePath(filePath) {
        return helpers.stringReplaceAll(filePath, '\\', '/');
    }
}
MobileHelper.DEVICE_PATH_SEPARATOR = "/";
exports.MobileHelper = MobileHelper;
$injector.register("mobileHelper", MobileHelper);
