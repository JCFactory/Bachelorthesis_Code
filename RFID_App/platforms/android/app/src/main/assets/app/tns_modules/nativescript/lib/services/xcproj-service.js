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
const semver = require("semver");
const helpers = require("../common/helpers");
const os_1 = require("os");
class XcprojService {
    constructor($childProcess, $errors, $logger, $sysInfo, $xcodeSelectService) {
        this.$childProcess = $childProcess;
        this.$errors = $errors;
        this.$logger = $logger;
        this.$sysInfo = $sysInfo;
        this.$xcodeSelectService = $xcodeSelectService;
    }
    verifyXcproj(shouldFail) {
        return __awaiter(this, void 0, void 0, function* () {
            const xcprojInfo = yield this.getXcprojInfo();
            if (xcprojInfo.shouldUseXcproj && !xcprojInfo.xcprojAvailable) {
                const errorMessage = `You are using CocoaPods version ${xcprojInfo.cocoapodVer} which does not support Xcode ${xcprojInfo.xcodeVersion.major}.${xcprojInfo.xcodeVersion.minor} yet.${os_1.EOL}${os_1.EOL}You can update your cocoapods by running $sudo gem install cocoapods from a terminal.${os_1.EOL}${os_1.EOL}In order for the NativeScript CLI to be able to work correctly with this setup you need to install xcproj command line tool and add it to your PATH. Xcproj can be installed with homebrew by running $ brew install xcproj from the terminal`;
                if (shouldFail) {
                    this.$errors.failWithoutHelp(errorMessage);
                }
                else {
                    this.$logger.warn(errorMessage);
                }
                return true;
            }
            return false;
        });
    }
    getXcprojInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.xcprojInfoCache) {
                let cocoapodVer = yield this.$sysInfo.getCocoaPodsVersion();
                const xcodeVersion = yield this.$xcodeSelectService.getXcodeVersion();
                if (cocoapodVer && !semver.valid(cocoapodVer)) {
                    cocoapodVer = _.take(cocoapodVer.split("."), 3).join(".");
                }
                xcodeVersion.patch = xcodeVersion.patch || "0";
                const shouldUseXcproj = cocoapodVer && !!(semver.lt(cocoapodVer, "1.0.0") && ~helpers.versionCompare(xcodeVersion, "7.3.0"));
                let xcprojAvailable;
                if (shouldUseXcproj) {
                    try {
                        yield this.$childProcess.exec("xcproj --version");
                        xcprojAvailable = true;
                    }
                    catch (e) {
                        xcprojAvailable = false;
                    }
                }
                this.xcprojInfoCache = { cocoapodVer, xcodeVersion, shouldUseXcproj, xcprojAvailable };
            }
            return this.xcprojInfoCache;
        });
    }
}
$injector.register("xcprojService", XcprojService);
