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
class UpdatePluginCommand {
    constructor($pluginsService, $projectData, $errors) {
        this.$pluginsService = $pluginsService;
        this.$projectData = $projectData;
        this.$errors = $errors;
        this.allowedParameters = [];
        this.$projectData.initializeProjectData();
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let pluginNames = args;
            if (!pluginNames || args.length === 0) {
                const installedPlugins = yield this.$pluginsService.getAllInstalledPlugins(this.$projectData);
                pluginNames = installedPlugins.map(p => p.name);
            }
            for (const pluginName of pluginNames) {
                yield this.$pluginsService.remove(pluginName, this.$projectData);
                yield this.$pluginsService.add(pluginName, this.$projectData);
            }
        });
    }
    canExecute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!args || args.length === 0) {
                return true;
            }
            const installedPlugins = yield this.$pluginsService.getAllInstalledPlugins(this.$projectData);
            const installedPluginNames = installedPlugins.map(pl => pl.name);
            const pluginName = args[0].toLowerCase();
            if (!_.some(installedPluginNames, name => name.toLowerCase() === pluginName)) {
                this.$errors.failWithoutHelp(`Plugin "${pluginName}" is not installed.`);
            }
            return true;
        });
    }
}
exports.UpdatePluginCommand = UpdatePluginCommand;
$injector.registerCommand("plugin|update", UpdatePluginCommand);
