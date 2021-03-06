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
const plugins_source_base_1 = require("./plugins-source-base");
class NpmPluginsSource extends plugins_source_base_1.PluginsSourceBase {
    constructor($progressIndicator, $logger, $npmService) {
        super($progressIndicator, $logger);
        this.$progressIndicator = $progressIndicator;
        this.$logger = $logger;
        this.$npmService = $npmService;
    }
    get progressIndicatorMessage() {
        return "Searching for plugins with npm search command.";
    }
    getPlugins(page, count) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = page * count;
            return _.slice(this.plugins, skip, skip + count);
        });
    }
    initializeCore(projectDir, keywords) {
        return __awaiter(this, void 0, void 0, function* () {
            this.plugins = yield this.$npmService.search(this.projectDir, keywords);
        });
    }
}
exports.NpmPluginsSource = NpmPluginsSource;
