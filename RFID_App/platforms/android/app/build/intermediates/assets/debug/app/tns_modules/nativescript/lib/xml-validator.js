"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const constants = require("./constants");
class XmlValidator {
    constructor($fs, $logger) {
        this.$fs = $fs;
        this.$logger = $logger;
    }
    validateXmlFiles(sourceFiles) {
        let xmlHasErrors = false;
        sourceFiles
            .filter(file => _.endsWith(file, constants.XML_FILE_EXTENSION))
            .forEach(file => {
            const errorOutput = this.getXmlFileErrors(file);
            const hasErrors = !!errorOutput;
            xmlHasErrors = xmlHasErrors || hasErrors;
            if (hasErrors) {
                this.$logger.info(`${file} has syntax errors.`.red.bold);
                this.$logger.out(errorOutput.yellow);
            }
        });
        return !xmlHasErrors;
    }
    getXmlFileErrors(sourceFile) {
        let errorOutput = "";
        const fileContents = this.$fs.readText(sourceFile);
        const domErrorHandler = (level, msg) => {
            errorOutput += level + os_1.EOL + msg + os_1.EOL;
        };
        this.getDomParser(domErrorHandler).parseFromString(fileContents, "text/xml");
        return errorOutput || null;
    }
    getDomParser(errorHandler) {
        const DomParser = require("xmldom").DOMParser;
        const parser = new DomParser({
            locator: {},
            errorHandler: errorHandler
        });
        return parser;
    }
}
exports.XmlValidator = XmlValidator;
$injector.register("xmlValidator", XmlValidator);
