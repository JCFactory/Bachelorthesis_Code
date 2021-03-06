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
class Wp8EmulatorServices {
    constructor($logger, $emulatorSettingsService, $errors, $childProcess, $devicePlatformsConstants, $hostInfo, $fs) {
        this.$logger = $logger;
        this.$emulatorSettingsService = $emulatorSettingsService;
        this.$errors = $errors;
        this.$childProcess = $childProcess;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.$hostInfo = $hostInfo;
        this.$fs = $fs;
    }
    static get programFilesPath() {
        return (process.arch === "x64") ? process.env["PROGRAMFILES(X86)"] : process.env.ProgramFiles;
    }
    getEmulatorId() {
        return __awaiter(this, void 0, void 0, function* () {
            return "";
        });
    }
    getRunningEmulatorId(image) {
        return __awaiter(this, void 0, void 0, function* () {
            return "";
        });
    }
    checkDependencies() {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    checkAvailability() {
        if (!this.$fs.exists(this.getPathToEmulatorStarter())) {
            this.$errors.failWithoutHelp("You do not have Windows Phone 8 SDK installed. Please install it in order to continue.");
        }
        if (!this.$hostInfo.isWindows) {
            this.$errors.fail("Windows Phone Emulator is available only on Windows 8 or later.");
        }
        const platform = this.$devicePlatformsConstants.WP8;
        if (!this.$emulatorSettingsService.canStart(platform)) {
            this.$errors.fail("The current project does not target Windows Phone 8 and cannot be run in the Windows Phone emulator.");
        }
    }
    startEmulator() {
        return __awaiter(this, void 0, void 0, function* () {
            return "Not implemented.";
        });
    }
    runApplicationOnEmulator(app, emulatorOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$logger.info("Starting Windows Phone Emulator");
            const emulatorStarter = this.getPathToEmulatorStarter();
            this.$childProcess.spawn(emulatorStarter, ["/installlaunch", app, "/targetdevice:xd"], { stdio: "ignore", detached: true }).unref();
        });
    }
    getPathToEmulatorStarter() {
        return path.join(Wp8EmulatorServices.programFilesPath, Wp8EmulatorServices.WP8_LAUNCHER_PATH, Wp8EmulatorServices.WP8_LAUNCHER);
    }
}
Wp8EmulatorServices.WP8_LAUNCHER = "XapDeployCmd.exe";
Wp8EmulatorServices.WP8_LAUNCHER_PATH = "Microsoft SDKs\\Windows Phone\\v8.0\\Tools\\XAP Deployment";
$injector.register("wp8EmulatorServices", Wp8EmulatorServices);
