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
const events_1 = require("events");
const constants_1 = require("../constants");
const helpers_1 = require("../common/helpers");
class LocalBuildService extends events_1.EventEmitter {
    constructor($projectData, $mobileHelper, $errors, $platformsData, $platformService, $projectDataService) {
        super();
        this.$projectData = $projectData;
        this.$mobileHelper = $mobileHelper;
        this.$errors = $errors;
        this.$platformsData = $platformsData;
        this.$platformService = $platformService;
        this.$projectDataService = $projectDataService;
    }
    build(platform, platformBuildOptions, platformTemplate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.$mobileHelper.isAndroidPlatform(platform) && platformBuildOptions.release && (!platformBuildOptions.keyStorePath || !platformBuildOptions.keyStorePassword || !platformBuildOptions.keyStoreAlias || !platformBuildOptions.keyStoreAliasPassword)) {
                this.$errors.fail(constants_1.ANDROID_RELEASE_BUILD_ERROR_MESSAGE);
            }
            this.$projectData.initializeProjectData(platformBuildOptions.projectDir);
            const prepareInfo = {
                platform,
                appFilesUpdaterOptions: platformBuildOptions,
                platformTemplate,
                projectData: this.$projectData,
                env: platformBuildOptions.env,
                config: {
                    provision: platformBuildOptions.provision,
                    teamId: platformBuildOptions.teamId,
                    sdk: null,
                    frameworkPath: null,
                    ignoreScripts: false
                }
            };
            yield this.$platformService.preparePlatform(prepareInfo);
            const handler = (data) => {
                data.projectDir = platformBuildOptions.projectDir;
                this.emit(constants_1.BUILD_OUTPUT_EVENT_NAME, data);
            };
            platformBuildOptions.buildOutputStdio = "pipe";
            yield helpers_1.attachAwaitDetach(constants_1.BUILD_OUTPUT_EVENT_NAME, this.$platformService, handler, this.$platformService.buildPlatform(platform, platformBuildOptions, this.$projectData));
            return this.$platformService.lastOutputPath(platform, platformBuildOptions, this.$projectData);
        });
    }
    cleanNativeApp(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectData = this.$projectDataService.getProjectData(data.projectDir);
            const platformData = this.$platformsData.getPlatformData(data.platform, projectData);
            yield platformData.platformProjectService.cleanProject(platformData.projectRoot, projectData);
        });
    }
}
exports.LocalBuildService = LocalBuildService;
$injector.register("localBuildService", LocalBuildService);
