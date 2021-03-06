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
const path = require("path");
const util_1 = require("util");
const nativescript_doctor_1 = require("nativescript-doctor");
const constants_1 = require("./constants");
const verify_node_version_1 = require("./common/verify-node-version");
const decorators_1 = require("./common/decorators");
class SysInfo {
    constructor($fs, $hostInfo) {
        this.$fs = $fs;
        this.$hostInfo = $hostInfo;
        this.sysInfo = null;
    }
    getSysInfo(config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sysInfo) {
                const pathToNativeScriptCliPackageJson = (config && config.pathToNativeScriptCliPackageJson) || path.join(__dirname, "..", "package.json");
                const androidToolsInfo = config && config.androidToolsInfo;
                this.sysInfo = yield nativescript_doctor_1.sysInfo.getSysInfo({ pathToNativeScriptCliPackageJson, androidToolsInfo });
            }
            return this.sysInfo;
        });
    }
    getXcodeVersion() {
        return nativescript_doctor_1.sysInfo.getXcodeVersion();
    }
    getCocoaPodsVersion() {
        return nativescript_doctor_1.sysInfo.getCocoaPodsVersion();
    }
    getJavaCompilerVersion() {
        return nativescript_doctor_1.sysInfo.getJavaCompilerVersion();
    }
    getSystemWarnings() {
        return __awaiter(this, void 0, void 0, function* () {
            const warnings = [];
            const macOSWarningMessage = yield this.getMacOSWarningMessage();
            if (macOSWarningMessage) {
                warnings.push(macOSWarningMessage);
            }
            const nodeWarning = verify_node_version_1.getNodeWarning();
            if (nodeWarning) {
                warnings.push(nodeWarning);
            }
            return warnings;
        });
    }
    getSupportedNodeVersionRange() {
        const pathToCLIPackageJson = path.join(__dirname, "..", "package.json");
        const jsonContent = this.$fs.readJson(pathToCLIPackageJson);
        return jsonContent && jsonContent.engines && jsonContent.engines.node;
    }
    getMacOSWarningMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const macOSVersion = yield this.$hostInfo.getMacOSVersion();
            if (macOSVersion && macOSVersion < constants_1.MacOSVersions.HighSierra) {
                return util_1.format(constants_1.MacOSDeprecationStringFormat, macOSVersion);
            }
            return null;
        });
    }
}
__decorate([
    decorators_1.exported("sysInfo")
], SysInfo.prototype, "getSystemWarnings", null);
__decorate([
    decorators_1.exported("sysInfo")
], SysInfo.prototype, "getSupportedNodeVersionRange", null);
exports.SysInfo = SysInfo;
$injector.register("sysInfo", SysInfo);
