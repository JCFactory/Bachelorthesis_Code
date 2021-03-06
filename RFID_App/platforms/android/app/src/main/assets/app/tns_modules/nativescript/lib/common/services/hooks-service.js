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
const util = require("util");
const helpers_1 = require("../helpers");
class Hook {
    constructor(name, fullPath) {
        this.name = name;
        this.fullPath = fullPath;
    }
}
class HooksService {
    constructor($childProcess, $fs, $logger, $errors, $config, $staticConfig, $injector, $projectHelper, $options) {
        this.$childProcess = $childProcess;
        this.$fs = $fs;
        this.$logger = $logger;
        this.$errors = $errors;
        this.$config = $config;
        this.$staticConfig = $staticConfig;
        this.$injector = $injector;
        this.$projectHelper = $projectHelper;
        this.$options = $options;
    }
    get hookArgsName() {
        return "hookArgs";
    }
    initialize(projectDir) {
        this.cachedHooks = {};
        const relativeToLibPath = path.join(__dirname, "../../");
        this.hooksDirectories = [
            path.join(relativeToLibPath, HooksService.HOOKS_DIRECTORY_NAME),
            path.join(relativeToLibPath, "common", HooksService.HOOKS_DIRECTORY_NAME)
        ];
        projectDir = projectDir || this.$projectHelper.projectDir;
        if (projectDir) {
            this.hooksDirectories.push(path.join(projectDir, HooksService.HOOKS_DIRECTORY_NAME));
        }
        this.$logger.trace("Hooks directories: " + util.inspect(this.hooksDirectories));
    }
    static formatHookName(commandName) {
        return commandName.replace(/\|[\s\S]*$/, "");
    }
    executeBeforeHooks(commandName, hookArguments) {
        const beforeHookName = `before-${HooksService.formatHookName(commandName)}`;
        const traceMessage = `BeforeHookName for command ${commandName} is ${beforeHookName}`;
        return this.executeHooks(beforeHookName, traceMessage, hookArguments);
    }
    executeAfterHooks(commandName, hookArguments) {
        const afterHookName = `after-${HooksService.formatHookName(commandName)}`;
        const traceMessage = `AfterHookName for command ${commandName} is ${afterHookName}`;
        return this.executeHooks(afterHookName, traceMessage, hookArguments);
    }
    executeHooks(hookName, traceMessage, hookArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.$config.DISABLE_HOOKS || !this.$options.hooks) {
                return;
            }
            const hookArgs = hookArguments && hookArguments[this.hookArgsName];
            let projectDir = hookArgs && hookArgs.projectDir;
            if (!projectDir && hookArgs) {
                const candidate = helpers_1.getValueFromNestedObject(hookArgs, "projectDir");
                projectDir = candidate && candidate.projectDir;
            }
            this.$logger.trace(`Project dir from hooksArgs is: ${projectDir}.`);
            this.initialize(projectDir);
            this.$logger.trace(traceMessage);
            const results = [];
            try {
                for (const hooksDirectory of this.hooksDirectories) {
                    results.push(yield this.executeHooksInDirectory(hooksDirectory, hookName, hookArguments));
                }
            }
            catch (err) {
                this.$logger.trace("Failed during hook execution.");
                this.$errors.failWithoutHelp(err.message || err);
            }
            return _.flatten(results);
        });
    }
    executeHooksInDirectory(directoryPath, hookName, hookArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            hookArguments = hookArguments || {};
            const results = [];
            const hooks = this.getHooksByName(directoryPath, hookName);
            for (let i = 0; i < hooks.length; ++i) {
                const hook = hooks[i];
                this.$logger.info("Executing %s hook from %s", hookName, hook.fullPath);
                let command = this.getSheBangInterpreter(hook);
                let inProc = false;
                if (!command) {
                    command = hook.fullPath;
                    if (path.extname(hook.fullPath).toLowerCase() === ".js") {
                        command = process.argv[0];
                        inProc = this.shouldExecuteInProcess(this.$fs.readText(hook.fullPath));
                    }
                }
                if (inProc) {
                    this.$logger.trace("Executing %s hook at location %s in-process", hookName, hook.fullPath);
                    const hookEntryPoint = require(hook.fullPath);
                    this.$logger.trace(`Validating ${hookName} arguments.`);
                    const invalidArguments = this.validateHookArguments(hookEntryPoint);
                    if (invalidArguments.length) {
                        this.$logger.warn(`${hookName} will NOT be executed because it has invalid arguments - ${invalidArguments.join(", ").grey}.`);
                        return;
                    }
                    const projectDataHookArg = hookArguments["hookArgs"] && hookArguments["hookArgs"]["projectData"];
                    if (projectDataHookArg) {
                        hookArguments["projectData"] = hookArguments["$projectData"] = projectDataHookArg;
                    }
                    const maybePromise = this.$injector.resolve(hookEntryPoint, hookArguments);
                    if (maybePromise) {
                        this.$logger.trace('Hook promises to signal completion');
                        try {
                            const result = yield maybePromise;
                            results.push(result);
                        }
                        catch (err) {
                            if (err && _.isBoolean(err.stopExecution) && err.errorAsWarning === true) {
                                this.$logger.warn(err.message || err);
                            }
                            else {
                                throw err || new Error(`Failed to execute hook: ${hook.fullPath}.`);
                            }
                        }
                        this.$logger.trace('Hook completed');
                    }
                }
                else {
                    const environment = this.prepareEnvironment(hook.fullPath);
                    this.$logger.trace("Executing %s hook at location %s with environment ", hookName, hook.fullPath, environment);
                    const output = yield this.$childProcess.spawnFromEvent(command, [hook.fullPath], "close", environment, { throwError: false });
                    results.push(output);
                    if (output.exitCode !== 0) {
                        throw new Error(output.stdout + output.stderr);
                    }
                }
            }
            return results;
        });
    }
    getHooksByName(directoryPath, hookName) {
        const allBaseHooks = this.getHooksInDirectory(directoryPath);
        const baseHooks = _.filter(allBaseHooks, hook => hook.name.toLowerCase() === hookName.toLowerCase());
        const moreHooks = this.getHooksInDirectory(path.join(directoryPath, hookName));
        return baseHooks.concat(moreHooks);
    }
    getHooksInDirectory(directoryPath) {
        if (!this.cachedHooks[directoryPath]) {
            let hooks = [];
            if (directoryPath && this.$fs.exists(directoryPath) && this.$fs.getFsStats(directoryPath).isDirectory()) {
                const directoryContent = this.$fs.readDirectory(directoryPath);
                const files = _.filter(directoryContent, (entry) => {
                    const fullPath = path.join(directoryPath, entry);
                    const isFile = this.$fs.getFsStats(fullPath).isFile();
                    return isFile;
                });
                hooks = _.map(files, file => {
                    const fullPath = path.join(directoryPath, file);
                    return new Hook(this.getBaseFilename(file), fullPath);
                });
            }
            this.cachedHooks[directoryPath] = hooks;
        }
        return this.cachedHooks[directoryPath];
    }
    prepareEnvironment(hookFullPath) {
        const clientName = this.$staticConfig.CLIENT_NAME.toUpperCase();
        const environment = {};
        environment[util.format("%s-COMMANDLINE", clientName)] = process.argv.join(' ');
        environment[util.format("%s-HOOK_FULL_PATH", clientName)] = hookFullPath;
        environment[util.format("%s-VERSION", clientName)] = this.$staticConfig.version;
        return {
            cwd: this.$projectHelper.projectDir,
            stdio: 'inherit',
            env: _.extend({}, process.env, environment)
        };
    }
    getSheBangInterpreter(hook) {
        let interpreter = null;
        let shMatch = [];
        const fileContent = this.$fs.readText(hook.fullPath);
        if (fileContent) {
            const sheBangMatch = fileContent.split('\n')[0].match(/^#!(?:\/usr\/bin\/env )?([^\r\n]+)/m);
            if (sheBangMatch) {
                interpreter = sheBangMatch[1];
            }
            if (interpreter) {
                shMatch = interpreter.match(/bin\/((?:ba)?sh)$/);
            }
            if (shMatch) {
                interpreter = shMatch[1];
            }
        }
        return interpreter;
    }
    getBaseFilename(fileName) {
        return fileName.substr(0, fileName.length - path.extname(fileName).length);
    }
    shouldExecuteInProcess(scriptSource) {
        try {
            const esprima = require('esprima');
            const ast = esprima.parse(scriptSource);
            let inproc = false;
            ast.body.forEach((statement) => {
                if (statement.type !== 'ExpressionStatement'
                    || statement.expression.type !== 'AssignmentExpression') {
                    return;
                }
                const left = statement.expression.left;
                if (left.type === 'MemberExpression' &&
                    left.object && left.object.type === 'Identifier' && left.object.name === 'module'
                    && left.property && left.property.type === 'Identifier' && left.property.name === 'exports') {
                    inproc = true;
                }
            });
            return inproc;
        }
        catch (err) {
            return false;
        }
    }
    validateHookArguments(hookConstructor) {
        const invalidArguments = [];
        helpers_1.annotate(hookConstructor);
        _.each(hookConstructor.$inject.args, (argument) => {
            try {
                if (argument !== this.hookArgsName) {
                    this.$injector.resolve(argument);
                }
            }
            catch (err) {
                this.$logger.trace(`Cannot resolve ${argument}, reason: ${err}`);
                invalidArguments.push(argument);
            }
        });
        return invalidArguments;
    }
}
HooksService.HOOKS_DIRECTORY_NAME = "hooks";
exports.HooksService = HooksService;
$injector.register("hooksService", HooksService);
