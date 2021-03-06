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
const os_1 = require("os");
const util = require("util");
class ListApplicationsCommand {
    constructor($devicesService, $logger, $options) {
        this.$devicesService = $devicesService;
        this.$logger = $logger;
        this.$options = $options;
        this.allowedParameters = [];
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$devicesService.initialize({ deviceId: this.$options.device, skipInferPlatform: true });
            const output = [];
            const action = (device) => __awaiter(this, void 0, void 0, function* () {
                const applications = yield device.applicationManager.getInstalledApplications();
                output.push(util.format("%s=====Installed applications on device with UDID '%s' are:", os_1.EOL, device.deviceInfo.identifier));
                _.each(applications, (applicationId) => output.push(applicationId));
            });
            yield this.$devicesService.execute(action);
            this.$logger.out(output.join(os_1.EOL));
        });
    }
}
exports.ListApplicationsCommand = ListApplicationsCommand;
$injector.registerCommand(["device|list-applications", "devices|list-applications"], ListApplicationsCommand);
