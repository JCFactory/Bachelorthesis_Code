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
const helpers = require("../../common/helpers");
class ListExtensionsCommand {
    constructor($extensibilityService, $logger) {
        this.$extensibilityService = $extensibilityService;
        this.$logger = $logger;
        this.allowedParameters = [];
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const installedExtensions = this.$extensibilityService.getInstalledExtensions();
            if (_.keys(installedExtensions).length) {
                this.$logger.info("Installed extensions:");
                const data = _.map(installedExtensions, (version, name) => {
                    return [name, version];
                });
                const table = helpers.createTable(["Name", "Version"], data);
                this.$logger.out(table.toString());
            }
            else {
                this.$logger.info("No extensions installed.");
            }
        });
    }
}
exports.ListExtensionsCommand = ListExtensionsCommand;
$injector.registerCommand("extension|*list", ListExtensionsCommand);
