"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../common/constants");
const decorators_1 = require("../common/decorators");
const semver = require("semver");
class IOSDebuggerPortService {
    constructor($iOSLogParserService, $iOSProjectService, $iOSNotification, $projectDataService, $logger) {
        this.$iOSLogParserService = $iOSLogParserService;
        this.$iOSProjectService = $iOSProjectService;
        this.$iOSNotification = $iOSNotification;
        this.$projectDataService = $projectDataService;
        this.$logger = $logger;
        this.mapDebuggerPortData = {};
    }
    getPort(data) {
        return new Promise((resolve, reject) => {
            if (!this.canStartLookingForDebuggerPort(data)) {
                resolve(IOSDebuggerPortService.DEFAULT_PORT);
                return;
            }
            const key = `${data.deviceId}${data.appId}`;
            let retryCount = 10;
            const interval = setInterval(() => {
                let port = this.getPortByKey(key);
                if (port || retryCount === 0) {
                    clearInterval(interval);
                    resolve(port);
                }
                else {
                    port = this.getPortByKey(key);
                    retryCount--;
                }
            }, 500);
        });
    }
    attachToDebuggerPortFoundEvent(device, data) {
        const projectData = this.$projectDataService.getProjectData(data && data.projectDir);
        if (!this.canStartLookingForDebuggerPort(projectData)) {
            return;
        }
        this.attachToDebuggerPortFoundEventCore();
        this.attachToAttachRequestEvent(device);
        this.$iOSLogParserService.startParsingLog(device, projectData);
    }
    canStartLookingForDebuggerPort(data) {
        const projectData = this.$projectDataService.getProjectData(data && data.projectDir);
        const frameworkVersion = this.$iOSProjectService.getFrameworkVersion(projectData);
        return !frameworkVersion || semver.gt(frameworkVersion, IOSDebuggerPortService.MIN_REQUIRED_FRAMEWORK_VERSION);
    }
    attachToDebuggerPortFoundEventCore() {
        this.$iOSLogParserService.on(constants_1.DEBUGGER_PORT_FOUND_EVENT_NAME, (data) => {
            this.$logger.trace(constants_1.DEBUGGER_PORT_FOUND_EVENT_NAME, data);
            this.setData(data, { port: data.port });
            this.clearTimeout(data);
        });
    }
    attachToAttachRequestEvent(device) {
        this.$iOSNotification.on(constants_1.ATTACH_REQUEST_EVENT_NAME, (data) => {
            this.$logger.trace(constants_1.ATTACH_REQUEST_EVENT_NAME, data);
            const timer = setTimeout(() => {
                this.clearTimeout(data);
                if (!this.getPortByKey(`${data.deviceId}${data.appId}`)) {
                    this.$logger.warn(`NativeScript debugger was not able to get inspector socket port on device ${data.deviceId} for application ${data.appId}.`);
                }
            }, 5000);
            this.setData(data, { port: null, timer });
        });
    }
    getPortByKey(key) {
        if (this.mapDebuggerPortData[key]) {
            return this.mapDebuggerPortData[key].port;
        }
        return null;
    }
    setData(data, storedData) {
        const key = `${data.deviceId}${data.appId}`;
        if (!this.mapDebuggerPortData[key]) {
            this.mapDebuggerPortData[key] = {};
        }
        this.mapDebuggerPortData[key].port = storedData.port;
        this.mapDebuggerPortData[key].timer = storedData.timer;
    }
    clearTimeout(data) {
        const storedData = this.mapDebuggerPortData[`${data.deviceId}${data.appId}`];
        if (storedData && storedData.timer) {
            clearTimeout(storedData.timer);
        }
    }
}
IOSDebuggerPortService.DEFAULT_PORT = 18181;
IOSDebuggerPortService.MIN_REQUIRED_FRAMEWORK_VERSION = "4.0.1";
__decorate([
    decorators_1.cache()
], IOSDebuggerPortService.prototype, "attachToDebuggerPortFoundEventCore", null);
__decorate([
    decorators_1.cache()
], IOSDebuggerPortService.prototype, "attachToAttachRequestEvent", null);
exports.IOSDebuggerPortService = IOSDebuggerPortService;
$injector.register("iOSDebuggerPortService", IOSDebuggerPortService);
