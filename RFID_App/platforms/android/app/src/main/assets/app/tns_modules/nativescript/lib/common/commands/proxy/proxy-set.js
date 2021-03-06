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
const commandParams = require("../../command-params");
const helpers_1 = require("../../helpers");
const proxy_base_1 = require("./proxy-base");
const constants_1 = require("../../constants");
const url_1 = require("url");
const os_1 = require("os");
const { getCredentialsFromAuth } = require("proxy-lib/lib/utils");
const proxySetCommandName = "proxy|set";
class ProxySetCommand extends proxy_base_1.ProxyCommandBase {
    constructor($errors, $injector, $prompter, $hostInfo, $staticConfig, $analyticsService, $logger, $options, $proxyService) {
        super($analyticsService, $logger, $proxyService, proxySetCommandName);
        this.$errors = $errors;
        this.$injector = $injector;
        this.$prompter = $prompter;
        this.$hostInfo = $hostInfo;
        this.$staticConfig = $staticConfig;
        this.$analyticsService = $analyticsService;
        this.$logger = $logger;
        this.$options = $options;
        this.$proxyService = $proxyService;
        this.allowedParameters = [
            new commandParams.StringCommandParameter(this.$injector),
            new commandParams.StringCommandParameter(this.$injector),
            new commandParams.StringCommandParameter(this.$injector)
        ];
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let urlString = args[0];
            let username = args[1];
            let password = args[2];
            const noUrl = !urlString;
            if (noUrl) {
                if (!helpers_1.isInteractive()) {
                    this.$errors.fail("Console is not interactive - you need to supply all command parameters.");
                }
                else {
                    urlString = yield this.$prompter.getString("Url", { allowEmpty: false });
                }
            }
            let urlObj = url_1.parse(urlString);
            if ((!urlObj.protocol || !urlObj.hostname) && !helpers_1.isInteractive()) {
                this.$errors.fail("The url you have entered is invalid please enter a valid url containing a valid protocol and hostname.");
            }
            while (!urlObj.protocol || !urlObj.hostname) {
                this.$logger.warn("The url you have entered is invalid please enter a valid url containing a valid protocol and hostname.");
                urlString = yield this.$prompter.getString("Url", { allowEmpty: false });
                urlObj = url_1.parse(urlString);
            }
            let port = urlObj.port && +urlObj.port || constants_1.HttpProtocolToPort[urlObj.protocol];
            const noPort = !port || !this.isValidPort(port);
            const authCredentials = getCredentialsFromAuth(urlObj.auth || "");
            if ((username && authCredentials.username && username !== authCredentials.username) ||
                password && authCredentials.password && password !== authCredentials.password) {
                this.$errors.fail("The credentials you have provided in the url address mismatch those passed as command line arguments.");
            }
            username = username || authCredentials.username;
            password = password || authCredentials.password;
            if (!helpers_1.isInteractive()) {
                if (noPort) {
                    this.$errors.failWithoutHelp(`The port you have specified (${port || "none"}) is not valid.`);
                }
                else if (this.isPasswordRequired(username, password)) {
                    this.$errors.fail("Console is not interactive - you need to supply all command parameters.");
                }
            }
            if (noPort) {
                if (port) {
                    this.$logger.warn(this.getInvalidPortMessage(port));
                }
                port = yield this.getPortFromUserInput();
            }
            if (!username) {
                this.$logger.info("In case your proxy requires authentication, please specify username and password. If authentication is not required, just leave it empty.");
                username = yield this.$prompter.getString("Username", { defaultAction: () => "" });
            }
            if (this.isPasswordRequired(username, password)) {
                password = yield this.$prompter.getPassword("Password");
            }
            const settings = {
                proxyUrl: urlString,
                username,
                password,
                rejectUnauthorized: !this.$options.insecure
            };
            if (!this.$hostInfo.isWindows) {
                this.$logger.warn(`Note that storing credentials is not supported on ${os_1.platform()} yet.`);
            }
            const clientName = this.$staticConfig.CLIENT_NAME.toLowerCase();
            const messageNote = (clientName === "tns" ?
                "Note that 'npm' and 'Gradle' need to be configured separately to work with a proxy." :
                "Note that `npm` needs to be configured separately to work with a proxy.") + os_1.EOL;
            this.$logger.warn(`${messageNote}Run '${clientName} proxy set --help' for more information.`);
            yield this.$proxyService.setCache(settings);
            this.$logger.out(`Successfully setup proxy.${os_1.EOL}`);
            this.$logger.out(yield this.$proxyService.getInfo());
            yield this.tryTrackUsage();
        });
    }
    isPasswordRequired(username, password) {
        return !!(username && !password);
    }
    isValidPort(port) {
        return !isNaN(port) && port > 0 && port < 65536;
    }
    getPortFromUserInput() {
        return __awaiter(this, void 0, void 0, function* () {
            const schemaName = "port";
            const schema = {
                message: "Port",
                type: "input",
                name: schemaName,
                validate: (value) => {
                    return (!value || !this.isValidPort(value)) ? this.getInvalidPortMessage(value) : true;
                }
            };
            const prompterResult = yield this.$prompter.get([schema]);
            return parseInt(prompterResult[schemaName]);
        });
    }
    getInvalidPortMessage(port) {
        return `Specified port ${port} is not valid. Please enter a value between 1 and 65535.`;
    }
}
exports.ProxySetCommand = ProxySetCommand;
$injector.registerCommand(proxySetCommandName, ProxySetCommand);
