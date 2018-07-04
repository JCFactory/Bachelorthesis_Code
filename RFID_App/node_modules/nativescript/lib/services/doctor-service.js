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
const helpers = require("../common/helpers");
const nativescript_doctor_1 = require("nativescript-doctor");
class DoctorService {
    constructor($analyticsService, $hostInfo, $logger, $childProcess, $injector, $terminalSpinnerService, $versionsService) {
        this.$analyticsService = $analyticsService;
        this.$hostInfo = $hostInfo;
        this.$logger = $logger;
        this.$childProcess = $childProcess;
        this.$injector = $injector;
        this.$terminalSpinnerService = $terminalSpinnerService;
        this.$versionsService = $versionsService;
    }
    printWarnings(configOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const infos = yield this.$terminalSpinnerService.execute({
                text: `Getting environment information ${os_1.EOL}`
            }, () => nativescript_doctor_1.doctor.getInfos({ projectDir: configOptions && configOptions.projectDir, androidRuntimeVersion: configOptions && configOptions.runtimeVersion }));
            const warnings = infos.filter(info => info.type === nativescript_doctor_1.constants.WARNING_TYPE_NAME);
            const hasWarnings = warnings.length > 0;
            const hasAndroidWarnings = warnings.filter(warning => _.includes(warning.platforms, nativescript_doctor_1.constants.ANDROID_PLATFORM_NAME)).length > 0;
            if (hasAndroidWarnings) {
                this.printPackageManagerTip();
            }
            if (!configOptions || configOptions.trackResult) {
                yield this.$analyticsService.track("DoctorEnvironmentSetup", hasWarnings ? "incorrect" : "correct");
            }
            if (hasWarnings) {
                this.$logger.info("There seem to be issues with your configuration.");
            }
            else {
                this.$logger.out("No issues were detected.".bold);
                this.printInfosCore(infos);
            }
            try {
                yield this.$versionsService.printVersionsInformation();
            }
            catch (err) {
                this.$logger.error("Cannot get the latest versions information from npm. Please try again later.");
            }
            yield this.$injector.resolve("platformEnvironmentRequirements").checkEnvironmentRequirements(null, configOptions && configOptions.projectDir);
        });
    }
    runSetupScript() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$analyticsService.trackEventActionInGoogleAnalytics({
                action: "Run Setup Script",
                additionalData: "Starting",
            });
            if (this.$hostInfo.isLinux) {
                yield this.$analyticsService.trackEventActionInGoogleAnalytics({
                    action: "Run Setup Script",
                    additionalData: "Skipped as OS is Linux",
                });
                return;
            }
            this.$logger.out("Running the setup script to try and automatically configure your environment.");
            if (this.$hostInfo.isDarwin) {
                yield this.runSetupScriptCore(DoctorService.DarwinSetupScriptLocation, []);
            }
            if (this.$hostInfo.isWindows) {
                yield this.runSetupScriptCore(DoctorService.WindowsSetupScriptExecutable, DoctorService.WindowsSetupScriptArguments);
            }
            yield this.$analyticsService.trackEventActionInGoogleAnalytics({
                action: "Run Setup Script",
                additionalData: "Finished",
            });
        });
    }
    canExecuteLocalBuild(platform, projectDir, runtimeVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$analyticsService.trackEventActionInGoogleAnalytics({
                action: "Check Local Build Setup",
                additionalData: "Starting",
            });
            const infos = yield nativescript_doctor_1.doctor.getInfos({ platform, projectDir, androidRuntimeVersion: runtimeVersion });
            const warnings = this.filterInfosByType(infos, nativescript_doctor_1.constants.WARNING_TYPE_NAME);
            const hasWarnings = warnings.length > 0;
            if (hasWarnings) {
                yield this.$analyticsService.trackEventActionInGoogleAnalytics({
                    action: "Check Local Build Setup",
                    additionalData: `Warnings:${warnings.map(w => w.message).join("__")}`,
                });
                this.printInfosCore(infos);
            }
            else {
                infos.map(info => this.$logger.trace(info.message));
            }
            yield this.$analyticsService.trackEventActionInGoogleAnalytics({
                action: "Check Local Build Setup",
                additionalData: `Finished: Is setup correct: ${!hasWarnings}`,
            });
            return !hasWarnings;
        });
    }
    runSetupScriptCore(executablePath, setupScriptArgs) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.$childProcess.spawnFromEvent(executablePath, setupScriptArgs, "close", { stdio: "inherit" });
        });
    }
    printPackageManagerTip() {
        if (this.$hostInfo.isWindows) {
            this.$logger.out("TIP: To avoid setting up the necessary environment variables, you can use the chocolatey package manager to install the Android SDK and its dependencies." + os_1.EOL);
        }
        else if (this.$hostInfo.isDarwin) {
            this.$logger.out("TIP: To avoid setting up the necessary environment variables, you can use the Homebrew package manager to install the Android SDK and its dependencies." + os_1.EOL);
        }
    }
    printInfosCore(infos) {
        if (!helpers.isInteractive()) {
            infos.map(info => {
                let message = info.message;
                if (info.type === nativescript_doctor_1.constants.WARNING_TYPE_NAME) {
                    message = `WARNING: ${info.message.yellow} ${os_1.EOL} ${info.additionalInformation} ${os_1.EOL}`;
                }
                this.$logger.out(message);
            });
        }
        infos.filter(info => info.type === nativescript_doctor_1.constants.INFO_TYPE_NAME)
            .map(info => {
            const spinner = this.$terminalSpinnerService.createSpinner();
            spinner.text = info.message;
            spinner.succeed();
        });
        infos.filter(info => info.type === nativescript_doctor_1.constants.WARNING_TYPE_NAME)
            .map(info => {
            const spinner = this.$terminalSpinnerService.createSpinner();
            spinner.text = `${info.message.yellow} ${os_1.EOL} ${info.additionalInformation} ${os_1.EOL}`;
            spinner.fail();
        });
    }
    filterInfosByType(infos, type) {
        return infos.filter(info => info.type === type);
    }
}
DoctorService.DarwinSetupScriptLocation = path.join(__dirname, "..", "..", "setup", "mac-startup-shell-script.sh");
DoctorService.WindowsSetupScriptExecutable = "powershell.exe";
DoctorService.WindowsSetupScriptArguments = ["start-process", "-FilePath", "PowerShell.exe", "-NoNewWindow", "-Wait", "-ArgumentList", '"-NoProfile -ExecutionPolicy Bypass -Command iex ((new-object net.webclient).DownloadString(\'https://www.nativescript.org/setup/win\'))"'];
$injector.register("doctorService", DoctorService);
