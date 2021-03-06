"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
const path = require("path");
class MessagesService {
    constructor($fs) {
        this.$fs = $fs;
        this._pathsToMessageJsonFiles = null;
        this._messageJsonFilesContentsCache = null;
        this._pathsToMessageJsonFiles = [this.pathToDefaultMessageJson];
    }
    get pathToDefaultMessageJson() {
        return path.join(__dirname, "..", "resources", "messages", "errorMessages.json");
    }
    get messageJsonFilesContents() {
        if (!this._messageJsonFilesContentsCache || !this._messageJsonFilesContentsCache.length) {
            this.refreshMessageJsonContentsCache();
        }
        return this._messageJsonFilesContentsCache;
    }
    get pathsToMessageJsonFiles() {
        if (!this._pathsToMessageJsonFiles) {
            throw new Error("No paths to message json files provided.");
        }
        return this._pathsToMessageJsonFiles;
    }
    set pathsToMessageJsonFiles(pathsToMessageJsonFiles) {
        this._pathsToMessageJsonFiles = pathsToMessageJsonFiles.concat(this.pathToDefaultMessageJson);
        this.refreshMessageJsonContentsCache();
    }
    getMessage(id, ...args) {
        const argsArray = args || [];
        const keys = id.split(".");
        let result = this.getFormatedMessage.apply(this, [id].concat(argsArray));
        _.each(this.messageJsonFilesContents, jsonFileContents => {
            const messageValue = this.getMessageFromJsonRecursive(keys, jsonFileContents, 0);
            if (messageValue) {
                result = this.getFormatedMessage.apply(this, [messageValue].concat(argsArray));
                return false;
            }
        });
        return result;
    }
    getMessageFromJsonRecursive(keys, jsonContents, index) {
        if (index >= keys.length) {
            return null;
        }
        const jsonValue = jsonContents[keys[index]];
        if (!jsonValue) {
            return null;
        }
        if (typeof jsonValue === "string") {
            return jsonValue;
        }
        return this.getMessageFromJsonRecursive(keys, jsonValue, index + 1);
    }
    refreshMessageJsonContentsCache() {
        this._messageJsonFilesContentsCache = [];
        _.each(this.pathsToMessageJsonFiles, path => {
            if (!this.$fs.exists(path)) {
                throw new Error("Message json file " + path + " does not exist.");
            }
            this._messageJsonFilesContentsCache.push(this.$fs.readJson(path));
        });
    }
    getFormatedMessage(message, ...args) {
        return ~message.indexOf("%") ? util.format.apply(null, [message].concat(args || [])) : message;
    }
}
exports.MessagesService = MessagesService;
$injector.register("messagesService", MessagesService);
