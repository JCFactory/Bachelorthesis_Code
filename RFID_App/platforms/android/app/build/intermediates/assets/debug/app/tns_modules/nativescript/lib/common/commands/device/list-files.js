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
class ListFilesCommand {
    constructor($devicesService, $stringParameter, $options, $project, $errors) {
        this.$devicesService = $devicesService;
        this.$stringParameter = $stringParameter;
        this.$options = $options;
        this.$project = $project;
        this.$errors = $errors;
        this.allowedParameters = [this.$stringParameter, this.$stringParameter];
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$devicesService.initialize({ deviceId: this.$options.device, skipInferPlatform: true });
            const pathToList = args[0];
            let appIdentifier = args[1];
            if (!appIdentifier && !this.$project.projectData) {
                this.$errors.failWithoutHelp("Please enter application identifier or execute this command in project.");
            }
            appIdentifier = appIdentifier || this.$project.projectData.AppIdentifier;
            const action = (device) => device.fileSystem.listFiles(pathToList, appIdentifier);
            yield this.$devicesService.execute(action);
        });
    }
}
exports.ListFilesCommand = ListFilesCommand;
$injector.registerCommand(["device|list-files", "devices|list-files"], ListFilesCommand);
