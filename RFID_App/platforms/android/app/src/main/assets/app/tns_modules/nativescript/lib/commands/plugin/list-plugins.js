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
const helpers_1 = require("../../common/helpers");
class ListPluginsCommand {
    constructor($pluginsService, $projectData, $logger) {
        this.$pluginsService = $pluginsService;
        this.$projectData = $projectData;
        this.$logger = $logger;
        this.allowedParameters = [];
        this.$projectData.initializeProjectData();
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const installedPlugins = this.$pluginsService.getDependenciesFromPackageJson(this.$projectData.projectDir);
            const headers = ["Plugin", "Version"];
            const dependenciesData = this.createTableCells(installedPlugins.dependencies);
            const dependenciesTable = helpers_1.createTable(headers, dependenciesData);
            this.$logger.out("Dependencies:");
            this.$logger.out(dependenciesTable.toString());
            if (installedPlugins.devDependencies && installedPlugins.devDependencies.length) {
                const devDependenciesData = this.createTableCells(installedPlugins.devDependencies);
                const devDependenciesTable = helpers_1.createTable(headers, devDependenciesData);
                this.$logger.out("Dev Dependencies:");
                this.$logger.out(devDependenciesTable.toString());
            }
            else {
                this.$logger.out("There are no dev dependencies.");
            }
            const viewDependenciesCommand = "npm view <pluginName> grep dependencies".cyan.toString();
            const viewDevDependenciesCommand = "npm view <pluginName> grep devDependencies".cyan.toString();
            this.$logger.warn("NOTE:");
            this.$logger.warn(`If you want to check the dependencies of installed plugin use ${viewDependenciesCommand}`);
            this.$logger.warn(`If you want to check the dev dependencies of installed plugin use ${viewDevDependenciesCommand}`);
        });
    }
    createTableCells(items) {
        return items.map(item => [item.name, item.version]);
    }
}
exports.ListPluginsCommand = ListPluginsCommand;
$injector.registerCommand("plugin|*list", ListPluginsCommand);
