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
const os_1 = require("os");
const path = require("path");
const constants = require("../../constants");
const temp = require("temp");
class BuildPluginCommand {
    constructor($androidPluginBuildService, $errors, $logger, $fs, $options) {
        this.$androidPluginBuildService = $androidPluginBuildService;
        this.$errors = $errors;
        this.$logger = $logger;
        this.$fs = $fs;
        this.$options = $options;
        this.allowedParameters = [];
        this.pluginProjectPath = path.resolve(this.$options.path || ".");
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const platformsAndroidPath = path.join(this.pluginProjectPath, constants.PLATFORMS_DIR_NAME, "android");
            let pluginName = "";
            const pluginPackageJsonPath = path.join(this.pluginProjectPath, constants.PACKAGE_JSON_FILE_NAME);
            if (this.$fs.exists(pluginPackageJsonPath)) {
                const packageJsonContents = this.$fs.readJson(pluginPackageJsonPath);
                if (packageJsonContents && packageJsonContents["name"]) {
                    pluginName = packageJsonContents["name"];
                }
            }
            temp.track();
            const tempAndroidProject = temp.mkdirSync("android-project");
            const options = {
                aarOutputDir: platformsAndroidPath,
                platformsAndroidDirPath: platformsAndroidPath,
                pluginName: pluginName,
                tempPluginDirPath: tempAndroidProject
            };
            const androidPluginBuildResult = yield this.$androidPluginBuildService.buildAar(options);
            if (androidPluginBuildResult) {
                this.$logger.info(`${pluginName} successfully built aar at ${platformsAndroidPath}.${os_1.EOL}Temporary Android project can be found at ${tempAndroidProject}.`);
            }
            const migratedIncludeGradle = this.$androidPluginBuildService.migrateIncludeGradle(options);
            if (migratedIncludeGradle) {
                this.$logger.info(`${pluginName} include gradle updated.`);
            }
        });
    }
    canExecute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.$fs.exists(path.join(this.pluginProjectPath, constants.PLATFORMS_DIR_NAME, "android"))) {
                this.$errors.failWithoutHelp("No plugin found at the current directory, or the plugin does not need to have its platforms/android components built into an `.aar`.");
            }
            return true;
        });
    }
}
exports.BuildPluginCommand = BuildPluginCommand;
$injector.registerCommand("plugin|build", BuildPluginCommand);
