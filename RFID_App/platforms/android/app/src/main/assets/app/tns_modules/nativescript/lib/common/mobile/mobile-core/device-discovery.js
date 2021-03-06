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
const events_1 = require("events");
const constants_1 = require("../../constants");
class DeviceDiscovery extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.devices = {};
    }
    addDevice(device) {
        this.devices[device.deviceInfo.identifier] = device;
        this.raiseOnDeviceFound(device);
    }
    removeDevice(deviceIdentifier) {
        const device = this.devices[deviceIdentifier];
        if (!device) {
            return;
        }
        delete this.devices[deviceIdentifier];
        this.raiseOnDeviceLost(device);
    }
    startLookingForDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    checkForDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    raiseOnDeviceFound(device) {
        this.emit(constants_1.DeviceDiscoveryEventNames.DEVICE_FOUND, device);
    }
    raiseOnDeviceLost(device) {
        this.emit(constants_1.DeviceDiscoveryEventNames.DEVICE_LOST, device);
    }
}
exports.DeviceDiscovery = DeviceDiscovery;
$injector.register("deviceDiscovery", DeviceDiscovery);
