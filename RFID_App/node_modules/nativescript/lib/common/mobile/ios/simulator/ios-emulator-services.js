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
const net = require("net");
const helpers_1 = require("../../../helpers");
class IosEmulatorServices {
    constructor($logger, $emulatorSettingsService, $errors, $devicePlatformsConstants, $hostInfo, $options, $iOSSimResolver) {
        this.$logger = $logger;
        this.$emulatorSettingsService = $emulatorSettingsService;
        this.$errors = $errors;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.$hostInfo = $hostInfo;
        this.$options = $options;
        this.$iOSSimResolver = $iOSSimResolver;
    }
    getEmulatorId() {
        return __awaiter(this, void 0, void 0, function* () {
            return "";
        });
    }
    getRunningEmulatorId(image) {
        return __awaiter(this, void 0, void 0, function* () {
            return "";
        });
    }
    checkDependencies() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    checkAvailability(dependsOnProject) {
        dependsOnProject = dependsOnProject === undefined ? true : dependsOnProject;
        if (!this.$hostInfo.isDarwin) {
            this.$errors.failWithoutHelp("iOS Simulator is available only on Mac OS X.");
        }
        const platform = this.$devicePlatformsConstants.iOS;
        if (dependsOnProject && !this.$emulatorSettingsService.canStart(platform)) {
            this.$errors.failWithoutHelp("The current project does not target iOS and cannot be run in the iOS Simulator.");
        }
    }
    startEmulator(emulatorImage) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.$iOSSimResolver.iOSSim.startSimulator({
                device: emulatorImage,
                state: "None",
                sdkVersion: this.$options.sdk
            });
        });
    }
    runApplicationOnEmulator(app, emulatorOptions) {
        if (this.$options.availableDevices) {
            return this.$iOSSimResolver.iOSSim.printDeviceTypes();
        }
        const options = {
            timeout: this.$options.timeout,
            sdkVersion: this.$options.sdk,
            device: (emulatorOptions && emulatorOptions.device) || this.$options.device,
            args: emulatorOptions.args,
            waitForDebugger: emulatorOptions.waitForDebugger,
            skipInstall: emulatorOptions.skipInstall
        };
        if (this.$options.justlaunch) {
            options.exit = true;
        }
        return this.$iOSSimResolver.iOSSim.launchApplication(app, emulatorOptions.appId, options);
    }
    postDarwinNotification(notification, deviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.$iOSSimResolver.iOSSim.sendNotification(notification, deviceId);
        });
    }
    connectToPort(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const socket = yield helpers_1.connectEventuallyUntilTimeout(() => net.connect(data.port), data.timeout || IosEmulatorServices.DEFAULT_TIMEOUT);
                return socket;
            }
            catch (e) {
                this.$logger.debug(e);
            }
        });
    }
}
IosEmulatorServices.DEFAULT_TIMEOUT = 10000;
$injector.register("iOSEmulatorServices", IosEmulatorServices);
