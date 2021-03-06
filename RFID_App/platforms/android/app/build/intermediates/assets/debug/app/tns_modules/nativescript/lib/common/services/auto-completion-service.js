"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const osenv = require("osenv");
const path = require("path");
const util = require("util");
const decorators_1 = require("../decorators");
class AutoCompletionService {
    constructor($fs, $childProcess, $logger, $staticConfig, $hostInfo) {
        this.$fs = $fs;
        this.$childProcess = $childProcess;
        this.$logger = $logger;
        this.$staticConfig = $staticConfig;
        this.$hostInfo = $hostInfo;
        this.scriptsOk = true;
        this.scriptsUpdated = false;
        this.disableAnalytics = true;
    }
    get shellProfiles() {
        return [
            this.getHomePath(".bashrc"),
            this.getHomePath(".zshrc")
        ];
    }
    get cliRunCommandsFile() {
        let cliRunCommandsFile = this.getHomePath(util.format(".%src", this.$staticConfig.CLIENT_NAME.toLowerCase()));
        if (this.$hostInfo.isWindows) {
            cliRunCommandsFile = cliRunCommandsFile.replace(/\\/g, "/");
        }
        return cliRunCommandsFile;
    }
    getTabTabObsoleteRegex(clientName) {
        const tabTabStartPoint = util.format(AutoCompletionService.TABTAB_COMPLETION_START_REGEX_PATTERN, clientName.toLowerCase());
        const tabTabEndPoint = util.format(AutoCompletionService.TABTAB_COMPLETION_END_REGEX_PATTERN, clientName.toLowerCase());
        const tabTabRegex = new RegExp(util.format("%s[\\s\\S]*%s", tabTabStartPoint, tabTabEndPoint));
        return tabTabRegex;
    }
    removeObsoleteAutoCompletion() {
        const shellProfilesToBeCleared = this.shellProfiles;
        shellProfilesToBeCleared.push(this.getHomePath(".profile"));
        shellProfilesToBeCleared.forEach(file => {
            try {
                const text = this.$fs.readText(file);
                let newText = text.replace(this.getTabTabObsoleteRegex(this.$staticConfig.CLIENT_NAME), "");
                if (this.$staticConfig.CLIENT_NAME_ALIAS) {
                    newText = newText.replace(this.getTabTabObsoleteRegex(this.$staticConfig.CLIENT_NAME_ALIAS), "");
                }
                if (newText !== text) {
                    this.$logger.trace("Remove obsolete AutoCompletion from file %s.", file);
                    this.$fs.writeFile(file, newText);
                }
            }
            catch (error) {
                if (error.code !== "ENOENT") {
                    this.$logger.trace("Error while trying to disable autocompletion for '%s' file. Error is:\n%s", error.toString());
                }
            }
        });
    }
    get completionShellScriptContent() {
        const startText = util.format(AutoCompletionService.COMPLETION_START_COMMENT_PATTERN, this.$staticConfig.CLIENT_NAME.toLowerCase());
        const content = util.format("if [ -f %s ]; then \n    source %s \nfi", this.cliRunCommandsFile, this.cliRunCommandsFile);
        const endText = util.format(AutoCompletionService.COMPLETION_END_COMMENT_PATTERN, this.$staticConfig.CLIENT_NAME.toLowerCase());
        return util.format("\n%s\n%s\n%s\n", startText, content, endText);
    }
    isAutoCompletionEnabled() {
        let result = true;
        _.each(this.shellProfiles, filePath => {
            result = this.isNewAutoCompletionEnabledInFile(filePath) || this.isObsoleteAutoCompletionEnabledInFile(filePath);
            if (!result) {
                return false;
            }
        });
        return result;
    }
    disableAutoCompletion() {
        _.each(this.shellProfiles, shellFile => this.removeAutoCompletionFromShellScript(shellFile));
        this.removeObsoleteAutoCompletion();
        if (this.scriptsOk && this.scriptsUpdated) {
            this.$logger.out("Restart your shell to disable command auto-completion.");
        }
    }
    enableAutoCompletion() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateCLIShellScript();
            _.each(this.shellProfiles, shellFile => this.addAutoCompletionToShellScript(shellFile));
            this.removeObsoleteAutoCompletion();
            if (this.scriptsOk && this.scriptsUpdated) {
                this.$logger.out("Restart your shell to enable command auto-completion.");
            }
        });
    }
    isObsoleteAutoCompletionEnabled() {
        let result = true;
        _.each(this.shellProfiles, shellProfile => {
            result = this.isObsoleteAutoCompletionEnabledInFile(shellProfile);
            if (!result) {
                return false;
            }
        });
        return result;
    }
    isNewAutoCompletionEnabledInFile(fileName) {
        try {
            const data = this.$fs.readText(fileName);
            if (data && data.indexOf(this.completionShellScriptContent) !== -1) {
                return true;
            }
        }
        catch (err) {
            this.$logger.trace("Error while checking is autocompletion enabled in file %s. Error is: '%s'", fileName, err.toString());
        }
        return false;
    }
    isObsoleteAutoCompletionEnabledInFile(fileName) {
        try {
            const text = this.$fs.readText(fileName);
            return !!(text.match(this.getTabTabObsoleteRegex(this.$staticConfig.CLIENT_NAME)) || text.match(this.getTabTabObsoleteRegex(this.$staticConfig.CLIENT_NAME)));
        }
        catch (err) {
            this.$logger.trace("Error while checking is obsolete autocompletion enabled in file %s. Error is: '%s'", fileName, err.toString());
        }
    }
    addAutoCompletionToShellScript(fileName) {
        try {
            if (!this.isNewAutoCompletionEnabledInFile(fileName) || this.isObsoleteAutoCompletionEnabledInFile(fileName)) {
                this.$logger.trace("AutoCompletion is not enabled in %s file. Trying to enable it.", fileName);
                this.$fs.appendFile(fileName, this.completionShellScriptContent);
                this.scriptsUpdated = true;
            }
        }
        catch (err) {
            this.$logger.out("Unable to update %s. Command-line completion might not work.", fileName);
            if ((err.code === "EPERM" || err.code === "EACCES") && !this.$hostInfo.isWindows && process.env.SUDO_USER) {
                this.$logger.out("To enable command-line completion, run '$ %s autocomplete enable'.", this.$staticConfig.CLIENT_NAME);
            }
            this.$logger.trace(err);
            this.scriptsOk = false;
        }
    }
    removeAutoCompletionFromShellScript(fileName) {
        try {
            if (this.isNewAutoCompletionEnabledInFile(fileName)) {
                this.$logger.trace("AutoCompletion is enabled in %s file. Trying to disable it.", fileName);
                let data = this.$fs.readText(fileName);
                data = data.replace(this.completionShellScriptContent, "");
                this.$fs.writeFile(fileName, data);
                this.scriptsUpdated = true;
            }
        }
        catch (err) {
            if (err.code !== "ENOENT") {
                this.$logger.out("Failed to update %s. Auto-completion may still work or work incorrectly. ", fileName);
                this.$logger.out(err);
                this.scriptsOk = false;
            }
        }
    }
    updateCLIShellScript() {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = this.cliRunCommandsFile;
            try {
                let doUpdate = true;
                if (this.$fs.exists(filePath)) {
                    const contents = this.$fs.readText(filePath);
                    const regExp = new RegExp(util.format("%s\\s+completion\\s+--\\s+", this.$staticConfig.CLIENT_NAME.toLowerCase()));
                    let matchCondition = contents.match(regExp);
                    if (this.$staticConfig.CLIENT_NAME_ALIAS) {
                        matchCondition = matchCondition || contents.match(new RegExp(util.format("%s\\s+completion\\s+--\\s+", this.$staticConfig.CLIENT_NAME_ALIAS.toLowerCase())));
                    }
                    if (matchCondition) {
                        doUpdate = false;
                    }
                }
                if (doUpdate) {
                    const clientExecutableFileName = (this.$staticConfig.CLIENT_NAME_ALIAS || this.$staticConfig.CLIENT_NAME).toLowerCase();
                    const pathToExecutableFile = path.join(__dirname, `../../../bin/${clientExecutableFileName}.js`);
                    yield this.$childProcess.exec(`"${process.argv[0]}" "${pathToExecutableFile}" completion >> "${filePath}"`);
                    this.$fs.chmod(filePath, "0644");
                }
            }
            catch (err) {
                this.$logger.out("Failed to update %s. Auto-completion may not work. ", filePath);
                this.$logger.trace(err);
                this.scriptsOk = false;
            }
        });
    }
    getHomePath(fileName) {
        return path.join(osenv.home(), fileName);
    }
}
AutoCompletionService.COMPLETION_START_COMMENT_PATTERN = "###-%s-completion-start-###";
AutoCompletionService.COMPLETION_END_COMMENT_PATTERN = "###-%s-completion-end-###";
AutoCompletionService.TABTAB_COMPLETION_START_REGEX_PATTERN = "###-begin-%s-completion-###";
AutoCompletionService.TABTAB_COMPLETION_END_REGEX_PATTERN = "###-end-%s-completion-###";
__decorate([
    decorators_1.cache()
], AutoCompletionService.prototype, "shellProfiles", null);
__decorate([
    decorators_1.cache()
], AutoCompletionService.prototype, "cliRunCommandsFile", null);
__decorate([
    decorators_1.cache()
], AutoCompletionService.prototype, "completionShellScriptContent", null);
exports.AutoCompletionService = AutoCompletionService;
$injector.register("autoCompletionService", AutoCompletionService);
