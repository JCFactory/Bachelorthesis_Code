"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class ConfigBase {
    constructor($fs) {
        this.$fs = $fs;
        this.DISABLE_HOOKS = false;
    }
    loadConfig(name) {
        const configFileName = this.getConfigPath(name);
        return this.$fs.readJson(configFileName);
    }
    getConfigPath(filename) {
        return path.join(__dirname, "../../config/", filename + ".json");
    }
}
exports.ConfigBase = ConfigBase;
