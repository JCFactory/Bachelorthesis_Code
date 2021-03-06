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
const os_1 = require("os");
const marked = require("marked");
class HelpService {
    constructor($logger, $injector, $errors, $fs, $staticConfig, $extensibilityService, $microTemplateService, $opener) {
        this.$logger = $logger;
        this.$injector = $injector;
        this.$errors = $errors;
        this.$fs = $fs;
        this.$staticConfig = $staticConfig;
        this.$extensibilityService = $extensibilityService;
        this.$microTemplateService = $microTemplateService;
        this.$opener = $opener;
        this.pathToImages = this.$staticConfig.HTML_CLI_HELPERS_DIR;
        this.pathToHtmlPages = this.$staticConfig.HTML_PAGES_DIR;
        this.pathToManPages = this.$staticConfig.MAN_PAGES_DIR;
    }
    get newLineRegex() {
        return /\r?\n/g;
    }
    get pathToStylesCss() {
        return path.join(this.$staticConfig.HTML_COMMON_HELPERS_DIR, "styles.css");
    }
    get pathToBasicPage() {
        return path.join(this.$staticConfig.HTML_COMMON_HELPERS_DIR, "basic-page.html");
    }
    get pathToBasicPageForExtensions() {
        return path.join(this.$staticConfig.HTML_COMMON_HELPERS_DIR, "basic-extensions-page.html");
    }
    get pathToIndexHtml() {
        return path.join(this.$staticConfig.HTML_PAGES_DIR, "index.html");
    }
    openHelpForCommandInBrowser(commandData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { commandName } = commandData;
            const htmlPage = (yield this.convertCommandNameToFileName(commandData)) + HelpService.HTML_FILE_EXTENSION;
            this.$logger.trace("Opening help for command '%s'. FileName is '%s'.", commandName, htmlPage);
            this.$fs.ensureDirectoryExists(this.pathToHtmlPages);
            if (!this.tryOpeningSelectedPage(htmlPage)) {
                this.$logger.trace("Required HTML file '%s' is missing. Let's try generating HTML files and see if we'll find it.", htmlPage);
                yield this.generateHtmlPages();
                if (!this.tryOpeningSelectedPage(htmlPage)) {
                    this.$errors.failWithoutHelp("Unable to find help for '%s'", commandName);
                }
            }
        });
    }
    generateHtmlPages() {
        return __awaiter(this, void 0, void 0, function* () {
            const mdFiles = this.$fs.enumerateFilesInDirectorySync(this.pathToManPages);
            const basicHtmlPage = this.$fs.readText(this.pathToBasicPage);
            yield Promise.all(_.map(mdFiles, markdownFile => {
                const htmlPageGenerationData = {
                    basicHtmlPage,
                    pathToMdFile: markdownFile,
                    pathToMdPages: this.pathToManPages,
                    pathToHtmlPages: this.pathToHtmlPages
                };
                return this.createHtmlPage(htmlPageGenerationData);
            }));
            const installedExtensionsData = this.$extensibilityService.getInstalledExtensionsData();
            const basicHtmlPageForExtensions = this.$fs.readText(this.pathToBasicPageForExtensions);
            for (const extensionData of installedExtensionsData) {
                const docsDir = extensionData.docs;
                if (docsDir) {
                    this.$logger.trace(`Start generation of html help content for extension ${extensionData.extensionName}`);
                    if (!this.$fs.exists(docsDir)) {
                        this.$logger.warn(`Unable to generate html help pages for extension ${extensionData.extensionName} as the docs directory ${docsDir} does not exist.`);
                        continue;
                    }
                    const htmlDirFullPath = HelpService.getHtmlDirFullPath(docsDir);
                    this.$fs.ensureDirectoryExists(htmlDirFullPath);
                    const extensionMdFiles = this.$fs.enumerateFilesInDirectorySync(docsDir);
                    try {
                        yield Promise.all(_.map(extensionMdFiles, markdownFile => {
                            const htmlPageGenerationData = {
                                basicHtmlPage: basicHtmlPageForExtensions,
                                pathToMdFile: markdownFile,
                                pathToMdPages: docsDir,
                                pathToHtmlPages: htmlDirFullPath,
                                extensionName: extensionData.extensionName
                            };
                            return this.createHtmlPage(htmlPageGenerationData);
                        }));
                    }
                    catch (err) {
                        this.$logger.warn(`Unable to generate html help for extension ${extensionData.extensionName}. Error is: ${err.message}`);
                    }
                    this.$logger.trace(`Finished generation of html help content for extension ${extensionData.extensionName}`);
                }
            }
            this.$logger.trace("Finished generating HTML files.");
        });
    }
    showCommandLineHelp(commandData) {
        return __awaiter(this, void 0, void 0, function* () {
            const help = yield this.getCommandLineHelpForCommand(commandData);
            if (this.$staticConfig.FULL_CLIENT_NAME) {
                this.$logger.info(this.$staticConfig.FULL_CLIENT_NAME.green.bold + os_1.EOL);
            }
            this.$logger.printMarkdown(help);
        });
    }
    getCommandLineHelpForCommand(commandData) {
        return __awaiter(this, void 0, void 0, function* () {
            const helpText = yield this.readMdFileForCommand(commandData);
            const commandLineHelp = (yield this.$microTemplateService.parseContent(helpText, { isHtml: false }))
                .replace(/&nbsp;/g, " ")
                .replace(HelpService.MARKDOWN_LINK_REGEX, "$1")
                .replace(HelpService.SPAN_REGEX, (matchingSubstring, textBeforeSpan, textInsideSpan, index, fullString) => {
                return textBeforeSpan + textInsideSpan.replace(this.newLineRegex, "");
            })
                .replace(HelpService.NEW_LINE_REGEX, os_1.EOL);
            return commandLineHelp;
        });
    }
    createHtmlPage(htmlPageGenerationData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { basicHtmlPage, pathToMdFile, pathToMdPages, pathToHtmlPages, extensionName } = htmlPageGenerationData;
            const mdFileName = path.basename(pathToMdFile);
            const htmlFileName = mdFileName.replace(HelpService.MARKDOWN_FILE_EXTENSION, HelpService.HTML_FILE_EXTENSION);
            this.$logger.trace("Generating '%s' help topic.", htmlFileName);
            const helpText = this.$fs.readText(pathToMdFile);
            const outputText = yield this.$microTemplateService.parseContent(helpText, { isHtml: true });
            const htmlText = marked(outputText);
            const filePath = pathToMdFile
                .replace(path.basename(pathToMdPages), path.basename(pathToHtmlPages))
                .replace(mdFileName, htmlFileName);
            this.$logger.trace("HTML file path for '%s' man page is: '%s'.", mdFileName, filePath);
            let outputHtml = basicHtmlPage
                .replace(HelpService.MAN_PAGE_NAME_REGEX, mdFileName.replace(HelpService.MARKDOWN_FILE_EXTENSION, ""))
                .replace(HelpService.HTML_COMMAND_HELP_REGEX, htmlText)
                .replace(HelpService.RELATIVE_PATH_TO_STYLES_CSS_REGEX, path.relative(path.dirname(filePath), this.pathToStylesCss))
                .replace(HelpService.RELATIVE_PATH_TO_IMAGES_REGEX, path.relative(path.dirname(filePath), this.pathToImages))
                .replace(HelpService.RELATIVE_PATH_TO_INDEX_REGEX, path.relative(path.dirname(filePath), this.pathToIndexHtml));
            if (extensionName) {
                outputHtml = outputHtml.replace(HelpService.EXTENSION_NAME_REGEX, extensionName);
            }
            this.$fs.writeFile(filePath, outputHtml);
            this.$logger.trace("Finished writing file '%s'.", filePath);
        });
    }
    convertCommandNameToFileName(commandData) {
        return __awaiter(this, void 0, void 0, function* () {
            let { commandName } = commandData;
            const defaultCommandMatch = commandName && commandName.match(/(\w+?)\|\*/);
            if (defaultCommandMatch) {
                this.$logger.trace("Default command found. Replace current command name '%s' with '%s'.", commandName, defaultCommandMatch[1]);
                commandName = defaultCommandMatch[1];
            }
            const availableCommands = this.$injector.getRegisteredCommandsNames(true).sort();
            this.$logger.trace("List of registered commands: %s", availableCommands.join(", "));
            if (commandName && !_.includes(availableCommands, commandName)) {
                yield this.throwMissingCommandError(commandData);
            }
            return (commandName && commandName.replace(/\|/g, "-")) || "index";
        });
    }
    throwMissingCommandError(commandData) {
        return __awaiter(this, void 0, void 0, function* () {
            const commandName = commandData.commandName;
            const commandInfo = {
                inputStrings: [commandName, ...commandData.commandArguments],
                commandDelimiter: "|",
                defaultCommandDelimiter: "|*"
            };
            const extensionData = yield this.$extensibilityService.getExtensionNameWhereCommandIsRegistered(commandInfo);
            if (extensionData) {
                this.$errors.failWithoutHelp(extensionData.installationMessage);
            }
            this.$errors.failWithoutHelp("Unknown command '%s'. Try '$ %s help' for a full list of supported commands.", commandName, this.$staticConfig.CLIENT_NAME.toLowerCase());
        });
    }
    static getHtmlDirFullPath(docsDir) {
        return path.join(path.dirname(docsDir), "html");
    }
    getHelpFile(searchedFileName, dirToCheck, getFullPathAction) {
        const fileList = this.$fs.enumerateFilesInDirectorySync(dirToCheck);
        let fileToOpen = _.find(fileList, file => path.basename(file) === searchedFileName);
        if (!fileToOpen) {
            fileToOpen = this.getHelpFileFromExtensions(searchedFileName, getFullPathAction);
        }
        return fileToOpen;
    }
    getHelpFileFromExtensions(searchedFileName, getFullPathAction) {
        const installedExtensionsData = this.$extensibilityService.getInstalledExtensionsData();
        for (const extensionData of installedExtensionsData) {
            const docsDir = extensionData.docs;
            if (docsDir) {
                const fullPath = getFullPathAction ? getFullPathAction(docsDir) : docsDir;
                const fileToOpen = this.$fs.exists(fullPath) && _.find(this.$fs.enumerateFilesInDirectorySync(fullPath), file => path.basename(file) === searchedFileName);
                if (fileToOpen) {
                    return fileToOpen;
                }
            }
        }
    }
    tryOpeningSelectedPage(htmlPage) {
        const pageToOpen = this.getHelpFile(htmlPage, this.pathToHtmlPages, HelpService.getHtmlDirFullPath);
        if (pageToOpen) {
            this.$logger.trace("Found page to open: '%s'", pageToOpen);
            this.$opener.open(pageToOpen);
            return true;
        }
        this.$logger.trace("Unable to find file: '%s'", htmlPage);
        return false;
    }
    readMdFileForCommand(commandData) {
        return __awaiter(this, void 0, void 0, function* () {
            const mdFileName = (yield this.convertCommandNameToFileName(commandData)) + HelpService.MARKDOWN_FILE_EXTENSION;
            this.$logger.trace("Reading help for command '%s'. FileName is '%s'.", commandData.commandName, mdFileName);
            const markdownFile = this.getHelpFile(mdFileName, this.pathToManPages);
            if (markdownFile) {
                return this.$fs.readText(markdownFile);
            }
            yield this.throwMissingCommandError(commandData);
        });
    }
}
HelpService.MARKDOWN_FILE_EXTENSION = ".md";
HelpService.HTML_FILE_EXTENSION = ".html";
HelpService.MAN_PAGE_NAME_REGEX = /@MAN_PAGE_NAME@/g;
HelpService.HTML_COMMAND_HELP_REGEX = /@HTML_COMMAND_HELP@/g;
HelpService.RELATIVE_PATH_TO_STYLES_CSS_REGEX = /@RELATIVE_PATH_TO_STYLES_CSS@/g;
HelpService.RELATIVE_PATH_TO_IMAGES_REGEX = /@RELATIVE_PATH_TO_IMAGES@/g;
HelpService.RELATIVE_PATH_TO_INDEX_REGEX = /@RELATIVE_PATH_TO_INDEX@/g;
HelpService.EXTENSION_NAME_REGEX = /@EXTENSION_NAME@/g;
HelpService.MARKDOWN_LINK_REGEX = /\[([\w \-\`\<\>\*\:\\]+?)\]\([\s\S]+?\)/g;
HelpService.SPAN_REGEX = /([\s\S]*?)(?:\r?\n)?<span.*?>([\s\S]*?)<\/span>(?:\r?\n)*/g;
HelpService.NEW_LINE_REGEX = /<\/?\s*?br\s*?\/?>/g;
exports.HelpService = HelpService;
$injector.register("helpService", HelpService);
