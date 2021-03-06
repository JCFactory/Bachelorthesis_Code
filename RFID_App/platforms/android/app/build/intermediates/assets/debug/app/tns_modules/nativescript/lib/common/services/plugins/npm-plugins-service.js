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
const npm_plugins_source_1 = require("./npm-plugins-source");
const npm_registry_plugins_source_1 = require("./npm-registry-plugins-source");
const npmjs_plugins_source_1 = require("./npmjs-plugins-source");
class NpmPluginsService {
    constructor($injector) {
        this.$injector = $injector;
    }
    search(projectDir, keywords, modifySearchQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = modifySearchQuery ? modifySearchQuery(keywords) : keywords;
            const pluginsSource = (yield this.searchCore(npmjs_plugins_source_1.NpmjsPluginsSource, projectDir, keywords)) ||
                (yield this.searchCore(npm_registry_plugins_source_1.NpmRegistryPluginsSource, projectDir, keywords)) ||
                (yield this.preparePluginsSource(npm_plugins_source_1.NpmPluginsSource, projectDir, query));
            return pluginsSource;
        });
    }
    optimizedSearch(projectDir, keywords, modifySearchQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.searchCore(npm_registry_plugins_source_1.NpmRegistryPluginsSource, projectDir, keywords)) || (yield this.search(projectDir, keywords, modifySearchQuery));
        });
    }
    searchCore(pluginsSourceConstructor, projectDir, keywords) {
        return __awaiter(this, void 0, void 0, function* () {
            const npmPluginsSource = yield this.preparePluginsSource(pluginsSourceConstructor, projectDir, keywords);
            return npmPluginsSource.hasPlugins() ? npmPluginsSource : null;
        });
    }
    preparePluginsSource(pluginsSourceConstructor, projectDir, keywords) {
        return __awaiter(this, void 0, void 0, function* () {
            const pluginsSource = this.$injector.resolve(pluginsSourceConstructor, { projectDir, keywords });
            yield pluginsSource.initialize(projectDir, keywords);
            return pluginsSource;
        });
    }
}
exports.NpmPluginsService = NpmPluginsService;
$injector.register("npmPluginsService", NpmPluginsService);
