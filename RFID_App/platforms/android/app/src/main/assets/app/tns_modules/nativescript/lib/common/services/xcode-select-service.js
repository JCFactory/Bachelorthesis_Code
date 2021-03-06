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
const decorators_1 = require("../decorators");
class XcodeSelectService {
    constructor($childProcess, $errors, $hostInfo, $injector) {
        this.$childProcess = $childProcess;
        this.$errors = $errors;
        this.$hostInfo = $hostInfo;
        this.$injector = $injector;
    }
    getDeveloperDirectoryPath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.$hostInfo.isDarwin) {
                this.$errors.failWithoutHelp("xcode-select is only available on Mac OS X.");
            }
            const childProcess = yield this.$childProcess.spawnFromEvent("xcode-select", ["-print-path"], "close", {}, { throwError: false }), result = childProcess.stdout.trim();
            if (!result) {
                this.$errors.failWithoutHelp("Cannot find path to Xcode.app - make sure you've installed Xcode correctly.");
            }
            return result;
        });
    }
    getContentsDirectoryPath() {
        return __awaiter(this, void 0, void 0, function* () {
            return path.join(yield this.getDeveloperDirectoryPath(), "..");
        });
    }
    getXcodeVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const sysInfo = this.$injector.resolve("sysInfo");
            const xcodeVer = yield sysInfo.getXcodeVersion();
            if (!xcodeVer) {
                this.$errors.failWithoutHelp("xcodebuild execution failed. Make sure that you have latest Xcode and tools installed.");
            }
            const xcodeVersionMatch = xcodeVer.match(/Xcode (.*)/), xcodeVersionGroup = xcodeVersionMatch && xcodeVersionMatch[1], xcodeVersionSplit = xcodeVersionGroup && xcodeVersionGroup.split(".");
            return {
                major: xcodeVersionSplit && xcodeVersionSplit[0],
                minor: xcodeVersionSplit && xcodeVersionSplit[1],
                patch: xcodeVersionSplit && xcodeVersionSplit[2]
            };
        });
    }
}
__decorate([
    decorators_1.cache()
], XcodeSelectService.prototype, "getXcodeVersion", null);
exports.XcodeSelectService = XcodeSelectService;
$injector.register("xcodeSelectService", XcodeSelectService);
