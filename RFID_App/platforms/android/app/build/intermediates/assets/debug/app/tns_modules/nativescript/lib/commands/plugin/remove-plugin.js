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
class RemovePluginCommand {
    constructor($pluginsService, $errors, $logger, $projectData) {
        this.$pluginsService = $pluginsService;
        this.$errors = $errors;
        this.$logger = $logger;
        this.$projectData = $projectData;
        this.allowedParameters = [];
        this.$projectData.initializeProjectData();
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.$pluginsService.remove(args[0], this.$projectData);
        });
    }
    canExecute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!args[0]) {
                this.$errors.fail("You must specify plugin name.");
            }
            let pluginNames = [];
            try {
                const installedPlugins = yield this.$pluginsService.getAllInstalledPlugins(this.$projectData);
                pluginNames = installedPlugins.map(pl => pl.name);
            }
            catch (err) {
                this.$logger.trace("Error while installing plugins. Error is:", err);
                pluginNames = _.keys(this.$projectData.dependencies);
            }
            const pluginName = args[0].toLowerCase();
            if (!_.some(pluginNames, name => name.toLowerCase() === pluginName)) {
                this.$errors.failWithoutHelp(`Plugin "${pluginName}" is not installed.`);
            }
            return true;
        });
    }
}
exports.RemovePluginCommand = RemovePluginCommand;
$injector.registerCommand("plugin|remove", RemovePluginCommand);
