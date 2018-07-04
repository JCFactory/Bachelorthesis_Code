"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../../constants");
const events_1 = require("events");
class IOSSimulatorLogProvider extends events_1.EventEmitter {
    constructor($iOSSimResolver, $logger, $processService) {
        super();
        this.$iOSSimResolver = $iOSSimResolver;
        this.$logger = $logger;
        this.$processService = $processService;
        this.simulatorsLoggingEnabled = {};
        this.simulatorsLogProcess = {};
        this.shouldDispose = true;
    }
    setShouldDispose(shouldDispose) {
        this.shouldDispose = shouldDispose;
    }
    startLogProcess(deviceId, options) {
        if (!this.simulatorsLoggingEnabled[deviceId]) {
            const deviceLogChildProcess = this.$iOSSimResolver.iOSSim.getDeviceLogProcess(deviceId, options ? options.predicate : null);
            const action = (data) => {
                const message = data.toString();
                this.emit(constants_1.DEVICE_LOG_EVENT_NAME, { deviceId, message, muted: (options || {}).muted });
            };
            if (deviceLogChildProcess) {
                deviceLogChildProcess.once("close", () => {
                    this.simulatorsLoggingEnabled[deviceId] = false;
                });
                deviceLogChildProcess.once("error", (err) => {
                    this.$logger.trace(`Error is thrown for device with identifier ${deviceId}. More info: ${err.message}.`);
                    this.simulatorsLoggingEnabled[deviceId] = false;
                });
            }
            if (deviceLogChildProcess.stdout) {
                deviceLogChildProcess.stdout.on("data", action.bind(this));
            }
            if (deviceLogChildProcess.stderr) {
                deviceLogChildProcess.stderr.on("data", action.bind(this));
            }
            this.$processService.attachToProcessExitSignals(this, deviceLogChildProcess.kill);
            this.simulatorsLoggingEnabled[deviceId] = true;
            this.simulatorsLogProcess[deviceId] = deviceLogChildProcess;
        }
    }
    startNewMutedLogProcess(deviceId, options) {
        options = options || {};
        options.muted = true;
        this.simulatorsLoggingEnabled[deviceId] = false;
        this.startLogProcess(deviceId, options);
        this.simulatorsLoggingEnabled[deviceId] = false;
    }
    dispose(signal) {
        if (this.shouldDispose) {
            _.each(this.simulatorsLogProcess, (logProcess, deviceId) => {
                if (logProcess) {
                    logProcess.kill(signal);
                }
            });
        }
    }
}
exports.IOSSimulatorLogProvider = IOSSimulatorLogProvider;
$injector.register("iOSSimulatorLogProvider", IOSSimulatorLogProvider);
