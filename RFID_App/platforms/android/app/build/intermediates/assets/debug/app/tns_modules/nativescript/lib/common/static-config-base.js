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
const shelljs = require("shelljs");
const os = require("os");
class StaticConfigBase {
    constructor($injector) {
        this.$injector = $injector;
        this.PROJECT_FILE_NAME = null;
        this.CLIENT_NAME = null;
        this.ANALYTICS_API_KEY = null;
        this.ANALYTICS_INSTALLATION_ID_SETTING_NAME = null;
        this.TRACK_FEATURE_USAGE_SETTING_NAME = null;
        this.ERROR_REPORT_SETTING_NAME = null;
        this.APP_RESOURCES_DIR_NAME = "App_Resources";
        this.COMMAND_HELP_FILE_NAME = 'command-help.json';
        this.QR_SIZE = 5;
        this.RESOURCE_DIR_PATH = __dirname;
        this.version = null;
        this._userAgent = null;
        this._adbFilePath = null;
    }
    get USER_AGENT_NAME() {
        if (!this._userAgent) {
            this._userAgent = `${this.CLIENT_NAME}CLI`;
        }
        return this._userAgent;
    }
    set USER_AGENT_NAME(userAgentName) {
        this._userAgent = userAgentName;
    }
    getAdbFilePath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._adbFilePath) {
                this._adbFilePath = yield this.getAdbFilePathCore();
            }
            return this._adbFilePath;
        });
    }
    get MAN_PAGES_DIR() {
        return path.join(__dirname, "../../", "docs", "man_pages");
    }
    get HTML_PAGES_DIR() {
        return path.join(__dirname, "../../", "docs", "html");
    }
    get HTML_COMMON_HELPERS_DIR() {
        return path.join(__dirname, "docs", "helpers");
    }
    getAdbFilePathCore() {
        return __awaiter(this, void 0, void 0, function* () {
            const $childProcess = this.$injector.resolve("$childProcess");
            try {
                const proc = yield $childProcess.spawnFromEvent("adb", ["version"], "exit", undefined, { throwError: false });
                if (proc.stderr) {
                    return yield this.spawnPrivateAdb();
                }
            }
            catch (e) {
                if (e.code === "ENOENT") {
                    return yield this.spawnPrivateAdb();
                }
            }
            return "adb";
        });
    }
    spawnPrivateAdb() {
        return __awaiter(this, void 0, void 0, function* () {
            const $fs = this.$injector.resolve("$fs"), $childProcess = this.$injector.resolve("$childProcess"), $hostInfo = this.$injector.resolve("$hostInfo");
            const defaultAdbDirPath = path.join(__dirname, `resources/platform-tools/android/${process.platform}`);
            const commonLibVersion = require(path.join(__dirname, "package.json")).version;
            const tmpDir = path.join(os.tmpdir(), `telerik-common-lib-${commonLibVersion}`);
            $fs.createDirectory(tmpDir);
            const targetAdb = path.join(tmpDir, "adb");
            if (!$fs.exists(tmpDir) || !$fs.readDirectory(tmpDir).length) {
                shelljs.cp(path.join(defaultAdbDirPath, "*"), tmpDir);
                if (!$hostInfo.isWindows) {
                    shelljs.chmod("+x", targetAdb);
                }
            }
            yield $childProcess.spawnFromEvent(targetAdb, ["start-server"], "exit");
            return targetAdb;
        });
    }
}
exports.StaticConfigBase = StaticConfigBase;
