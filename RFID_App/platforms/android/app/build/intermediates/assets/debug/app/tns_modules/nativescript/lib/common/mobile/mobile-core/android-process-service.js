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
const os_1 = require("os");
const shelljs = require("shelljs");
const device_android_debug_bridge_1 = require("../android/device-android-debug-bridge");
const constants_1 = require("../../constants");
const decorators_1 = require("../../decorators");
class AndroidProcessService {
    constructor($errors, $injector, $net, $processService) {
        this.$errors = $errors;
        this.$injector = $injector;
        this.$net = $net;
        this.$processService = $processService;
        this._devicesAdbs = {};
        this._forwardedLocalPorts = {};
    }
    forwardFreeTcpToAbstractPort(portForwardInputData) {
        return __awaiter(this, void 0, void 0, function* () {
            const adb = yield this.setupForPortForwarding(portForwardInputData);
            return this.forwardPort(portForwardInputData, adb);
        });
    }
    mapAbstractToTcpPort(deviceIdentifier, appIdentifier, framework) {
        return __awaiter(this, void 0, void 0, function* () {
            this.tryAttachToProcessExitSignals();
            const adb = yield this.setupForPortForwarding({ deviceIdentifier, appIdentifier });
            const processId = (yield this.getProcessIds(adb, [appIdentifier]))[appIdentifier];
            const applicationNotStartedErrorMessage = `The application is not started on the device with identifier ${deviceIdentifier}.`;
            if (!processId) {
                this.$errors.failWithoutHelp(applicationNotStartedErrorMessage);
            }
            const abstractPortsInformation = yield this.getAbstractPortsInformation(adb);
            const abstractPort = yield this.getAbstractPortForApplication(adb, processId, appIdentifier, abstractPortsInformation, framework);
            if (!abstractPort) {
                this.$errors.failWithoutHelp(applicationNotStartedErrorMessage);
            }
            const forwardedTcpPort = yield this.forwardPort({ deviceIdentifier, appIdentifier, abstractPort: `localabstract:${abstractPort}` }, adb);
            return forwardedTcpPort && forwardedTcpPort.toString();
        });
    }
    getMappedAbstractToTcpPorts(deviceIdentifier, appIdentifiers, framework) {
        return __awaiter(this, void 0, void 0, function* () {
            const adb = this.getAdb(deviceIdentifier), abstractPortsInformation = yield this.getAbstractPortsInformation(adb), processIds = yield this.getProcessIds(adb, appIdentifiers), adbForwardList = yield adb.executeCommand(["forward", "--list"]), localPorts = {};
            yield Promise.all(_.map(appIdentifiers, (appIdentifier) => __awaiter(this, void 0, void 0, function* () {
                localPorts[appIdentifier] = null;
                const processId = processIds[appIdentifier];
                if (!processId) {
                    return;
                }
                const abstractPort = yield this.getAbstractPortForApplication(adb, processId, appIdentifier, abstractPortsInformation, framework);
                if (!abstractPort) {
                    return;
                }
                const localPort = yield this.getAlreadyMappedPort(adb, deviceIdentifier, abstractPort, adbForwardList);
                if (localPort) {
                    localPorts[appIdentifier] = localPort;
                }
            })));
            return localPorts;
        });
    }
    getDebuggableApps(deviceIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            const adb = this.getAdb(deviceIdentifier);
            const androidWebViewPortInformation = (yield this.getAbstractPortsInformation(adb)).split(os_1.EOL);
            const portInformation = yield Promise.all(_.map(androidWebViewPortInformation, (line) => __awaiter(this, void 0, void 0, function* () {
                return (yield this.getApplicationInfoFromWebViewPortInformation(adb, deviceIdentifier, line))
                    || (yield this.getNativeScriptApplicationInformation(adb, deviceIdentifier, line));
            })));
            return _(portInformation)
                .filter(deviceAppInfo => !!deviceAppInfo)
                .groupBy(element => element.framework)
                .map((group) => _.uniqBy(group, g => g.appIdentifier))
                .flatten()
                .value();
        });
    }
    getAppProcessId(deviceIdentifier, appIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            const adb = this.getAdb(deviceIdentifier);
            const processId = (yield this.getProcessIds(adb, [appIdentifier]))[appIdentifier];
            return processId ? processId.toString() : null;
        });
    }
    forwardPort(portForwardInputData, adb) {
        return __awaiter(this, void 0, void 0, function* () {
            let localPort = yield this.getAlreadyMappedPort(adb, portForwardInputData.deviceIdentifier, portForwardInputData.abstractPort);
            if (!localPort) {
                localPort = yield this.$net.getFreePort();
                yield adb.executeCommand(["forward", `tcp:${localPort}`, portForwardInputData.abstractPort]);
            }
            this._forwardedLocalPorts[portForwardInputData.deviceIdentifier] = localPort;
            return localPort && +localPort;
        });
    }
    setupForPortForwarding(portForwardInputData) {
        return __awaiter(this, void 0, void 0, function* () {
            this.tryAttachToProcessExitSignals();
            const adb = this.getAdb(portForwardInputData.deviceIdentifier);
            return adb;
        });
    }
    getApplicationInfoFromWebViewPortInformation(adb, deviceIdentifier, information) {
        return __awaiter(this, void 0, void 0, function* () {
            const processIdRegExp = /@webview_devtools_remote_(.+)/g;
            const processIdMatches = processIdRegExp.exec(information);
            let cordovaAppIdentifier;
            if (processIdMatches) {
                const processId = processIdMatches[1];
                cordovaAppIdentifier = yield this.getApplicationIdentifierFromPid(adb, processId);
            }
            else {
                const chromeAppIdentifierRegExp = /@(.+)_devtools_remote\s?/g;
                const chromeAppIdentifierMatches = chromeAppIdentifierRegExp.exec(information);
                if (chromeAppIdentifierMatches && chromeAppIdentifierMatches.length > 0) {
                    cordovaAppIdentifier = chromeAppIdentifierMatches[1];
                }
            }
            if (cordovaAppIdentifier) {
                return {
                    deviceIdentifier: deviceIdentifier,
                    appIdentifier: cordovaAppIdentifier,
                    framework: constants_1.TARGET_FRAMEWORK_IDENTIFIERS.Cordova
                };
            }
            return null;
        });
    }
    getNativeScriptApplicationInformation(adb, deviceIdentifier, information) {
        return __awaiter(this, void 0, void 0, function* () {
            const nativeScriptAppIdentifierRegExp = /@(.+)-(debug|inspectorServer)/g;
            const nativeScriptAppIdentifierMatches = nativeScriptAppIdentifierRegExp.exec(information);
            if (nativeScriptAppIdentifierMatches && nativeScriptAppIdentifierMatches.length > 0) {
                const appIdentifier = nativeScriptAppIdentifierMatches[1];
                return {
                    deviceIdentifier: deviceIdentifier,
                    appIdentifier: appIdentifier,
                    framework: constants_1.TARGET_FRAMEWORK_IDENTIFIERS.NativeScript
                };
            }
            return null;
        });
    }
    getAbstractPortForApplication(adb, processId, appIdentifier, abstractPortsInformation, framework) {
        return __awaiter(this, void 0, void 0, function* () {
            framework = framework || "";
            switch (framework.toLowerCase()) {
                case constants_1.TARGET_FRAMEWORK_IDENTIFIERS.Cordova.toLowerCase():
                    return this.getCordovaPortInformation(abstractPortsInformation, appIdentifier, processId);
                case constants_1.TARGET_FRAMEWORK_IDENTIFIERS.NativeScript.toLowerCase():
                    return this.getNativeScriptPortInformation(abstractPortsInformation, appIdentifier);
                default:
                    return this.getCordovaPortInformation(abstractPortsInformation, appIdentifier, processId) ||
                        this.getNativeScriptPortInformation(abstractPortsInformation, appIdentifier);
            }
        });
    }
    getCordovaPortInformation(abstractPortsInformation, appIdentifier, processId) {
        return this.getPortInformation(abstractPortsInformation, `${appIdentifier}_devtools_remote`) || this.getPortInformation(abstractPortsInformation, processId);
    }
    getNativeScriptPortInformation(abstractPortsInformation, appIdentifier) {
        return this.getPortInformation(abstractPortsInformation, `${appIdentifier}-debug`);
    }
    getAbstractPortsInformation(adb) {
        return __awaiter(this, void 0, void 0, function* () {
            return adb.executeShellCommand(["cat", "/proc/net/unix"]);
        });
    }
    getPortInformation(abstractPortsInformation, searchedInfo) {
        const processRegExp = new RegExp(`\\w+:\\s+(?:\\w+\\s+){1,6}@(.*?${searchedInfo})$`, "gm");
        const match = processRegExp.exec(abstractPortsInformation);
        return match && match[1];
    }
    getProcessIds(adb, appIdentifiers) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = {};
            const processIdInformation = yield adb.executeShellCommand(["ps"]);
            _.each(appIdentifiers, appIdentifier => {
                const processIdRegExp = new RegExp(`^\\w*\\s*(\\d+).*?${appIdentifier}$`);
                result[appIdentifier] = this.getFirstMatchingGroupFromMultilineResult(processIdInformation, processIdRegExp);
            });
            return result;
        });
    }
    getAlreadyMappedPort(adb, deviceIdentifier, abstractPort, adbForwardList) {
        return __awaiter(this, void 0, void 0, function* () {
            const allForwardedPorts = adbForwardList || (yield adb.executeCommand(["forward", "--list"])) || "";
            const regex = new RegExp(`${deviceIdentifier}\\s+?tcp:(\\d+?)\\s+?.*?${abstractPort}$`);
            return this.getFirstMatchingGroupFromMultilineResult(allForwardedPorts, regex);
        });
    }
    getAdb(deviceIdentifier) {
        if (!this._devicesAdbs[deviceIdentifier]) {
            this._devicesAdbs[deviceIdentifier] = this.$injector.resolve(device_android_debug_bridge_1.DeviceAndroidDebugBridge, { identifier: deviceIdentifier });
        }
        return this._devicesAdbs[deviceIdentifier];
    }
    getApplicationIdentifierFromPid(adb, pid, psData) {
        return __awaiter(this, void 0, void 0, function* () {
            psData = psData || (yield adb.executeShellCommand(["ps"]));
            return this.getFirstMatchingGroupFromMultilineResult(psData, new RegExp(`\\s+${pid}(?:\\s+\\d+){3}\\s+.*\\s+(.*?)$`));
        });
    }
    getFirstMatchingGroupFromMultilineResult(input, regex) {
        let result;
        _((input || "").split('\n'))
            .map(line => line.trim())
            .filter(line => !!line)
            .each(line => {
            const matches = line.match(regex);
            if (matches && matches[1]) {
                result = matches[1];
                return false;
            }
        });
        return result;
    }
    tryAttachToProcessExitSignals() {
        this.$processService.attachToProcessExitSignals(this, () => {
            _.each(this._forwardedLocalPorts, (port, deviceIdentifier) => {
                shelljs.exec(`adb -s ${deviceIdentifier} forward --remove tcp:${port}`);
            });
        });
    }
}
__decorate([
    decorators_1.exported("androidProcessService")
], AndroidProcessService.prototype, "getAppProcessId", null);
__decorate([
    decorators_1.cache()
], AndroidProcessService.prototype, "tryAttachToProcessExitSignals", null);
exports.AndroidProcessService = AndroidProcessService;
$injector.register("androidProcessService", AndroidProcessService);
