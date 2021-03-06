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
const helpers_1 = require("../../helpers");
class PrintPluginsService {
    constructor($logger, $prompter) {
        this.$logger = $logger;
        this.$prompter = $prompter;
        this._page = 1;
    }
    printPlugins(pluginsSource, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!pluginsSource.hasPlugins()) {
                this.$logger.warn("No plugins found.");
                return;
            }
            const count = options.count || PrintPluginsService.COUNT_OF_PLUGINS_TO_DISPLAY;
            if (!helpers_1.isInteractive() || options.showAllPlugins) {
                const allPlugins = yield pluginsSource.getAllPlugins();
                this.displayTableWithPlugins(allPlugins);
                return;
            }
            let pluginsToDisplay = yield pluginsSource.getPlugins(this._page++, count);
            let shouldDisplayMorePlugins = true;
            this.$logger.out("Available plugins:");
            do {
                this.displayTableWithPlugins(pluginsToDisplay);
                if (pluginsToDisplay.length < count) {
                    return;
                }
                shouldDisplayMorePlugins = yield this.$prompter.confirm("Load more plugins?");
                pluginsToDisplay = yield pluginsSource.getPlugins(this._page++, count);
                if (!pluginsToDisplay || pluginsToDisplay.length < 1) {
                    return;
                }
            } while (shouldDisplayMorePlugins);
        });
    }
    displayTableWithPlugins(plugins) {
        let data = [];
        data = this.createTableCells(plugins);
        const table = this.createPluginsTable(data);
        this.$logger.out(table.toString());
    }
    createPluginsTable(data) {
        const headers = ["Plugin", "Version", "Author", "Description"];
        const table = helpers_1.createTable(headers, data);
        return table;
    }
    createTableCells(plugins) {
        return _.map(plugins, (plugin) => [plugin.name, plugin.version, plugin.author || "", plugin.description || ""]);
    }
}
PrintPluginsService.COUNT_OF_PLUGINS_TO_DISPLAY = 10;
exports.PrintPluginsService = PrintPluginsService;
$injector.register("printPluginsService", PrintPluginsService);
