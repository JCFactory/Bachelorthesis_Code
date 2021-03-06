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
const applicationManagerPath = require("./ios-application-manager");
const fileSystemPath = require("./ios-device-file-system");
const constants = require("../../../constants");
const net = require("net");
const decorators_1 = require("../../../decorators");
class IOSDevice {
    constructor(deviceActionInfo, $injector, $processService, $deviceLogProvider, $devicePlatformsConstants, $iOSDeviceProductNameMapper, $iosDeviceOperations) {
        this.deviceActionInfo = deviceActionInfo;
        this.$injector = $injector;
        this.$processService = $processService;
        this.$deviceLogProvider = $deviceLogProvider;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.$iOSDeviceProductNameMapper = $iOSDeviceProductNameMapper;
        this.$iosDeviceOperations = $iosDeviceOperations;
        this.applicationManager = this.$injector.resolve(applicationManagerPath.IOSApplicationManager, { device: this, devicePointer: this.deviceActionInfo });
        this.fileSystem = this.$injector.resolve(fileSystemPath.IOSDeviceFileSystem, { device: this, devicePointer: this.deviceActionInfo });
        const productType = deviceActionInfo.productType;
        const isTablet = productType && productType.toLowerCase().indexOf("ipad") !== -1;
        const deviceStatus = deviceActionInfo.status || constants.UNREACHABLE_STATUS;
        this.deviceInfo = {
            identifier: deviceActionInfo.deviceId,
            vendor: "Apple",
            platform: this.$devicePlatformsConstants.iOS,
            status: deviceStatus,
            errorHelp: deviceStatus === constants.UNREACHABLE_STATUS ? `Device ${deviceActionInfo.deviceId} is ${constants.UNREACHABLE_STATUS}` : null,
            type: "Device",
            isTablet: isTablet,
            displayName: this.$iOSDeviceProductNameMapper.resolveProductName(deviceActionInfo.deviceName) || deviceActionInfo.deviceName,
            model: this.$iOSDeviceProductNameMapper.resolveProductName(productType),
            version: deviceActionInfo.productVersion,
            color: deviceActionInfo.deviceColor,
            activeArchitecture: this.getActiveArchitecture(productType)
        };
    }
    get isEmulator() {
        return false;
    }
    getApplicationInfo(applicationIdentifier) {
        return this.applicationManager.getApplicationInfo(applicationIdentifier);
    }
    actionOnDeviceLog(response) {
        if (response.deviceId === this.deviceInfo.identifier) {
            this.$deviceLogProvider.logData(response.message, this.$devicePlatformsConstants.iOS, this.deviceInfo.identifier);
        }
    }
    openDeviceLogStream() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.deviceInfo.status !== constants.UNREACHABLE_STATUS) {
                this._deviceLogHandler = this.actionOnDeviceLog.bind(this);
                this.$iosDeviceOperations.on(constants.DEVICE_LOG_EVENT_NAME, this._deviceLogHandler);
                this.$iosDeviceOperations.startDeviceLog(this.deviceInfo.identifier);
            }
        });
    }
    detach() {
        if (this._deviceLogHandler) {
            this.$iosDeviceOperations.removeListener(constants.DEVICE_LOG_EVENT_NAME, this._deviceLogHandler);
        }
    }
    connectToPort(port) {
        return __awaiter(this, void 0, void 0, function* () {
            const deviceId = this.deviceInfo.identifier;
            const deviceResponse = _.first((yield this.$iosDeviceOperations.connectToPort([{ deviceId: deviceId, port: port }]))[deviceId]);
            const socket = new net.Socket();
            socket.connect(deviceResponse.port, deviceResponse.host);
            this._socket = socket;
            this.$processService.attachToProcessExitSignals(this, this.destroySocket);
            return this._socket;
        });
    }
    getActiveArchitecture(productType) {
        let activeArchitecture = "";
        if (productType) {
            productType = productType.toLowerCase().trim();
            const majorVersionAsString = productType.match(/.*?(\d+)\,(\d+)/)[1];
            const majorVersion = parseInt(majorVersionAsString);
            let isArm64Architecture = false;
            if (_.startsWith(productType, "iphone")) {
                isArm64Architecture = majorVersion >= 6;
            }
            else if (_.startsWith(productType, "ipad")) {
                isArm64Architecture = majorVersion >= 4;
            }
            else if (_.startsWith(productType, "ipod")) {
                isArm64Architecture = majorVersion >= 7;
            }
            activeArchitecture = isArm64Architecture ? "arm64" : "armv7";
        }
        return activeArchitecture;
    }
    destroySocket() {
        if (this._socket) {
            this._socket.destroy();
            this._socket = null;
        }
    }
}
__decorate([
    decorators_1.cache()
], IOSDevice.prototype, "openDeviceLogStream", null);
exports.IOSDevice = IOSDevice;
$injector.register("iOSDevice", IOSDevice);
