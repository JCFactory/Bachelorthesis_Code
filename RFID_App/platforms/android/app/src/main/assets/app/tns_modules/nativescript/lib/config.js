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
const path = require("path");
const static_config_base_1 = require("./common/static-config-base");
const config_base_1 = require("./common/config-base");
class Configuration extends config_base_1.ConfigBase {
    constructor($fs) {
        super($fs);
        this.$fs = $fs;
        this.CI_LOGGER = false;
        this.DEBUG = false;
        this.TYPESCRIPT_COMPILER_OPTIONS = {};
        this.ANDROID_DEBUG_UI = null;
        this.USE_POD_SANDBOX = false;
        _.extend(this, this.loadConfig("config"));
    }
}
exports.Configuration = Configuration;
$injector.register("config", Configuration);
class StaticConfig extends static_config_base_1.StaticConfigBase {
    constructor($injector) {
        super($injector);
        this.PROJECT_FILE_NAME = "package.json";
        this.CLIENT_NAME_KEY_IN_PROJECT_FILE = "nativescript";
        this.CLIENT_NAME = "tns";
        this.CLIENT_NAME_ALIAS = "NativeScript";
        this.ANALYTICS_API_KEY = "5752dabccfc54c4ab82aea9626b7338e";
        this.ANALYTICS_EXCEPTIONS_API_KEY = "35478fe7de68431399e96212540a3d5d";
        this.TRACK_FEATURE_USAGE_SETTING_NAME = "TrackFeatureUsage";
        this.ERROR_REPORT_SETTING_NAME = "TrackExceptions";
        this.ANALYTICS_INSTALLATION_ID_SETTING_NAME = "AnalyticsInstallationID";
        this.INSTALLATION_SUCCESS_MESSAGE = "Installation successful. You are good to go. Connect with us on `http://twitter.com/NativeScript`.";
        this.version = require("../package.json").version;
        this.RESOURCE_DIR_PATH = path.join(this.RESOURCE_DIR_PATH, "../../resources");
    }
    get PROFILE_DIR_NAME() {
        return ".nativescript-cli";
    }
    get disableCommandHooks() {
        return true;
    }
    get SYS_REQUIREMENTS_LINK() {
        let linkToSysRequirements;
        switch (process.platform) {
            case "linux":
                linkToSysRequirements = "http://docs.nativescript.org/setup/ns-cli-setup/ns-setup-linux.html#system-requirements";
                break;
            case "win32":
                linkToSysRequirements = "http://docs.nativescript.org/setup/ns-cli-setup/ns-setup-win.html#system-requirements";
                break;
            case "darwin":
                linkToSysRequirements = "http://docs.nativescript.org/setup/ns-cli-setup/ns-setup-os-x.html#system-requirements";
                break;
            default:
                linkToSysRequirements = "";
        }
        return linkToSysRequirements;
    }
    get HTML_CLI_HELPERS_DIR() {
        return path.join(__dirname, "../docs/helpers");
    }
    get pathToPackageJson() {
        return path.join(__dirname, "..", "package.json");
    }
    get PATH_TO_BOOTSTRAP() {
        return path.join(__dirname, "bootstrap.js");
    }
    getAdbFilePath() {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._adbFilePath) {
                const androidToolsInfo = this.$injector.resolve("androidToolsInfo");
                this._adbFilePath = (yield androidToolsInfo.getPathToAdbFromAndroidHome()) || (yield _super("getAdbFilePath").call(this));
            }
            return this._adbFilePath;
        });
    }
}
exports.StaticConfig = StaticConfig;
$injector.register("staticConfig", StaticConfig);
