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
const constants_1 = require("../constants");
const helpers_1 = require("../common/helpers");
const os_1 = require("os");
class PlatformEnvironmentRequirements {
    constructor($commandsService, $doctorService, $errors, $logger, $nativeScriptCloudExtensionService, $prompter, $staticConfig, $analyticsService) {
        this.$commandsService = $commandsService;
        this.$doctorService = $doctorService;
        this.$errors = $errors;
        this.$logger = $logger;
        this.$nativeScriptCloudExtensionService = $nativeScriptCloudExtensionService;
        this.$prompter = $prompter;
        this.$staticConfig = $staticConfig;
        this.$analyticsService = $analyticsService;
        this.cliCommandToCloudCommandName = {
            "build": "tns cloud build",
            "run": "tns cloud run",
            "deploy": "tns cloud deploy"
        };
    }
    checkEnvironmentRequirements(platform, projectDir, runtimeVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.NS_SKIP_ENV_CHECK) {
                yield this.$analyticsService.trackEventActionInGoogleAnalytics({
                    action: "Check Environment Requirements",
                    additionalData: "Skipped: NS_SKIP_ENV_CHECK is set"
                });
                return true;
            }
            const canExecute = yield this.$doctorService.canExecuteLocalBuild(platform, projectDir, runtimeVersion);
            if (!canExecute) {
                if (!helpers_1.isInteractive()) {
                    yield this.$analyticsService.trackEventActionInGoogleAnalytics({
                        action: "Check Environment Requirements",
                        additionalData: "Non-interactive terminal, unable to execute local builds."
                    });
                    this.fail(this.getNonInteractiveConsoleMessage(platform));
                }
                const infoMessage = this.getInteractiveConsoleMessage(platform);
                this.$logger.info(infoMessage);
                const choices = this.$nativeScriptCloudExtensionService.isInstalled() ? [
                    PlatformEnvironmentRequirements.TRY_CLOUD_OPERATION_OPTION_NAME,
                    PlatformEnvironmentRequirements.LOCAL_SETUP_OPTION_NAME,
                    PlatformEnvironmentRequirements.MANUALLY_SETUP_OPTION_NAME,
                ] : [
                    PlatformEnvironmentRequirements.CLOUD_SETUP_OPTION_NAME,
                    PlatformEnvironmentRequirements.LOCAL_SETUP_OPTION_NAME,
                    PlatformEnvironmentRequirements.BOTH_CLOUD_SETUP_AND_LOCAL_SETUP_OPTION_NAME,
                    PlatformEnvironmentRequirements.MANUALLY_SETUP_OPTION_NAME,
                ];
                const selectedOption = yield this.promptForChoice({ infoMessage, choices });
                yield this.processCloudBuildsIfNeeded(selectedOption, platform);
                this.processManuallySetupIfNeeded(selectedOption, platform);
                if (selectedOption === PlatformEnvironmentRequirements.LOCAL_SETUP_OPTION_NAME) {
                    yield this.$doctorService.runSetupScript();
                    if (yield this.$doctorService.canExecuteLocalBuild(platform, projectDir, runtimeVersion)) {
                        return true;
                    }
                    if (this.$nativeScriptCloudExtensionService.isInstalled()) {
                        const option = yield this.promptForChoice({
                            infoMessage: PlatformEnvironmentRequirements.NOT_CONFIGURED_ENV_AFTER_SETUP_SCRIPT_MESSAGE,
                            choices: [
                                PlatformEnvironmentRequirements.TRY_CLOUD_OPERATION_OPTION_NAME,
                                PlatformEnvironmentRequirements.MANUALLY_SETUP_OPTION_NAME
                            ]
                        });
                        this.processTryCloudSetupIfNeeded(option, platform);
                        this.processManuallySetupIfNeeded(option, platform);
                    }
                    else {
                        const option = yield this.promptForChoice({
                            infoMessage: PlatformEnvironmentRequirements.NOT_CONFIGURED_ENV_AFTER_SETUP_SCRIPT_MESSAGE,
                            choices: [
                                PlatformEnvironmentRequirements.CLOUD_SETUP_OPTION_NAME,
                                PlatformEnvironmentRequirements.MANUALLY_SETUP_OPTION_NAME
                            ]
                        });
                        yield this.processCloudBuildsIfNeeded(option, platform);
                        this.processManuallySetupIfNeeded(option, platform);
                    }
                }
                if (selectedOption === PlatformEnvironmentRequirements.BOTH_CLOUD_SETUP_AND_LOCAL_SETUP_OPTION_NAME) {
                    yield this.processBothCloudBuildsAndSetupScript();
                    if (yield this.$doctorService.canExecuteLocalBuild(platform, projectDir, runtimeVersion)) {
                        return true;
                    }
                    this.processManuallySetup(platform);
                }
                this.processTryCloudSetupIfNeeded(selectedOption, platform);
            }
            return true;
        });
    }
    processCloudBuildsIfNeeded(selectedOption, platform) {
        return __awaiter(this, void 0, void 0, function* () {
            if (selectedOption === PlatformEnvironmentRequirements.CLOUD_SETUP_OPTION_NAME) {
                yield this.processCloudBuilds(platform);
            }
        });
    }
    processCloudBuilds(platform) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.processCloudBuildsCore();
            this.fail(this.getCloudBuildsMessage(platform));
        });
    }
    processCloudBuildsCore() {
        return this.$nativeScriptCloudExtensionService.install();
    }
    getCloudBuildsMessage(platform) {
        const cloudCommandName = this.cliCommandToCloudCommandName[this.$commandsService.currentCommandData.commandName];
        if (!cloudCommandName) {
            return `In order to test your application use the $ tns login command to log in with your account and then $ tns cloud build command to build your app in the cloud.`;
        }
        if (!platform) {
            return `Use the $ tns login command to log in with your account and then $ ${cloudCommandName.toLowerCase()} command.`;
        }
        return `Use the $ tns login command to log in with your account and then $ ${cloudCommandName.toLowerCase()} ${platform.toLowerCase()} command.`;
    }
    processTryCloudSetupIfNeeded(selectedOption, platform) {
        if (selectedOption === PlatformEnvironmentRequirements.TRY_CLOUD_OPERATION_OPTION_NAME) {
            this.fail(this.getCloudBuildsMessage(platform));
        }
    }
    processManuallySetupIfNeeded(selectedOption, platform) {
        if (selectedOption === PlatformEnvironmentRequirements.MANUALLY_SETUP_OPTION_NAME) {
            this.processManuallySetup(platform);
        }
    }
    processManuallySetup(platform) {
        this.fail(`To be able to ${platform ? `build for ${platform}` : 'build'}, verify that your environment is configured according to the system requirements described at ${this.$staticConfig.SYS_REQUIREMENTS_LINK}. In case you have any questions, you can check our forum: 'http://forum.nativescript.org' and our public Slack channel: 'https://nativescriptcommunity.slack.com/'.`);
    }
    processBothCloudBuildsAndSetupScript() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.processCloudBuildsCore();
            }
            catch (e) {
                this.$logger.trace(`Error while installing ${constants_1.NATIVESCRIPT_CLOUD_EXTENSION_NAME} extension. ${e.message}.`);
            }
            yield this.$doctorService.runSetupScript();
        });
    }
    fail(message) {
        this.$errors.fail({ formatStr: message, suppressCommandHelp: true, printOnStdout: true });
    }
    getNonInteractiveConsoleMessage(platform) {
        return this.$nativeScriptCloudExtensionService.isInstalled() ?
            this.buildMultilineMessage([
                `${PlatformEnvironmentRequirements.MISSING_LOCAL_SETUP_MESSAGE} ${PlatformEnvironmentRequirements.CHOOSE_OPTIONS_MESSAGE}`,
                PlatformEnvironmentRequirements.RUN_TNS_SETUP_MESSAGE,
                this.getCloudBuildsMessage(platform),
                this.getEnvVerificationMessage()
            ]) :
            this.buildMultilineMessage([
                PlatformEnvironmentRequirements.MISSING_LOCAL_AND_CLOUD_SETUP_MESSAGE,
                PlatformEnvironmentRequirements.RUN_TNS_SETUP_MESSAGE,
                `Run $ tns cloud setup command to install the ${constants_1.NATIVESCRIPT_CLOUD_EXTENSION_NAME} extension to configure your environment for cloud builds.`,
                this.getEnvVerificationMessage()
            ]);
    }
    getInteractiveConsoleMessage(platform) {
        return this.$nativeScriptCloudExtensionService.isInstalled() ?
            this.buildMultilineMessage([
                `${PlatformEnvironmentRequirements.MISSING_LOCAL_BUT_CLOUD_SETUP_MESSAGE} ${PlatformEnvironmentRequirements.CHOOSE_OPTIONS_MESSAGE}`,
                `Select "Configure for Local Builds" to run the setup script and automatically configure your environment for local builds.`,
                `Select "Skip Step and Configure Manually" to disregard this option and install any required components manually.`
            ]) :
            this.buildMultilineMessage([
                PlatformEnvironmentRequirements.MISSING_LOCAL_AND_CLOUD_SETUP_MESSAGE,
                `Select "Configure for Cloud Builds" to install the ${constants_1.NATIVESCRIPT_CLOUD_EXTENSION_NAME} extension and automatically configure your environment for cloud builds.`,
                `Select "Configure for Local Builds" to run the setup script and automatically configure your environment for local builds.`,
                `Select "Configure for Both Local and Cloud Builds" to automatically configure your environment for both options.`,
                `Select "Configure for Both Local and Cloud Builds" to automatically configure your environment for both options.`
            ]);
    }
    promptForChoice(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$logger.info(opts.infoMessage);
            yield this.$analyticsService.trackEventActionInGoogleAnalytics({
                action: "Check Environment Requirements",
                additionalData: `User should select: ${opts.infoMessage}`
            });
            const selection = yield this.$prompter.promptForChoice(PlatformEnvironmentRequirements.CHOOSE_OPTIONS_MESSAGE, opts.choices);
            yield this.$analyticsService.trackEventActionInGoogleAnalytics({
                action: "Check Environment Requirements",
                additionalData: `User selected: ${selection}`
            });
            return selection;
        });
    }
    getEnvVerificationMessage() {
        return `Verify that your environment is configured according to the system requirements described at ${this.$staticConfig.SYS_REQUIREMENTS_LINK}.`;
    }
    buildMultilineMessage(parts) {
        return parts.join(os_1.EOL);
    }
}
PlatformEnvironmentRequirements.CLOUD_SETUP_OPTION_NAME = "Configure for Cloud Builds";
PlatformEnvironmentRequirements.LOCAL_SETUP_OPTION_NAME = "Configure for Local Builds";
PlatformEnvironmentRequirements.TRY_CLOUD_OPERATION_OPTION_NAME = "Try Cloud Operation";
PlatformEnvironmentRequirements.MANUALLY_SETUP_OPTION_NAME = "Skip Step and Configure Manually";
PlatformEnvironmentRequirements.BOTH_CLOUD_SETUP_AND_LOCAL_SETUP_OPTION_NAME = "Configure for Both Local and Cloud Builds";
PlatformEnvironmentRequirements.CHOOSE_OPTIONS_MESSAGE = "To continue, choose one of the following options: ";
PlatformEnvironmentRequirements.NOT_CONFIGURED_ENV_AFTER_SETUP_SCRIPT_MESSAGE = `The setup script was not able to configure your environment for local builds. To execute local builds, you have to set up your environment manually. In case you have any questions, you can check our forum: 'http://forum.nativescript.org' and our public Slack channel: 'https://nativescriptcommunity.slack.com/'.`;
PlatformEnvironmentRequirements.MISSING_LOCAL_SETUP_MESSAGE = "Your environment is not configured properly and you will not be able to execute local builds.";
PlatformEnvironmentRequirements.MISSING_LOCAL_AND_CLOUD_SETUP_MESSAGE = `You are missing the ${constants_1.NATIVESCRIPT_CLOUD_EXTENSION_NAME} extension and you will not be able to execute cloud builds. ${PlatformEnvironmentRequirements.MISSING_LOCAL_SETUP_MESSAGE} ${PlatformEnvironmentRequirements.CHOOSE_OPTIONS_MESSAGE} `;
PlatformEnvironmentRequirements.MISSING_LOCAL_BUT_CLOUD_SETUP_MESSAGE = `You have ${constants_1.NATIVESCRIPT_CLOUD_EXTENSION_NAME} extension installed, so you can execute cloud builds, but ${_.lowerFirst(PlatformEnvironmentRequirements.MISSING_LOCAL_SETUP_MESSAGE)}`;
PlatformEnvironmentRequirements.RUN_TNS_SETUP_MESSAGE = 'Run $ tns setup command to run the setup script to try to automatically configure your environment for local builds.';
exports.PlatformEnvironmentRequirements = PlatformEnvironmentRequirements;
$injector.register("platformEnvironmentRequirements", PlatformEnvironmentRequirements);
