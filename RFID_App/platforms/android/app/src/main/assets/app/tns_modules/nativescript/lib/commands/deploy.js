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
const constants_1 = require("../constants");
class DeployOnDeviceCommand {
    constructor($platformService, $platformCommandParameter, $options, $projectData, $deployCommandHelper, $errors, $mobileHelper, $platformsData, $bundleValidatorHelper) {
        this.$platformService = $platformService;
        this.$platformCommandParameter = $platformCommandParameter;
        this.$options = $options;
        this.$projectData = $projectData;
        this.$deployCommandHelper = $deployCommandHelper;
        this.$errors = $errors;
        this.$mobileHelper = $mobileHelper;
        this.$platformsData = $platformsData;
        this.$bundleValidatorHelper = $bundleValidatorHelper;
        this.allowedParameters = [];
        this.$projectData.initializeProjectData();
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const deployPlatformInfo = this.$deployCommandHelper.getDeployPlatformInfo(args[0]);
            return this.$platformService.deployPlatform(deployPlatformInfo);
        });
    }
    canExecute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$bundleValidatorHelper.validate();
            if (!args || !args.length || args.length > 1) {
                return false;
            }
            if (!(yield this.$platformCommandParameter.validate(args[0]))) {
                return false;
            }
            if (this.$mobileHelper.isAndroidPlatform(args[0]) && this.$options.release && (!this.$options.keyStorePath || !this.$options.keyStorePassword || !this.$options.keyStoreAlias || !this.$options.keyStoreAliasPassword)) {
                this.$errors.fail(constants_1.ANDROID_RELEASE_BUILD_ERROR_MESSAGE);
            }
            const platformData = this.$platformsData.getPlatformData(args[0], this.$projectData);
            const platformProjectService = platformData.platformProjectService;
            yield platformProjectService.validate(this.$projectData);
            return this.$platformService.validateOptions(this.$options.provision, this.$options.teamId, this.$projectData, args[0]);
        });
    }
}
exports.DeployOnDeviceCommand = DeployOnDeviceCommand;
$injector.registerCommand("deploy", DeployOnDeviceCommand);
