"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class ResourceLoader {
    constructor($fs, $staticConfig) {
        this.$fs = $fs;
        this.$staticConfig = $staticConfig;
    }
    resolvePath(resourcePath) {
        return path.join(this.$staticConfig.RESOURCE_DIR_PATH, resourcePath);
    }
    openFile(resourcePath) {
        return this.$fs.createReadStream(this.resolvePath(resourcePath));
    }
    readText(resourcePath) {
        return this.$fs.readText(this.resolvePath(resourcePath));
    }
    readJson(resourcePath) {
        return this.$fs.readJson(this.resolvePath(resourcePath));
    }
    getPathToAppResources(framework) {
        return path.join(this.resolvePath(framework), this.$staticConfig.APP_RESOURCES_DIR_NAME);
    }
}
exports.ResourceLoader = ResourceLoader;
$injector.register("resources", ResourceLoader);
