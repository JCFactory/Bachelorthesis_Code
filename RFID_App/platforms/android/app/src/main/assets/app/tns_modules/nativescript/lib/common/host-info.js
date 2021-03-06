"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const decorators_1 = require("./decorators");
class HostInfo {
    constructor($errors, $injector) {
        this.$errors = $errors;
        this.$injector = $injector;
    }
    get $childProcess() {
        return this.$injector.resolve("childProcess");
    }
    get $osInfo() {
        return this.$injector.resolve("osInfo");
    }
    get $logger() {
        return this.$injector.resolve("logger");
    }
    get isWindows() {
        return process.platform === HostInfo.WIN32_NAME;
    }
    get isWindows64() {
        return this.isWindows && (process.arch === "x64" || process.env.hasOwnProperty(HostInfo.PROCESSOR_ARCHITEW6432));
    }
    get isWindows32() {
        return this.isWindows && !this.isWindows64;
    }
    get isDarwin() {
        return process.platform === HostInfo.DARWIN_OS_NAME;
    }
    get isLinux() {
        return process.platform === HostInfo.LINUX_OS_NAME;
    }
    get isLinux64() {
        return this.isLinux && process.config.variables.host_arch === "x64";
    }
    getMacOSVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isDarwin) {
                return null;
            }
            const systemProfileCommand = "system_profiler SPSoftwareDataType -detailLevel mini";
            this.$logger.trace("Trying to get macOS version.");
            try {
                const systemProfileOutput = yield this.$childProcess.exec(systemProfileCommand);
                const versionRegExp = /System Version:\s+?macOS\s+?(\d+\.\d+)\.\d+\s+/g;
                const regExpMatchers = versionRegExp.exec(systemProfileOutput);
                const macOSVersion = regExpMatchers && regExpMatchers[1];
                if (macOSVersion) {
                    this.$logger.trace(`macOS version based on system_profiler is ${macOSVersion}.`);
                    return macOSVersion;
                }
                this.$logger.trace(`Unable to get macOS version from ${systemProfileCommand} output.`);
            }
            catch (err) {
                this.$logger.trace(`Unable to get macOS version from ${systemProfileCommand}. Error is: ${err}`);
            }
            const osRelease = this.$osInfo.release();
            const majorVersion = osRelease && _.first(osRelease.split("."));
            const macOSVersion = majorVersion && `10.${+majorVersion - 4}`;
            this.$logger.trace(`macOS version based on os.release() (${osRelease}) is ${macOSVersion}.`);
            return macOSVersion;
        });
    }
    dotNetVersion() {
        if (this.isWindows) {
            return new Promise((resolve, reject) => {
                const Winreg = require("winreg");
                const regKey = new Winreg({
                    hive: Winreg.HKLM,
                    key: HostInfo.DOT_NET_REGISTRY_PATH
                });
                regKey.get("Version", (err, value) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(value.value);
                    }
                });
            });
        }
        else {
            return Promise.resolve(null);
        }
    }
    isDotNet40Installed(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isWindows) {
                try {
                    yield this.dotNetVersion();
                    return true;
                }
                catch (e) {
                    this.$errors.failWithoutHelp(message || "An error occurred while reading the registry.");
                }
            }
            else {
                return false;
            }
        });
    }
}
HostInfo.WIN32_NAME = "win32";
HostInfo.PROCESSOR_ARCHITEW6432 = "PROCESSOR_ARCHITEW6432";
HostInfo.DARWIN_OS_NAME = "darwin";
HostInfo.LINUX_OS_NAME = "linux";
HostInfo.DOT_NET_REGISTRY_PATH = "\\Software\\Microsoft\\NET Framework Setup\\NDP\\v4\\Client";
__decorate([
    decorators_1.cache()
], HostInfo.prototype, "getMacOSVersion", null);
exports.HostInfo = HostInfo;
$injector.register("hostInfo", HostInfo);
