"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const device_log_provider_base_1 = require("../mobile/device-log-provider-base");
class DeviceLogProvider extends device_log_provider_base_1.DeviceLogProviderBase {
    constructor($logFilter, $logger, $loggingLevels) {
        super($logFilter, $logger);
        this.$logFilter = $logFilter;
        this.$loggingLevels = $loggingLevels;
    }
    logData(line, platform, deviceIdentifier) {
        this.setDefaultLogLevelForDevice(deviceIdentifier);
        const loggingOptions = this.getDeviceLogOptionsForDevice(deviceIdentifier) || { logLevel: this.$loggingLevels.info };
        const data = this.$logFilter.filterData(platform, line, loggingOptions);
        if (data) {
            this.emit('data', deviceIdentifier, data);
        }
    }
    setLogLevel(logLevel, deviceIdentifier) {
        if (deviceIdentifier) {
            this.setDeviceLogOptionsProperty(deviceIdentifier, (deviceLogOptions) => deviceLogOptions.logLevel, logLevel.toUpperCase());
        }
        else {
            this.$logFilter.loggingLevel = logLevel.toUpperCase();
            _.keys(this.devicesLogOptions).forEach(deviceId => {
                this.devicesLogOptions[deviceId] = this.devicesLogOptions[deviceId] || {};
                this.devicesLogOptions[deviceId].logLevel = this.$logFilter.loggingLevel;
            });
        }
    }
}
exports.DeviceLogProvider = DeviceLogProvider;
$injector.register("deviceLogProvider", DeviceLogProvider);
