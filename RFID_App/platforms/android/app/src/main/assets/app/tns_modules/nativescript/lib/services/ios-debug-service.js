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
const net = require("net");
const path = require("path");
const log4js = require("log4js");
const debug_service_base_1 = require("./debug-service-base");
const constants_1 = require("../constants");
const helpers_1 = require("../common/helpers");
const inspectorAppName = "NativeScript Inspector.app";
const inspectorNpmPackageName = "tns-ios-inspector";
const inspectorUiDir = "WebInspectorUI/";
class IOSDebugService extends debug_service_base_1.DebugServiceBase {
    constructor(device, $devicesService, $platformService, $iOSEmulatorServices, $childProcess, $hostInfo, $logger, $errors, $npmInstallationManager, $iOSDebuggerPortService, $iOSNotification, $iOSSocketRequestExecutor, $processService, $socketProxyFactory, $projectDataService, $deviceLogProvider) {
        super(device, $devicesService);
        this.device = device;
        this.$devicesService = $devicesService;
        this.$platformService = $platformService;
        this.$iOSEmulatorServices = $iOSEmulatorServices;
        this.$childProcess = $childProcess;
        this.$hostInfo = $hostInfo;
        this.$logger = $logger;
        this.$errors = $errors;
        this.$npmInstallationManager = $npmInstallationManager;
        this.$iOSDebuggerPortService = $iOSDebuggerPortService;
        this.$iOSNotification = $iOSNotification;
        this.$iOSSocketRequestExecutor = $iOSSocketRequestExecutor;
        this.$processService = $processService;
        this.$socketProxyFactory = $socketProxyFactory;
        this.$projectDataService = $projectDataService;
        this.$deviceLogProvider = $deviceLogProvider;
        this._sockets = [];
        this.$processService.attachToProcessExitSignals(this, this.debugStop);
        this.$socketProxyFactory.on(constants_1.CONNECTION_ERROR_EVENT_NAME, (e) => this.emit(constants_1.CONNECTION_ERROR_EVENT_NAME, e));
    }
    get platform() {
        return "ios";
    }
    debug(debugData, debugOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (debugOptions.debugBrk && debugOptions.start) {
                this.$errors.failWithoutHelp("Expected exactly one of the --debug-brk or --start options.");
            }
            if (this.$devicesService.isOnlyiOSSimultorRunning() || this.$devicesService.deviceCount === 0) {
                debugOptions.emulator = true;
            }
            if (!debugOptions.justlaunch) {
                let projectName = debugData.projectName;
                if (!projectName && debugData.projectDir) {
                    const projectData = this.$projectDataService.getProjectData(debugData.projectDir);
                    projectName = projectData.projectName;
                }
                if (projectName) {
                    this.$deviceLogProvider.setProjectNameForDevice(debugData.deviceIdentifier, projectName);
                }
                yield this.device.openDeviceLogStream();
            }
            this.$iOSDebuggerPortService.attachToDebuggerPortFoundEvent(this.device, debugData);
            if (debugOptions.emulator) {
                if (debugOptions.start) {
                    return this.emulatorStart(debugData, debugOptions);
                }
                else {
                    return this.emulatorDebugBrk(debugData, debugOptions);
                }
            }
            else {
                if (debugOptions.start) {
                    return this.deviceStart(debugData, debugOptions);
                }
                else {
                    return this.deviceDebugBrk(debugData, debugOptions);
                }
            }
        });
    }
    debugStart(debugData, debugOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$devicesService.initialize({ platform: this.platform, deviceId: debugData.deviceIdentifier });
            const action = (device) => __awaiter(this, void 0, void 0, function* () { return device.isEmulator ? yield this.emulatorDebugBrk(debugData, debugOptions) : yield this.debugBrkCore(device, debugData, debugOptions); });
            yield this.$devicesService.execute(action, this.getCanExecuteAction(debugData.deviceIdentifier));
        });
    }
    debugStop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._socketProxy) {
                this._socketProxy.close();
                this._socketProxy = null;
            }
            _.forEach(this._sockets, socket => socket.destroy());
            this._sockets = [];
            if (this._lldbProcess) {
                this._lldbProcess.stdin.write("process detach\n");
                yield this.killProcess(this._lldbProcess);
                this._lldbProcess = undefined;
            }
        });
    }
    getChromeDebugUrl(debugOptions, port) {
        const debugOpts = _.cloneDeep(debugOptions);
        debugOpts.useBundledDevTools = debugOpts.useBundledDevTools === undefined ? false : debugOpts.useBundledDevTools;
        const chromeDebugUrl = super.getChromeDebugUrl(debugOpts, port);
        return chromeDebugUrl;
    }
    killProcess(childProcess) {
        return __awaiter(this, void 0, void 0, function* () {
            if (childProcess) {
                return new Promise((resolve, reject) => {
                    childProcess.on("close", resolve);
                    childProcess.kill();
                });
            }
        });
    }
    emulatorDebugBrk(debugData, debugOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const args = debugOptions.debugBrk ? "--nativescript-debug-brk" : "--nativescript-debug-start";
            const launchResult = yield this.$iOSEmulatorServices.runApplicationOnEmulator(debugData.pathToAppPackage, {
                waitForDebugger: true,
                captureStdin: true,
                args: args,
                appId: debugData.applicationIdentifier,
                skipInstall: true,
                device: debugData.deviceIdentifier
            });
            const pid = helpers_1.getPidFromiOSSimulatorLogs(debugData.applicationIdentifier, launchResult);
            this._lldbProcess = this.$childProcess.spawn("lldb", ["-p", pid]);
            if (log4js.levels.TRACE.isGreaterThanOrEqualTo(this.$logger.getLevel())) {
                this._lldbProcess.stdout.pipe(process.stdout);
            }
            this._lldbProcess.stderr.pipe(process.stderr);
            this._lldbProcess.stdin.write("process continue\n");
            return this.wireDebuggerClient(debugData, debugOptions);
        });
    }
    emulatorStart(debugData, debugOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.wireDebuggerClient(debugData, debugOptions);
            const attachRequestMessage = this.$iOSNotification.getAttachRequest(debugData.applicationIdentifier, debugData.deviceIdentifier);
            const iOSEmulatorService = this.$iOSEmulatorServices;
            yield iOSEmulatorService.postDarwinNotification(attachRequestMessage, debugData.deviceIdentifier);
            return result;
        });
    }
    deviceDebugBrk(debugData, debugOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$devicesService.initialize({ platform: this.platform, deviceId: debugData.deviceIdentifier });
            const projectData = this.$projectDataService.getProjectData(debugData.projectDir);
            const action = (device) => __awaiter(this, void 0, void 0, function* () {
                if (device.isEmulator) {
                    return yield this.emulatorDebugBrk(debugData, debugOptions);
                }
                const runOptions = {
                    device: debugData.deviceIdentifier,
                    emulator: debugOptions.emulator,
                    justlaunch: debugOptions.justlaunch
                };
                const promisesResults = yield Promise.all([
                    this.$platformService.startApplication(this.platform, runOptions, { appId: debugData.applicationIdentifier, projectName: projectData.projectName }),
                    this.debugBrkCore(device, debugData, debugOptions)
                ]);
                return _.last(promisesResults);
            });
            const deviceActionResult = yield this.$devicesService.execute(action, this.getCanExecuteAction(debugData.deviceIdentifier));
            return deviceActionResult[0].result;
        });
    }
    debugBrkCore(device, debugData, debugOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$iOSSocketRequestExecutor.executeLaunchRequest(device.deviceInfo.identifier, constants_1.AWAIT_NOTIFICATION_TIMEOUT_SECONDS, constants_1.AWAIT_NOTIFICATION_TIMEOUT_SECONDS, debugData.applicationIdentifier, debugOptions.debugBrk);
            return this.wireDebuggerClient(debugData, debugOptions, device);
        });
    }
    deviceStart(debugData, debugOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$devicesService.initialize({ platform: this.platform, deviceId: debugData.deviceIdentifier });
            const action = (device) => __awaiter(this, void 0, void 0, function* () { return device.isEmulator ? yield this.emulatorStart(debugData, debugOptions) : yield this.deviceStartCore(device, debugData, debugOptions); });
            const deviceActionResult = yield this.$devicesService.execute(action, this.getCanExecuteAction(debugData.deviceIdentifier));
            return deviceActionResult[0].result;
        });
    }
    deviceStartCore(device, debugData, debugOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$iOSSocketRequestExecutor.executeAttachRequest(device, constants_1.AWAIT_NOTIFICATION_TIMEOUT_SECONDS, debugData.applicationIdentifier);
            return this.wireDebuggerClient(debugData, debugOptions, device);
        });
    }
    wireDebuggerClient(debugData, debugOptions, device) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((debugOptions.inspector || !debugOptions.client) && this.$hostInfo.isDarwin) {
                this._socketProxy = yield this.$socketProxyFactory.createTCPSocketProxy(this.getSocketFactory(debugData, device));
                yield this.openAppInspector(this._socketProxy.address(), debugData, debugOptions);
                return null;
            }
            else {
                if (debugOptions.chrome) {
                    this.$logger.info("'--chrome' is the default behavior. Use --inspector to debug iOS applications using the Safari Web Inspector.");
                }
                const deviceIdentifier = device ? device.deviceInfo.identifier : debugData.deviceIdentifier;
                this._socketProxy = yield this.$socketProxyFactory.createWebSocketProxy(this.getSocketFactory(debugData, device), deviceIdentifier);
                return this.getChromeDebugUrl(debugOptions, this._socketProxy.options.port);
            }
        });
    }
    openAppInspector(fileDescriptor, debugData, debugOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (debugOptions.client) {
                const inspectorPath = yield this.$npmInstallationManager.getInspectorFromCache(inspectorNpmPackageName, debugData.projectDir);
                const inspectorSourceLocation = path.join(inspectorPath, inspectorUiDir, "Main.html");
                const inspectorApplicationPath = path.join(inspectorPath, inspectorAppName);
                const cmd = `open -a '${inspectorApplicationPath}' --args '${inspectorSourceLocation}' '${debugData.projectName}' '${fileDescriptor}'`;
                yield this.$childProcess.exec(cmd);
            }
            else {
                this.$logger.info("Suppressing debugging client.");
            }
        });
    }
    getSocketFactory(debugData, device) {
        const factory = () => __awaiter(this, void 0, void 0, function* () {
            const port = yield this.$iOSDebuggerPortService.getPort({ projectDir: debugData.projectDir, deviceId: debugData.deviceIdentifier, appId: debugData.applicationIdentifier });
            if (!port) {
                this.$errors.fail("NativeScript debugger was not able to get inspector socket port.");
            }
            const socket = device ? yield device.connectToPort(port) : net.connect(port);
            this._sockets.push(socket);
            return socket;
        });
        factory.bind(this);
        return factory;
    }
}
exports.IOSDebugService = IOSDebugService;
$injector.register("iOSDebugService", IOSDebugService, false);
