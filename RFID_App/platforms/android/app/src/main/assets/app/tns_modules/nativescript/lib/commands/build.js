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
class BuildCommandBase {
    constructor($options, $errors, $projectData, $platformsData, $devicePlatformsConstants, $platformService, $bundleValidatorHelper) {
        this.$options = $options;
        this.$errors = $errors;
        this.$projectData = $projectData;
        this.$platformsData = $platformsData;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.$platformService = $platformService;
        this.$bundleValidatorHelper = $bundleValidatorHelper;
        this.$projectData.initializeProjectData();
    }
    executeCore(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const platform = args[0].toLowerCase();
            const appFilesUpdaterOptions = { bundle: !!this.$options.bundle, release: this.$options.release };
            const platformInfo = {
                platform,
                appFilesUpdaterOptions,
                skipModulesNativeCheck: !this.$options.syncAllFiles,
                platformTemplate: this.$options.platformTemplate,
                projectData: this.$projectData,
                config: this.$options,
                env: this.$options.env
            };
            yield this.$platformService.preparePlatform(platformInfo);
            const buildConfig = {
                buildForDevice: this.$options.forDevice,
                projectDir: this.$options.path,
                clean: this.$options.clean,
                teamId: this.$options.teamId,
                device: this.$options.device,
                provision: this.$options.provision,
                release: this.$options.release,
                keyStoreAlias: this.$options.keyStoreAlias,
                keyStorePath: this.$options.keyStorePath,
                keyStoreAliasPassword: this.$options.keyStoreAliasPassword,
                keyStorePassword: this.$options.keyStorePassword
            };
            yield this.$platformService.buildPlatform(platform, buildConfig, this.$projectData);
            if (this.$options.copyTo) {
                this.$platformService.copyLastOutput(platform, this.$options.copyTo, buildConfig, this.$projectData);
            }
        });
    }
    validatePlatform(platform) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.$platformService.isPlatformSupportedForOS(platform, this.$projectData)) {
                this.$errors.fail(`Applications for platform ${platform} can not be built on this OS`);
            }
            this.$bundleValidatorHelper.validate();
            const platformData = this.$platformsData.getPlatformData(platform, this.$projectData);
            const platformProjectService = platformData.platformProjectService;
            yield platformProjectService.validate(this.$projectData);
        });
    }
}
exports.BuildCommandBase = BuildCommandBase;
class BuildIosCommand extends BuildCommandBase {
    constructor($options, $errors, $projectData, $platformsData, $devicePlatformsConstants, $platformService, $bundleValidatorHelper) {
        super($options, $errors, $projectData, $platformsData, $devicePlatformsConstants, $platformService, $bundleValidatorHelper);
        this.$options = $options;
        this.allowedParameters = [];
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeCore([this.$platformsData.availablePlatforms.iOS]);
        });
    }
    canExecute(args) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            yield _super("validatePlatform").call(this, this.$devicePlatformsConstants.iOS);
            return args.length === 0 && this.$platformService.validateOptions(this.$options.provision, this.$options.teamId, this.$projectData, this.$platformsData.availablePlatforms.iOS);
        });
    }
}
exports.BuildIosCommand = BuildIosCommand;
$injector.registerCommand("build|ios", BuildIosCommand);
class BuildAndroidCommand extends BuildCommandBase {
    constructor($options, $errors, $projectData, $platformsData, $devicePlatformsConstants, $platformService, $bundleValidatorHelper) {
        super($options, $errors, $projectData, $platformsData, $devicePlatformsConstants, $platformService, $bundleValidatorHelper);
        this.$options = $options;
        this.$errors = $errors;
        this.allowedParameters = [];
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executeCore([this.$platformsData.availablePlatforms.Android]);
        });
    }
    canExecute(args) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            yield _super("validatePlatform").call(this, this.$devicePlatformsConstants.Android);
            if (this.$options.release && (!this.$options.keyStorePath || !this.$options.keyStorePassword || !this.$options.keyStoreAlias || !this.$options.keyStoreAliasPassword)) {
                this.$errors.fail(constants_1.ANDROID_RELEASE_BUILD_ERROR_MESSAGE);
            }
            return args.length === 0 && (yield this.$platformService.validateOptions(this.$options.provision, this.$options.teamId, this.$projectData, this.$platformsData.availablePlatforms.Android));
        });
    }
}
exports.BuildAndroidCommand = BuildAndroidCommand;
$injector.registerCommand("build|android", BuildAndroidCommand);
