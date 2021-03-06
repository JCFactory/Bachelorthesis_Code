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
const queue = require("./queue");
const path = require("path");
class CommandDispatcher {
    constructor($logger, $cancellation, $commandsService, $staticConfig, $sysInfo, $options, $fs) {
        this.$logger = $logger;
        this.$cancellation = $cancellation;
        this.$commandsService = $commandsService;
        this.$staticConfig = $staticConfig;
        this.$sysInfo = $sysInfo;
        this.$options = $options;
        this.$fs = $fs;
    }
    dispatchCommand() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.$options.version) {
                return this.printVersion();
            }
            if (this.$logger.getLevel() === "TRACE") {
                const sysInfo = yield this.$sysInfo.getSysInfo({ pathToNativeScriptCliPackageJson: path.join(__dirname, "..", "..", "package.json") });
                this.$logger.trace("System information:");
                this.$logger.trace(sysInfo);
            }
            let commandName = this.getCommandName();
            const commandArguments = this.$options.argv._.slice(1);
            const lastArgument = _.last(commandArguments);
            if (this.$options.help) {
                commandArguments.unshift(commandName);
                commandName = "help";
            }
            else if (lastArgument === "/?" || lastArgument === "?") {
                commandArguments.pop();
                commandArguments.unshift(commandName);
                commandName = "help";
            }
            yield this.$cancellation.begin("cli");
            yield this.$commandsService.tryExecuteCommand(commandName, commandArguments);
        });
    }
    completeCommand() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.$commandsService.completeCommand();
        });
    }
    getCommandName() {
        const remaining = this.$options.argv._;
        if (remaining.length > 0) {
            return remaining[0].toString().toLowerCase();
        }
        this.$options.help = true;
        return "";
    }
    printVersion() {
        let version = this.$staticConfig.version;
        const json = this.$fs.readJson(this.$staticConfig.pathToPackageJson);
        if (json && json.buildVersion) {
            version = `${version}-${json.buildVersion}`;
        }
        this.$logger.out(version);
    }
}
exports.CommandDispatcher = CommandDispatcher;
$injector.register("commandDispatcher", CommandDispatcher);
class FutureDispatcher {
    constructor($errors) {
        this.$errors = $errors;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.actions) {
                this.$errors.fail("You cannot run a running future dispatcher.");
            }
            this.actions = new queue.Queue();
            while (true) {
                const action = yield this.actions.dequeue();
                yield action();
            }
        });
    }
    dispatch(action) {
        this.actions.enqueue(action);
    }
}
$injector.register("dispatcher", FutureDispatcher, false);
