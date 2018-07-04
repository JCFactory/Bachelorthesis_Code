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
const application_manager_base_1 = require("../../application-manager-base");
const path = require("path");
const temp = require("temp");
const helpers_1 = require("../../../helpers");
const decorators_1 = require("../../../decorators");
class IOSSimulatorApplicationManager extends application_manager_base_1.ApplicationManagerBase {
    constructor(iosSim, device, $options, $fs, $plistParser, $deviceLogProvider, $logger, $hooksService) {
        super($logger, $hooksService);
        this.iosSim = iosSim;
        this.device = device;
        this.$options = $options;
        this.$fs = $fs;
        this.$plistParser = $plistParser;
        this.$deviceLogProvider = $deviceLogProvider;
    }
    getInstalledApplications() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.iosSim.getInstalledApplications(this.device.deviceInfo.identifier);
        });
    }
    installApplication(packageFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.$fs.exists(packageFilePath) && path.extname(packageFilePath) === ".zip") {
                temp.track();
                const dir = temp.mkdirSync("simulatorPackage");
                yield this.$fs.unzip(packageFilePath, dir);
                const app = _.find(this.$fs.readDirectory(dir), directory => path.extname(directory) === ".app");
                if (app) {
                    packageFilePath = path.join(dir, app);
                }
            }
            this.iosSim.installApplication(this.device.deviceInfo.identifier, packageFilePath);
        });
    }
    uninstallApplication(appIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.iosSim.uninstallApplication(this.device.deviceInfo.identifier, appIdentifier);
        });
    }
    startApplication(appData) {
        return __awaiter(this, void 0, void 0, function* () {
            const launchResult = this.iosSim.startApplication(this.device.deviceInfo.identifier, appData.appId);
            const pid = helpers_1.getPidFromiOSSimulatorLogs(appData.appId, launchResult);
            yield this.setDeviceLogData(appData, pid);
        });
    }
    stopApplication(appData) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.iosSim.stopApplication(this.device.deviceInfo.identifier, appData.appId, appData.projectName);
        });
    }
    getApplicationInfo(applicationIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = null;
            const plistContent = yield this.getParsedPlistContent(applicationIdentifier);
            if (plistContent) {
                result = {
                    applicationIdentifier,
                    deviceIdentifier: this.device.deviceInfo.identifier,
                    configuration: plistContent && plistContent.configuration
                };
            }
            return result;
        });
    }
    isLiveSyncSupported(appIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            const plistContent = yield this.getParsedPlistContent(appIdentifier);
            if (plistContent) {
                return !!plistContent && !!plistContent.IceniumLiveSyncEnabled;
            }
            return false;
        });
    }
    getDebuggableApps() {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    getDebuggableAppViews(appIdentifiers) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(null);
        });
    }
    getParsedPlistContent(appIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.isApplicationInstalled(appIdentifier))) {
                return null;
            }
            const applicationPath = this.iosSim.getApplicationPath(this.device.deviceInfo.identifier, appIdentifier), pathToInfoPlist = path.join(applicationPath, "Info.plist");
            return this.$fs.exists(pathToInfoPlist) ? yield this.$plistParser.parseFile(pathToInfoPlist) : null;
        });
    }
    setDeviceLogData(appData, pid) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$deviceLogProvider.setApplicationPidForDevice(this.device.deviceInfo.identifier, pid);
            this.$deviceLogProvider.setProjectNameForDevice(this.device.deviceInfo.identifier, appData.projectName);
            if (!this.$options.justlaunch) {
                yield this.startDeviceLog();
            }
        });
    }
    startDeviceLog() {
        return this.device.openDeviceLogStream({ predicate: 'senderImagePath contains "NativeScript"' });
    }
}
__decorate([
    helpers_1.hook('install')
], IOSSimulatorApplicationManager.prototype, "installApplication", null);
__decorate([
    decorators_1.cache()
], IOSSimulatorApplicationManager.prototype, "startDeviceLog", null);
exports.IOSSimulatorApplicationManager = IOSSimulatorApplicationManager;
