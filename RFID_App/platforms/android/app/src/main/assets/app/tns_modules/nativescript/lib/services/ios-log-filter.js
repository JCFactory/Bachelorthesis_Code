"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const sourcemap = require("source-map");
const path = require("path");
const decorators_1 = require("../common/decorators");
class IOSLogFilter {
    constructor($logger, $loggingLevels, $fs, $projectData) {
        this.$logger = $logger;
        this.$loggingLevels = $loggingLevels;
        this.$fs = $fs;
        this.$projectData = $projectData;
        this.appOutputRegex = /([^\s\(\)]+)(?:\([^\s]+\))?\[[0-9]+\]/;
        this.infoFilterRegex = new RegExp(`^.*(?:<Notice>:|<Error>:|<Warning>:|\\(NativeScript\\)|${this.appOutputRegex.source}:){1}`);
        this.filterActive = true;
        this.partialLine = null;
    }
    filterData(data, loggingOptions = {}) {
        const specifiedLogLevel = (loggingOptions.logLevel || '').toUpperCase();
        this.$logger.trace("Logging options", loggingOptions);
        if (specifiedLogLevel !== this.$loggingLevels.info || !data) {
            return data;
        }
        const chunkLines = data.split('\n');
        const skipLastLine = chunkLines.length > 0 ? data[data.length - 1] !== "\n" : false;
        let output = "";
        for (let i = 0; i < chunkLines.length; i++) {
            let currentLine = chunkLines[i];
            if (this.partialLine) {
                currentLine = this.partialLine + currentLine;
                this.partialLine = undefined;
            }
            if (i === chunkLines.length - 1 && skipLastLine) {
                this.partialLine = currentLine;
                break;
            }
            if (this.preFilter(data, currentLine)) {
                continue;
            }
            const matchResult = this.appOutputRegex.exec(currentLine);
            if (matchResult && matchResult.length > 1) {
                const projectName = loggingOptions && loggingOptions.projectName;
                this.filterActive = matchResult[1] !== projectName;
            }
            if (this.filterActive) {
                continue;
            }
            const filteredLineInfo = currentLine.match(this.infoFilterRegex);
            if (filteredLineInfo && filteredLineInfo.length > 0) {
                currentLine = currentLine.replace(filteredLineInfo[0], "");
            }
            currentLine = currentLine.trim();
            output += this.getOriginalFileLocation(currentLine) + '\n';
        }
        return output.length === 0 ? null : output;
    }
    preFilter(data, currentLine) {
        return currentLine.length < 1 ||
            currentLine.indexOf("SecTaskCopyDebugDescription") !== -1 ||
            currentLine.indexOf("NativeScript loaded bundle") !== -1 ||
            (currentLine.indexOf("assertion failed:") !== -1 && data.indexOf("libxpc.dylib") !== -1);
    }
    getOriginalFileLocation(data) {
        const fileString = "file:///";
        const fileIndex = data.indexOf(fileString);
        const projectDir = this.getProjectDir();
        if (fileIndex >= 0 && projectDir) {
            const parts = data.substring(fileIndex + fileString.length).split(":");
            if (parts.length >= 4) {
                const file = parts[0];
                const sourceMapFile = path.join(projectDir, file + ".map");
                const row = parseInt(parts[1]);
                const column = parseInt(parts[2]);
                if (this.$fs.exists(sourceMapFile)) {
                    const sourceMap = this.$fs.readText(sourceMapFile);
                    const smc = new sourcemap.SourceMapConsumer(sourceMap);
                    const originalPosition = smc.originalPositionFor({ line: row, column: column });
                    const sourceFile = smc.sources.length > 0 ? file.replace(smc.file, smc.sources[0]) : file;
                    data = data.substring(0, fileIndex + fileString.length)
                        + sourceFile + ":"
                        + originalPosition.line + ":"
                        + originalPosition.column;
                    for (let i = 3; i < parts.length; i++) {
                        data += ":" + parts[i];
                    }
                }
            }
        }
        return data;
    }
    getProjectDir() {
        try {
            this.$projectData.initializeProjectData();
            return this.$projectData.projectDir;
        }
        catch (err) {
            return null;
        }
    }
}
__decorate([
    decorators_1.cache()
], IOSLogFilter.prototype, "getProjectDir", null);
exports.IOSLogFilter = IOSLogFilter;
$injector.register("iOSLogFilter", IOSLogFilter);
