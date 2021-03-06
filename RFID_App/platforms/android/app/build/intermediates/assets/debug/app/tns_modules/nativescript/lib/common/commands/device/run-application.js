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
class RunApplicationOnDeviceCommand {
    constructor($devicesService, $errors, $stringParameter, $staticConfig, $options) {
        this.$devicesService = $devicesService;
        this.$errors = $errors;
        this.$stringParameter = $stringParameter;
        this.$staticConfig = $staticConfig;
        this.$options = $options;
        this.allowedParameters = [this.$stringParameter, this.$stringParameter];
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$devicesService.initialize({ deviceId: this.$options.device, skipInferPlatform: true });
            if (this.$devicesService.deviceCount > 1) {
                this.$errors.failWithoutHelp("More than one device found. Specify device explicitly with --device option. To discover device ID, use $%s device command.", this.$staticConfig.CLIENT_NAME.toLowerCase());
            }
            yield this.$devicesService.execute((device) => __awaiter(this, void 0, void 0, function* () { return yield device.applicationManager.startApplication({ appId: args[0], projectName: args[1] }); }));
        });
    }
}
exports.RunApplicationOnDeviceCommand = RunApplicationOnDeviceCommand;
$injector.registerCommand(["device|run", "devices|run"], RunApplicationOnDeviceCommand);
