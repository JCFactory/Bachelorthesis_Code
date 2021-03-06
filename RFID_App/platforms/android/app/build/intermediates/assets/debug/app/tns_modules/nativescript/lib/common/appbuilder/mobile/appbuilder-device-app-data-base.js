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
const querystring = require("querystring");
const device_app_data_base_1 = require("./../../mobile/device-app-data/device-app-data-base");
class AppBuilderDeviceAppDataBase extends device_app_data_base_1.DeviceAppDataBase {
    constructor(_appIdentifier, device, platform, $deployHelper) {
        super(_appIdentifier);
        this.device = device;
        this.platform = platform;
        this.$deployHelper = $deployHelper;
    }
    get liveSyncFormat() {
        return null;
    }
    encodeLiveSyncHostUri(hostUri) {
        return querystring.escape(hostUri);
    }
    getLiveSyncNotSupportedError() {
        return `You can't LiveSync on device with id ${this.device.deviceInfo.identifier}! Deploy the app with LiveSync enabled and wait for the initial start up before LiveSyncing.`;
    }
    isLiveSyncSupported() {
        return __awaiter(this, void 0, void 0, function* () {
            const isApplicationInstalled = yield this.device.applicationManager.isApplicationInstalled(this.appIdentifier);
            if (!isApplicationInstalled) {
                yield this.$deployHelper.deploy(this.platform.toString());
                yield this.device.applicationManager.checkForApplicationUpdates();
            }
            return yield this.device.applicationManager.isLiveSyncSupported(this.appIdentifier);
        });
    }
}
exports.AppBuilderDeviceAppDataBase = AppBuilderDeviceAppDataBase;
