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
const command_params_1 = require("../common/command-params");
const path = require("path");
class PublishIOS {
    constructor($errors, $injector, $itmsTransporterService, $logger, $projectData, $options, $prompter, $devicePlatformsConstants) {
        this.$errors = $errors;
        this.$injector = $injector;
        this.$itmsTransporterService = $itmsTransporterService;
        this.$logger = $logger;
        this.$projectData = $projectData;
        this.$options = $options;
        this.$prompter = $prompter;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.allowedParameters = [new command_params_1.StringCommandParameter(this.$injector), new command_params_1.StringCommandParameter(this.$injector),
            new command_params_1.StringCommandParameter(this.$injector), new command_params_1.StringCommandParameter(this.$injector)];
        this.$projectData.initializeProjectData();
    }
    get $platformsData() {
        return this.$injector.resolve("platformsData");
    }
    get $platformService() {
        return this.$injector.resolve("platformService");
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let username = args[0];
            let password = args[1];
            const mobileProvisionIdentifier = args[2];
            const codeSignIdentity = args[3];
            const teamID = this.$options.teamId;
            let ipaFilePath = this.$options.ipa ? path.resolve(this.$options.ipa) : null;
            if (!username) {
                username = yield this.$prompter.getString("Apple ID", { allowEmpty: false });
            }
            if (!password) {
                password = yield this.$prompter.getPassword("Apple ID password");
            }
            if (!mobileProvisionIdentifier && !ipaFilePath) {
                this.$logger.warn("No mobile provision identifier set. A default mobile provision will be used. You can set one in app/App_Resources/iOS/build.xcconfig");
            }
            if (!codeSignIdentity && !ipaFilePath) {
                this.$logger.warn("No code sign identity set. A default code sign identity will be used. You can set one in app/App_Resources/iOS/build.xcconfig");
            }
            this.$options.release = true;
            if (!ipaFilePath) {
                const platform = this.$devicePlatformsConstants.iOS;
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
                if (mobileProvisionIdentifier || codeSignIdentity) {
                    const iOSBuildConfig = {
                        projectDir: this.$options.path,
                        release: this.$options.release,
                        device: this.$options.device,
                        provision: this.$options.provision,
                        teamId: this.$options.teamId,
                        buildForDevice: true,
                        mobileProvisionIdentifier,
                        codeSignIdentity
                    };
                    this.$logger.info("Building .ipa with the selected mobile provision and/or certificate.");
                    yield this.$platformService.preparePlatform(platformInfo);
                    yield this.$platformService.buildPlatform(platform, iOSBuildConfig, this.$projectData);
                    ipaFilePath = this.$platformService.lastOutputPath(platform, iOSBuildConfig, this.$projectData);
                }
                else {
                    this.$logger.info("No .ipa, mobile provision or certificate set. Perfect! Now we'll build .xcarchive and let Xcode pick the distribution certificate and provisioning profile for you when exporting .ipa for AppStore submission.");
                    yield this.$platformService.preparePlatform(platformInfo);
                    const platformData = this.$platformsData.getPlatformData(platform, this.$projectData);
                    const iOSProjectService = platformData.platformProjectService;
                    const archivePath = yield iOSProjectService.archive(this.$projectData);
                    this.$logger.info("Archive at: " + archivePath);
                    const exportPath = yield iOSProjectService.exportArchive(this.$projectData, { archivePath, teamID, provision: mobileProvisionIdentifier || this.$options.provision });
                    this.$logger.info("Export at: " + exportPath);
                    ipaFilePath = exportPath;
                }
            }
            yield this.$itmsTransporterService.upload({
                username,
                password,
                ipaFilePath,
                verboseLogging: this.$logger.getLevel() === "TRACE"
            });
        });
    }
    canExecute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.$platformService.isPlatformSupportedForOS(this.$devicePlatformsConstants.iOS, this.$projectData)) {
                this.$errors.fail(`Applications for platform ${this.$devicePlatformsConstants.iOS} can not be built on this OS`);
            }
            return true;
        });
    }
}
exports.PublishIOS = PublishIOS;
$injector.registerCommand(["publish|ios", "appstore|upload"], PublishIOS);
