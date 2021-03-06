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
const constants = require("../constants");
const semver = require("semver");
class NativeScriptCloudExtensionService {
    constructor($extensibilityService, $logger, $npmInstallationManager) {
        this.$extensibilityService = $extensibilityService;
        this.$logger = $logger;
        this.$npmInstallationManager = $npmInstallationManager;
    }
    install() {
        if (!this.isInstalled()) {
            return this.$extensibilityService.installExtension(constants.NATIVESCRIPT_CLOUD_EXTENSION_NAME);
        }
        this.$logger.out(`Extension ${constants.NATIVESCRIPT_CLOUD_EXTENSION_NAME} is already installed.`);
    }
    isInstalled() {
        return !!this.getExtensionData();
    }
    isLatestVersionInstalled() {
        return __awaiter(this, void 0, void 0, function* () {
            const extensionData = this.getExtensionData();
            if (extensionData) {
                const latestVersion = yield this.$npmInstallationManager.getLatestVersion(constants.NATIVESCRIPT_CLOUD_EXTENSION_NAME);
                return semver.eq(latestVersion, extensionData.version);
            }
            return false;
        });
    }
    getExtensionData() {
        return _.find(this.$extensibilityService.getInstalledExtensionsData(), extensionData => extensionData.extensionName === constants.NATIVESCRIPT_CLOUD_EXTENSION_NAME);
    }
}
exports.NativeScriptCloudExtensionService = NativeScriptCloudExtensionService;
$injector.register("nativeScriptCloudExtensionService", NativeScriptCloudExtensionService);
