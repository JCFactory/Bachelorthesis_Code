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
const post_install_1 = require("../common/commands/post-install");
class PostInstallCliCommand extends post_install_1.PostInstallCommand {
    constructor($fs, $subscriptionService, $staticConfig, $commandsService, $helpService, $settingsService, $doctorService, $analyticsService, $logger) {
        super($fs, $staticConfig, $commandsService, $helpService, $settingsService, $analyticsService, $logger);
        this.$subscriptionService = $subscriptionService;
    }
    execute(args) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            yield _super("execute").call(this, args);
            yield this.$subscriptionService.subscribeForNewsletter();
        });
    }
    postCommandAction(args) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$logger.info("You have successfully installed NativeScript CLI.");
            this.$logger.info("In order to create a new project, you can use:".green);
            this.$logger.printMarkdown("`tns create <app name>`");
            this.$logger.info("To build your project locally you can use:".green);
            this.$logger.printMarkdown("`tns build <platform>`");
            this.$logger.printMarkdown("NOTE: Local builds require additional setup of your environment. You can find more information here: `https://docs.nativescript.org/start/quick-setup`");
            this.$logger.info("");
            this.$logger.info("To build your project in the cloud you can use:".green);
            this.$logger.printMarkdown("`tns cloud build <platform>`");
            this.$logger.printMarkdown("NOTE: Cloud builds require Telerik account. You can find more information here: `https://docs.nativescript.org/sidekick/intro/requirements`");
            this.$logger.info("");
            this.$logger.printMarkdown("In case you want to experiment quickly with NativeScript, you can try the Playground: `https://play.nativescript.org`");
            this.$logger.info("");
            this.$logger.printMarkdown("In case you have any questions, you can check our forum: `https://forum.nativescript.org` and our public Slack channel: `https://nativescriptcommunity.slack.com/`");
        });
    }
}
exports.PostInstallCliCommand = PostInstallCliCommand;
$injector.registerCommand("post-install-cli", PostInstallCliCommand);
