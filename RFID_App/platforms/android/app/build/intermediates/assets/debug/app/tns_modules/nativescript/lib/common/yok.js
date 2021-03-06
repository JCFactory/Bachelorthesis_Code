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
const helpers_1 = require("./helpers");
const constants_1 = require("./constants");
let indent = "";
function trace(formatStr, ...args) {
}
function pushIndent() {
    indent += "  ";
}
function popIndent() {
    indent = indent.slice(0, -2);
}
function forEachName(names, action) {
    if (_.isString(names)) {
        action(names);
    }
    else {
        names.forEach(action);
    }
}
function register(...rest) {
    return function (target) {
        $injector.register(rest[0], target);
    };
}
exports.register = register;
class Yok {
    constructor() {
        this.overrideAlreadyRequiredModule = false;
        this.COMMANDS_NAMESPACE = "commands";
        this.modules = {};
        this.resolutionProgress = {};
        this.hierarchicalCommands = {};
        this.publicApi = {
            __modules__: {}
        };
        this.register("injector", this);
    }
    requireCommand(names, file) {
        forEachName(names, (commandName) => {
            const commands = commandName.split("|");
            if (commands.length > 1) {
                if (_.startsWith(commands[1], '*') && this.modules[this.createCommandName(commands[0])]) {
                    throw new Error("Default commands should be required before child commands");
                }
                const parentCommandName = commands[0];
                if (!this.hierarchicalCommands[parentCommandName]) {
                    this.hierarchicalCommands[parentCommandName] = [];
                }
                this.hierarchicalCommands[parentCommandName].push(_.tail(commands).join("|"));
            }
            if (commands.length > 1 && !this.modules[this.createCommandName(commands[0])]) {
                this.require(this.createCommandName(commands[0]), file);
                if (commands[1] && !commandName.match(/\|\*/)) {
                    this.require(this.createCommandName(commandName), file);
                }
            }
            else {
                this.require(this.createCommandName(commandName), file);
            }
        });
    }
    require(names, file) {
        forEachName(names, (name) => this.requireOne(name, file));
    }
    requirePublic(names, file) {
        forEachName(names, (name) => {
            this.requireOne(name, file);
            this.resolvePublicApi(name, file);
        });
    }
    requirePublicClass(names, file) {
        forEachName(names, (name) => {
            this.requireOne(name, file);
            this.addClassToPublicApi(name, file);
        });
    }
    addClassToPublicApi(name, file) {
        Object.defineProperty(this.publicApi, name, {
            get: () => {
                return this.resolveInstance(name);
            }
        });
    }
    resolvePublicApi(name, file) {
        Object.defineProperty(this.publicApi, name, {
            get: () => {
                this.resolveInstance(name);
                return this.publicApi.__modules__[name];
            }
        });
    }
    resolveInstance(name) {
        let classInstance = this.modules[name].instance;
        if (!classInstance) {
            classInstance = this.resolve(name);
        }
        return classInstance;
    }
    requireOne(name, file) {
        const relativePath = path.join("../", file);
        const dependency = {
            require: require("fs").existsSync(path.join(__dirname, relativePath + ".js")) ? relativePath : file,
            shared: true
        };
        if (!this.modules[name] || this.overrideAlreadyRequiredModule) {
            this.modules[name] = dependency;
        }
        else {
            throw new Error(`module '${name}' require'd twice.`);
        }
    }
    registerCommand(names, resolver) {
        forEachName(names, (name) => {
            const commands = name.split("|");
            this.register(this.createCommandName(name), resolver);
            if (commands.length > 1) {
                this.createHierarchicalCommand(commands[0]);
            }
        });
    }
    getDefaultCommand(name, commandArguments) {
        const subCommands = this.hierarchicalCommands[name];
        const defaultCommand = _.find(subCommands, command => _.some(command.split("|"), c => _.startsWith(c, "*")));
        return defaultCommand;
    }
    buildHierarchicalCommand(parentCommandName, commandLineArguments) {
        let currentSubCommandName, finalSubCommandName, matchingSubCommandName;
        const subCommands = this.hierarchicalCommands[parentCommandName];
        let remainingArguments = commandLineArguments;
        let finalRemainingArguments = commandLineArguments;
        _.each(commandLineArguments, arg => {
            arg = arg.toLowerCase();
            currentSubCommandName = currentSubCommandName ? this.getHierarchicalCommandName(currentSubCommandName, arg) : arg;
            remainingArguments = _.tail(remainingArguments);
            if (matchingSubCommandName = _.find(subCommands, sc => sc === currentSubCommandName || sc === `${"*"}${currentSubCommandName}`)) {
                finalSubCommandName = matchingSubCommandName;
                finalRemainingArguments = remainingArguments;
            }
        });
        if (!finalSubCommandName) {
            finalSubCommandName = this.getDefaultCommand(parentCommandName, commandLineArguments) || "";
            finalRemainingArguments = _.difference(commandLineArguments, finalSubCommandName
                .split("|")
                .map(command => _.startsWith(command, "*") ? command.substr(1) : command));
        }
        if (finalSubCommandName) {
            return { commandName: this.getHierarchicalCommandName(parentCommandName, finalSubCommandName), remainingArguments: finalRemainingArguments };
        }
    }
    createHierarchicalCommand(name) {
        const factory = () => {
            return {
                disableAnalytics: true,
                isHierarchicalCommand: true,
                execute: (args) => __awaiter(this, void 0, void 0, function* () {
                    const commandsService = $injector.resolve("commandsService");
                    let commandName = null;
                    const defaultCommand = this.getDefaultCommand(name, args);
                    let commandArguments = [];
                    if (args.length > 0) {
                        const hierarchicalCommand = this.buildHierarchicalCommand(name, args);
                        if (hierarchicalCommand) {
                            commandName = hierarchicalCommand.commandName;
                            commandArguments = hierarchicalCommand.remainingArguments;
                        }
                        else {
                            commandName = defaultCommand ? this.getHierarchicalCommandName(name, defaultCommand) : "help";
                            if (_.includes(this.hierarchicalCommands[name], "*" + args[0])) {
                                commandArguments = _.tail(args);
                            }
                            else {
                                commandArguments = args;
                            }
                        }
                    }
                    else {
                        if (defaultCommand) {
                            commandName = this.getHierarchicalCommandName(name, defaultCommand);
                        }
                        else {
                            commandName = "help";
                            const options = this.resolve("options");
                            options.help = true;
                        }
                    }
                    yield commandsService.tryExecuteCommand(commandName, commandName === "help" ? [name] : commandArguments);
                })
            };
        };
        $injector.registerCommand(name, factory);
    }
    getHierarchicalCommandName(parentCommandName, subCommandName) {
        return [parentCommandName, subCommandName].join("|");
    }
    isValidHierarchicalCommand(commandName, commandArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            if (_.includes(Object.keys(this.hierarchicalCommands), commandName)) {
                const subCommands = this.hierarchicalCommands[commandName];
                if (subCommands) {
                    const fullCommandName = this.buildHierarchicalCommand(commandName, commandArguments);
                    if (!fullCommandName) {
                        const errors = $injector.resolve("errors");
                        errors.fail(constants_1.ERROR_NO_VALID_SUBCOMMAND_FORMAT, commandName);
                    }
                    return true;
                }
            }
            return false;
        });
    }
    isDefaultCommand(commandName) {
        return commandName.indexOf("*") > 0 && commandName.indexOf("|") > 0;
    }
    register(name, resolver, shared) {
        shared = shared === undefined ? true : shared;
        trace("registered '%s'", name);
        const dependency = this.modules[name] || {};
        dependency.shared = shared;
        if (_.isFunction(resolver)) {
            dependency.resolver = resolver;
        }
        else {
            dependency.instance = resolver;
        }
        this.modules[name] = dependency;
    }
    resolveCommand(name) {
        let command;
        const commandModuleName = this.createCommandName(name);
        if (!this.modules[commandModuleName]) {
            return null;
        }
        command = this.resolve(commandModuleName);
        return command;
    }
    resolve(param, ctorArguments) {
        if (_.isFunction(param)) {
            return this.resolveConstructor(param, ctorArguments);
        }
        else {
            return this.resolveByName(param, ctorArguments);
        }
    }
    get dynamicCallRegex() {
        return /#{([^.]+)\.([^}]+?)(\((.+)\))*}/;
    }
    getDynamicCallData(call, args) {
        const parsed = call.match(this.dynamicCallRegex);
        const module = this.resolve(parsed[1]);
        if (!args && parsed[3]) {
            args = _.map(parsed[4].split(","), arg => arg.trim());
        }
        return module[parsed[2]].apply(module, args);
    }
    dynamicCall(call, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = this.getDynamicCallData(call, args);
            if (helpers_1.isPromise(data)) {
                return yield data;
            }
            return data;
        });
    }
    resolveConstructor(ctor, ctorArguments) {
        helpers_1.annotate(ctor);
        const resolvedArgs = ctor.$inject.args.map(paramName => {
            if (ctorArguments && ctorArguments.hasOwnProperty(paramName)) {
                return ctorArguments[paramName];
            }
            else {
                return this.resolve(paramName);
            }
        });
        const name = ctor.$inject.name;
        if (name && name[0] === name[0].toUpperCase()) {
            return new ctor(...resolvedArgs);
        }
        else {
            return ctor.apply(null, resolvedArgs);
        }
    }
    resolveByName(name, ctorArguments) {
        if (name[0] === "$") {
            name = name.substr(1);
        }
        if (this.resolutionProgress[name]) {
            throw new Error(`Cyclic dependency detected on dependency '${name}'`);
        }
        this.resolutionProgress[name] = true;
        trace("resolving '%s'", name);
        pushIndent();
        let dependency;
        try {
            dependency = this.resolveDependency(name);
            if (!dependency) {
                throw new Error("unable to resolve " + name);
            }
            if (!dependency.instance || !dependency.shared) {
                if (!dependency.resolver) {
                    throw new Error("no resolver registered for " + name);
                }
                dependency.instance = this.resolveConstructor(dependency.resolver, ctorArguments);
            }
        }
        finally {
            popIndent();
            delete this.resolutionProgress[name];
        }
        return dependency.instance;
    }
    resolveDependency(name) {
        const module = this.modules[name];
        if (!module) {
            throw new Error("unable to resolve " + name);
        }
        if (module.require) {
            require(module.require);
        }
        return module;
    }
    getRegisteredCommandsNames(includeDev) {
        const modulesNames = _.keys(this.modules);
        const commandsNames = _.filter(modulesNames, moduleName => _.startsWith(moduleName, `${this.COMMANDS_NAMESPACE}.`));
        let commands = _.map(commandsNames, (commandName) => commandName.substr(this.COMMANDS_NAMESPACE.length + 1));
        if (!includeDev) {
            commands = _.reject(commands, (command) => _.startsWith(command, "dev-"));
        }
        return commands;
    }
    getChildrenCommandsNames(commandName) {
        return this.hierarchicalCommands[commandName];
    }
    createCommandName(name) {
        return `${this.COMMANDS_NAMESPACE}.${name}`;
    }
    dispose() {
        Object.keys(this.modules).forEach((moduleName) => {
            const instance = this.modules[moduleName].instance;
            if (instance && instance.dispose && instance !== this) {
                instance.dispose();
            }
        });
    }
}
exports.Yok = Yok;
exports.injector = new Yok();
