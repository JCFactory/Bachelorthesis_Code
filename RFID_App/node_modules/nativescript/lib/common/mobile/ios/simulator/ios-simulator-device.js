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
const applicationManagerPath = require("./ios-simulator-application-manager");
const fileSystemPath = require("./ios-simulator-file-system");
const constants = require("../../../constants");
const decorators_1 = require("../../../decorators");
class IOSSimulator {
    constructor(simulator, $devicePlatformsConstants, $deviceLogProvider, $injector, $iOSSimResolver, $iOSSimulatorLogProvider) {
        this.simulator = simulator;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.$deviceLogProvider = $deviceLogProvider;
        this.$injector = $injector;
        this.$iOSSimResolver = $iOSSimResolver;
        this.$iOSSimulatorLogProvider = $iOSSimulatorLogProvider;
    }
    get deviceInfo() {
        return {
            identifier: this.simulator.id,
            displayName: this.simulator.name,
            model: _.last(this.simulator.fullId.split(".")),
            version: this.simulator.runtimeVersion,
            vendor: "Apple",
            platform: this.$devicePlatformsConstants.iOS,
            status: constants.CONNECTED_STATUS,
            errorHelp: null,
            isTablet: this.simulator.fullId.toLowerCase().indexOf("ipad") !== -1,
            type: constants.DeviceTypes.Emulator
        };
    }
    get isEmulator() {
        return true;
    }
    getApplicationInfo(applicationIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.applicationManager.getApplicationInfo(applicationIdentifier);
        });
    }
    get applicationManager() {
        if (!this._applicationManager) {
            this._applicationManager = this.$injector.resolve(applicationManagerPath.IOSSimulatorApplicationManager, { iosSim: this.$iOSSimResolver.iOSSim, device: this });
        }
        return this._applicationManager;
    }
    get fileSystem() {
        if (!this._fileSystem) {
            this._fileSystem = this.$injector.resolve(fileSystemPath.IOSSimulatorFileSystem, { iosSim: this.$iOSSimResolver.iOSSim });
        }
        return this._fileSystem;
    }
    openDeviceLogStream(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this._deviceLogHandler = this.onDeviceLog.bind(this, options);
            this.$iOSSimulatorLogProvider.on(constants.DEVICE_LOG_EVENT_NAME, this._deviceLogHandler);
            this.$iOSSimulatorLogProvider.startLogProcess(this.simulator.id, options);
        });
    }
    detach() {
        if (this._deviceLogHandler) {
            this.$iOSSimulatorLogProvider.removeListener(constants.DEVICE_LOG_EVENT_NAME, this._deviceLogHandler);
        }
    }
    onDeviceLog(options, response) {
        if (response.deviceId === this.deviceInfo.identifier && !response.muted) {
            this.$deviceLogProvider.logData(response.message, this.$devicePlatformsConstants.iOS, this.deviceInfo.identifier);
        }
    }
}
__decorate([
    decorators_1.cache()
], IOSSimulator.prototype, "openDeviceLogStream", null);
exports.IOSSimulator = IOSSimulator;
