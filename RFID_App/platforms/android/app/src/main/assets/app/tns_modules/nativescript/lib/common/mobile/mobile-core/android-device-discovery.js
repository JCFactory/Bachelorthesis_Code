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
const device_discovery_1 = require("./device-discovery");
const helpers = require("../../helpers");
const android_device_1 = require("../android/android-device");
const os_1 = require("os");
class AndroidDeviceDiscovery extends device_discovery_1.DeviceDiscovery {
    constructor($injector, $adb, $mobileHelper) {
        super();
        this.$injector = $injector;
        this.$adb = $adb;
        this.$mobileHelper = $mobileHelper;
        this._devices = [];
    }
    createAndAddDevice(adbDeviceInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            this._devices.push(adbDeviceInfo);
            const device = this.$injector.resolve(android_device_1.AndroidDevice, { identifier: adbDeviceInfo.identifier, status: adbDeviceInfo.status });
            yield device.init();
            this.addDevice(device);
        });
    }
    deleteAndRemoveDevice(deviceIdentifier) {
        _.remove(this._devices, d => d.identifier === deviceIdentifier);
        this.removeDevice(deviceIdentifier);
    }
    startLookingForDevices(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options && options.platform && !this.$mobileHelper.isAndroidPlatform(options.platform)) {
                return;
            }
            yield this.ensureAdbServerStarted();
            yield this.checkForDevices();
        });
    }
    checkForDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.$adb.executeCommand(["devices"], { returnChildProcess: true });
            return new Promise((resolve, reject) => {
                let adbData = "";
                let errorData = "";
                let isSettled = false;
                result.stdout.on("data", (data) => {
                    adbData += data.toString();
                });
                result.stderr.on("data", (data) => {
                    errorData += (data || "").toString();
                });
                result.on("error", (error) => {
                    if (reject && !isSettled) {
                        isSettled = true;
                        reject(error);
                    }
                });
                result.on("close", (exitCode) => __awaiter(this, void 0, void 0, function* () {
                    if (errorData && !isSettled) {
                        isSettled = true;
                        reject(errorData);
                        return;
                    }
                    yield this.checkCurrentData(adbData);
                    if (!isSettled) {
                        isSettled = true;
                        resolve();
                    }
                }));
            });
        });
    }
    checkCurrentData(result) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentData = result.toString();
            const currentDevices = currentData
                .split(os_1.EOL)
                .slice(1)
                .filter((element) => !helpers.isNullOrWhitespace(element) && element.indexOf("* daemon ") === -1 && element.indexOf("adb server") === -1)
                .map((element) => {
                const data = element.split('\t'), identifier = data[0], status = data[1];
                return {
                    identifier: identifier,
                    status: status
                };
            });
            _(this._devices)
                .reject(d => _.find(currentDevices, device => device.identifier === d.identifier && device.status === d.status))
                .each(d => this.deleteAndRemoveDevice(d.identifier));
            yield Promise.all(_(currentDevices)
                .reject(d => _.find(this._devices, device => device.identifier === d.identifier && device.status === d.status))
                .map(d => this.createAndAddDevice(d)).value());
        });
    }
    ensureAdbServerStarted() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isStarted) {
                this.isStarted = true;
                try {
                    return yield this.$adb.executeCommand(["start-server"]);
                }
                catch (err) {
                    this.isStarted = false;
                    throw err;
                }
            }
        });
    }
}
exports.AndroidDeviceDiscovery = AndroidDeviceDiscovery;
$injector.register("androidDeviceDiscovery", AndroidDeviceDiscovery);
