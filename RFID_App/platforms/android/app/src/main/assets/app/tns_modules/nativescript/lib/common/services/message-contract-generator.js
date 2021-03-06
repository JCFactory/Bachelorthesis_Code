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
const code_entity_1 = require("../codeGeneration/code-entity");
const code_printer_1 = require("../codeGeneration/code-printer");
class MessageContractGenerator {
    constructor($fs, $messagesService) {
        this.$fs = $fs;
        this.$messagesService = $messagesService;
        this.pendingModels = {};
    }
    generate() {
        return __awaiter(this, void 0, void 0, function* () {
            const interfacesFile = new code_entity_1.Block();
            const implementationsFile = new code_entity_1.Block();
            implementationsFile.writeLine("//");
            implementationsFile.writeLine("// automatically generated code; do not edit manually!");
            implementationsFile.writeLine("//");
            implementationsFile.writeLine("/* tslint:disable:all */");
            implementationsFile.writeLine("");
            interfacesFile.writeLine("//");
            interfacesFile.writeLine("// automatically generated code; do not edit manually!");
            interfacesFile.writeLine("//");
            interfacesFile.writeLine("/* tslint:disable:all */");
            const messagesClass = new code_entity_1.Block("export class Messages implements IMessages");
            const messagesInterface = new code_entity_1.Block("interface IMessages");
            _.each(this.$messagesService.pathsToMessageJsonFiles, jsonFilePath => {
                const jsonContents = this.$fs.readJson(jsonFilePath), implementationBlock = new code_entity_1.Block(), interfaceBlock = new code_entity_1.Block();
                this.generateFileRecursive(jsonContents, "", implementationBlock, 0, { shouldGenerateInterface: false });
                this.generateFileRecursive(jsonContents, "", interfaceBlock, 0, { shouldGenerateInterface: true });
                messagesClass.addBlock(implementationBlock);
                messagesInterface.addBlock(interfaceBlock);
            });
            interfacesFile.addBlock(messagesInterface);
            interfacesFile.writeLine("/* tslint:enable */");
            interfacesFile.writeLine("");
            implementationsFile.addBlock(messagesClass);
            implementationsFile.writeLine("$injector.register('messages', Messages);");
            implementationsFile.writeLine("/* tslint:enable */");
            implementationsFile.writeLine("");
            const codePrinter = new code_printer_1.CodePrinter();
            return {
                interfaceFile: codePrinter.composeBlock(interfacesFile),
                implementationFile: codePrinter.composeBlock(implementationsFile)
            };
        });
    }
    generateFileRecursive(jsonContents, propertyValue, block, depth, options) {
        _.each(jsonContents, (val, key) => {
            let newPropertyValue = propertyValue + key;
            const separator = options.shouldGenerateInterface || depth ? ":" : "=";
            const endingSymbol = options.shouldGenerateInterface || !depth ? ";" : ",";
            if (typeof val === "string") {
                const actualValue = options.shouldGenerateInterface ? "string" : `"${newPropertyValue}"`;
                block.writeLine(`${key}${separator} ${actualValue}${endingSymbol}`);
                newPropertyValue = propertyValue;
                return;
            }
            const newBlock = new code_entity_1.Block(`${key} ${separator} `);
            newBlock.endingCharacter = endingSymbol;
            this.generateFileRecursive(val, newPropertyValue + ".", newBlock, depth + 1, options);
            block.addBlock(newBlock);
        });
    }
}
exports.MessageContractGenerator = MessageContractGenerator;
$injector.register("messageContractGenerator", MessageContractGenerator);
