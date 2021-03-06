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
const helpers_1 = require("../../helpers");
class ListDevicesCommand {
    constructor($devicesService, $logger, $stringParameter, $mobileHelper, $emulatorImageService, $options) {
        this.$devicesService = $devicesService;
        this.$logger = $logger;
        this.$stringParameter = $stringParameter;
        this.$mobileHelper = $mobileHelper;
        this.$emulatorImageService = $emulatorImageService;
        this.$options = $options;
        this.allowedParameters = [this.$stringParameter];
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.$options.availableDevices) {
                yield this.$emulatorImageService.listAvailableEmulators(this.$mobileHelper.validatePlatformName(args[0]));
            }
            this.$logger.out("\nConnected devices & emulators");
            let index = 1;
            yield this.$devicesService.initialize({ platform: args[0], deviceId: null, skipInferPlatform: true, skipDeviceDetectionInterval: true, skipEmulatorStart: true });
            const table = helpers_1.createTable(["#", "Device Name", "Platform", "Device Identifier", "Type", "Status"], []);
            let action;
            if (this.$options.json) {
                this.$logger.setLevel("ERROR");
                action = (device) => __awaiter(this, void 0, void 0, function* () {
                    this.$logger.out(JSON.stringify(device.deviceInfo));
                });
            }
            else {
                action = (device) => __awaiter(this, void 0, void 0, function* () {
                    table.push([(index++).toString(), device.deviceInfo.displayName || '',
                        device.deviceInfo.platform || '', device.deviceInfo.identifier || '',
                        device.deviceInfo.type || '', device.deviceInfo.status || '']);
                });
            }
            yield this.$devicesService.execute(action, undefined, { allowNoDevices: true });
            if (!this.$options.json && table.length) {
                this.$logger.out(table.toString());
            }
        });
    }
}
exports.ListDevicesCommand = ListDevicesCommand;
$injector.registerCommand(["device|*list", "devices|*list"], ListDevicesCommand);
class ListAndroidDevicesCommand {
    constructor($injector, $devicePlatformsConstants) {
        this.$injector = $injector;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.allowedParameters = [];
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const listDevicesCommand = this.$injector.resolve(ListDevicesCommand);
            const platform = this.$devicePlatformsConstants.Android;
            yield listDevicesCommand.execute([platform]);
        });
    }
}
$injector.registerCommand(["device|android", "devices|android"], ListAndroidDevicesCommand);
class ListiOSDevicesCommand {
    constructor($injector, $devicePlatformsConstants) {
        this.$injector = $injector;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.allowedParameters = [];
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const listDevicesCommand = this.$injector.resolve(ListDevicesCommand);
            const platform = this.$devicePlatformsConstants.iOS;
            yield listDevicesCommand.execute([platform]);
        });
    }
}
$injector.registerCommand(["device|ios", "devices|ios"], ListiOSDevicesCommand);
