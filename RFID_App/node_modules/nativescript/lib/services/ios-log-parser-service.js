"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../common/constants");
const events_1 = require("events");
class IOSLogParserService extends events_1.EventEmitter {
    constructor($deviceLogProvider, $iosDeviceOperations, $iOSSimulatorLogProvider, $logger) {
        super();
        this.$deviceLogProvider = $deviceLogProvider;
        this.$iosDeviceOperations = $iosDeviceOperations;
        this.$iOSSimulatorLogProvider = $iOSSimulatorLogProvider;
        this.$logger = $logger;
        this.startedDeviceLogInstances = {};
    }
    startParsingLog(device, data) {
        this.$deviceLogProvider.setProjectNameForDevice(device.deviceInfo.identifier, data.projectName);
        if (!this.startedDeviceLogInstances[device.deviceInfo.identifier]) {
            this.startParsingLogCore(device);
            this.startLogProcess(device);
            this.startedDeviceLogInstances[device.deviceInfo.identifier] = true;
        }
    }
    startParsingLogCore(device) {
        const logProvider = device.isEmulator ? this.$iOSSimulatorLogProvider : this.$iosDeviceOperations;
        logProvider.on(constants_1.DEVICE_LOG_EVENT_NAME, (response) => this.processDeviceLogResponse(response));
    }
    processDeviceLogResponse(response) {
        const matches = IOSLogParserService.MESSAGE_REGEX.exec(response.message);
        if (matches) {
            const data = {
                port: parseInt(matches[1]),
                appId: matches[2],
                deviceId: response.deviceId
            };
            this.$logger.trace(`Emitting ${constants_1.DEBUGGER_PORT_FOUND_EVENT_NAME} event`, data);
            this.emit(constants_1.DEBUGGER_PORT_FOUND_EVENT_NAME, data);
        }
    }
    startLogProcess(device) {
        if (device.isEmulator) {
            return this.$iOSSimulatorLogProvider.startNewMutedLogProcess(device.deviceInfo.identifier);
        }
        return this.$iosDeviceOperations.startDeviceLog(device.deviceInfo.identifier);
    }
}
IOSLogParserService.MESSAGE_REGEX = /NativeScript debugger has opened inspector socket on port (\d+?) for (.*)[.]/;
exports.IOSLogParserService = IOSLogParserService;
$injector.register("iOSLogParserService", IOSLogParserService);
