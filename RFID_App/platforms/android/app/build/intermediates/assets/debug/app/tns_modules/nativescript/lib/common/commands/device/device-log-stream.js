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
class OpenDeviceLogStreamCommand {
    constructor($devicesService, $errors, $commandsService, $options, $deviceLogProvider, $loggingLevels, $iOSSimulatorLogProvider) {
        this.$devicesService = $devicesService;
        this.$errors = $errors;
        this.$commandsService = $commandsService;
        this.$options = $options;
        this.$deviceLogProvider = $deviceLogProvider;
        this.$loggingLevels = $loggingLevels;
        this.allowedParameters = [];
        $iOSSimulatorLogProvider.setShouldDispose(false);
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$deviceLogProvider.setLogLevel(this.$loggingLevels.full);
            yield this.$devicesService.initialize({ deviceId: this.$options.device, skipInferPlatform: true });
            if (this.$devicesService.deviceCount > 1) {
                yield this.$commandsService.tryExecuteCommand("device", []);
                this.$errors.fail(OpenDeviceLogStreamCommand.NOT_SPECIFIED_DEVICE_ERROR_MESSAGE);
            }
            const action = (device) => device.openDeviceLogStream({ predicate: 'senderImagePath contains "NativeScript"' });
            yield this.$devicesService.execute(action);
        });
    }
}
OpenDeviceLogStreamCommand.NOT_SPECIFIED_DEVICE_ERROR_MESSAGE = "More than one device found. Specify device explicitly.";
exports.OpenDeviceLogStreamCommand = OpenDeviceLogStreamCommand;
$injector.registerCommand(["device|log", "devices|log"], OpenDeviceLogStreamCommand);
