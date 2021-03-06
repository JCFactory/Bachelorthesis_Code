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
const ios_device_lib_1 = require("ios-device-lib");
const decorators_1 = require("../../../decorators");
const constants_1 = require("../../../constants");
const assert = require("assert");
const events_1 = require("events");
class IOSDeviceOperations extends events_1.EventEmitter {
    constructor($logger, $processService) {
        super();
        this.$logger = $logger;
        this.$processService = $processService;
        this.isInitialized = false;
        this.shouldDispose = true;
        this.$processService.attachToProcessExitSignals(this, () => {
            this.setShouldDispose(true);
            this.dispose();
        });
    }
    install(ipaPath, deviceIdentifiers, errorHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertIsInitialized();
            this.$logger.trace(`Installing ${ipaPath} on devices with identifiers: ${deviceIdentifiers}.`);
            return yield this.getMultipleResults(() => this.deviceLib.install(ipaPath, deviceIdentifiers), errorHandler);
        });
    }
    uninstall(appIdentifier, deviceIdentifiers, errorHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertIsInitialized();
            this.$logger.trace(`Uninstalling ${appIdentifier} from devices with identifiers: ${deviceIdentifiers}.`);
            return yield this.getMultipleResults(() => this.deviceLib.uninstall(appIdentifier, deviceIdentifiers), errorHandler);
        });
    }
    startLookingForDevices(deviceFoundCallback, deviceLostCallback, options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$logger.trace("Starting to look for iOS devices.");
            this.isInitialized = true;
            if (!this.deviceLib) {
                let foundDevice = false;
                const wrappedDeviceFoundCallback = (deviceInfo) => {
                    foundDevice = true;
                    return deviceFoundCallback(deviceInfo);
                };
                this.deviceLib = new ios_device_lib_1.IOSDeviceLib(wrappedDeviceFoundCallback, deviceLostCallback);
                if (options && options.shouldReturnImmediateResult) {
                    return;
                }
                yield new Promise((resolve, reject) => {
                    let iterationsCount = 0;
                    const maxIterationsCount = 3;
                    const intervalHandle = setInterval(() => {
                        if (foundDevice) {
                            resolve();
                            return clearInterval(intervalHandle);
                        }
                        iterationsCount++;
                        if (iterationsCount >= maxIterationsCount) {
                            clearInterval(intervalHandle);
                            return resolve();
                        }
                    }, 2000);
                });
            }
        });
    }
    startDeviceLog(deviceIdentifier) {
        this.assertIsInitialized();
        this.setShouldDispose(false);
        this.$logger.trace(`Printing device log for device with identifier: ${deviceIdentifier}.`);
        this.attacheDeviceLogDataHandler();
        this.deviceLib.startDeviceLog([deviceIdentifier]);
    }
    apps(deviceIdentifiers, errorHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertIsInitialized();
            this.$logger.trace(`Getting applications information for devices with identifiers: ${deviceIdentifiers}`);
            return this.getMultipleResults(() => this.deviceLib.apps(deviceIdentifiers), errorHandler);
        });
    }
    listDirectory(listArray, errorHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertIsInitialized();
            _.each(listArray, l => {
                this.$logger.trace(`Listing directory: ${l.path} for application ${l.appId} on device with identifier: ${l.deviceId}.`);
            });
            return this.getMultipleResults(() => this.deviceLib.list(listArray), errorHandler);
        });
    }
    readFiles(deviceFilePaths, errorHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertIsInitialized();
            _.each(deviceFilePaths, p => {
                this.$logger.trace(`Reading file: ${p.path} from application ${p.appId} on device with identifier: ${p.deviceId}.`);
            });
            return this.getMultipleResults(() => this.deviceLib.read(deviceFilePaths), errorHandler);
        });
    }
    downloadFiles(deviceFilePaths, errorHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertIsInitialized();
            _.each(deviceFilePaths, d => {
                this.$logger.trace(`Downloading file: ${d.source} from application ${d.appId} on device with identifier: ${d.deviceId} to ${d.destination}.`);
            });
            return this.getMultipleResults(() => this.deviceLib.download(deviceFilePaths), errorHandler);
        });
    }
    uploadFiles(files, errorHandler) {
        this.assertIsInitialized();
        _.each(files, f => {
            this.$logger.trace("Uploading files:");
            this.$logger.trace(f.files);
            this.$logger.trace(`For application ${f.appId} on device with identifier: ${f.deviceId}.`);
        });
        return this.getMultipleResults(() => this.deviceLib.upload(files), errorHandler);
    }
    deleteFiles(deleteArray, errorHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertIsInitialized();
            _.each(deleteArray, d => {
                this.$logger.trace(`Deleting file: ${d.destination} from application ${d.appId} on device with identifier: ${d.deviceId}.`);
            });
            return this.getMultipleResults(() => this.deviceLib.delete(deleteArray), errorHandler);
        });
    }
    start(startArray, errorHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertIsInitialized();
            _.each(startArray, s => {
                this.$logger.trace(`Starting application ${s.appId} on device with identifier: ${s.deviceId}.`);
            });
            return this.getMultipleResults(() => this.deviceLib.start(startArray), errorHandler);
        });
    }
    stop(stopArray, errorHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertIsInitialized();
            _.each(stopArray, s => {
                this.$logger.trace(`Stopping application ${s.appId} on device with identifier: ${s.deviceId}.`);
            });
            return this.getMultipleResults(() => this.deviceLib.stop(stopArray), errorHandler);
        });
    }
    dispose(signal) {
        if (this.shouldDispose && this.deviceLib) {
            this.deviceLib.removeAllListeners();
            this.deviceLib.dispose(signal);
            this.deviceLib = null;
            this.$logger.trace("IOSDeviceOperations disposed.");
        }
    }
    postNotification(postNotificationArray, errorHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertIsInitialized();
            _.each(postNotificationArray, n => {
                this.$logger.trace(`Sending notification ${n.notificationName} to device with identifier: ${n.deviceId}`);
            });
            return this.getMultipleResults(() => this.deviceLib.postNotification(postNotificationArray), errorHandler);
        });
    }
    awaitNotificationResponse(awaitNotificationResponseArray, errorHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertIsInitialized();
            _.each(awaitNotificationResponseArray, n => {
                this.$logger.trace(`Awaiting notification response from socket: ${n.socket} with timeout: ${n.timeout}`);
            });
            return this.getMultipleResults(() => this.deviceLib.awaitNotificationResponse(awaitNotificationResponseArray), errorHandler);
        });
    }
    connectToPort(connectToPortArray, errorHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertIsInitialized();
            _.each(connectToPortArray, c => {
                this.$logger.trace(`Connecting to port ${c.port} on device with identifier: ${c.deviceId}`);
            });
            return this.getMultipleResults(() => this.deviceLib.connectToPort(connectToPortArray), errorHandler);
        });
    }
    setShouldDispose(shouldDispose) {
        this.shouldDispose = shouldDispose;
    }
    getMultipleResults(getPromisesMethod, errorHandler) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            const promises = getPromisesMethod();
            for (const promise of promises) {
                if (errorHandler) {
                    try {
                        result.push(yield promise);
                    }
                    catch (err) {
                        this.$logger.trace(`Error while executing ios device operation: ${err.message} with code: ${err.code}`);
                        errorHandler(err);
                    }
                }
                else {
                    result.push(yield promise);
                }
            }
            const groupedResults = _.groupBy(result, r => r.deviceId);
            this.$logger.trace("Received multiple results:");
            this.$logger.trace(groupedResults);
            return groupedResults;
        });
    }
    assertIsInitialized() {
        assert.ok(this.isInitialized, "iOS device operations not initialized.");
    }
    attacheDeviceLogDataHandler() {
        this.deviceLib.on(constants_1.DEVICE_LOG_EVENT_NAME, (response) => {
            this.emit(constants_1.DEVICE_LOG_EVENT_NAME, response);
        });
    }
}
__decorate([
    decorators_1.cache()
], IOSDeviceOperations.prototype, "startLookingForDevices", null);
__decorate([
    decorators_1.cache()
], IOSDeviceOperations.prototype, "attacheDeviceLogDataHandler", null);
exports.IOSDeviceOperations = IOSDeviceOperations;
$injector.register("iosDeviceOperations", IOSDeviceOperations);
