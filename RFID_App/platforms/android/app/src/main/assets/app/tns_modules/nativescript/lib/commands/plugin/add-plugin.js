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
class AddPluginCommand {
    constructor($pluginsService, $projectData, $errors) {
        this.$pluginsService = $pluginsService;
        this.$projectData = $projectData;
        this.$errors = $errors;
        this.allowedParameters = [];
        this.$projectData.initializeProjectData();
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.$pluginsService.add(args[0], this.$projectData);
        });
    }
    canExecute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!args[0]) {
                this.$errors.fail("You must specify plugin name.");
            }
            const installedPlugins = yield this.$pluginsService.getAllInstalledPlugins(this.$projectData);
            const pluginName = args[0].toLowerCase();
            if (_.some(installedPlugins, (plugin) => plugin.name.toLowerCase() === pluginName)) {
                this.$errors.failWithoutHelp(`Plugin "${pluginName}" is already installed.`);
            }
            return true;
        });
    }
}
exports.AddPluginCommand = AddPluginCommand;
$injector.registerCommand(["plugin|add", "plugin|install"], AddPluginCommand);
