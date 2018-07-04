"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DeployCommandHelper {
    constructor($options, $platformService, $projectData) {
        this.$options = $options;
        this.$platformService = $platformService;
        this.$projectData = $projectData;
        this.$projectData.initializeProjectData();
    }
    getDeployPlatformInfo(platform) {
        const appFilesUpdaterOptions = { bundle: !!this.$options.bundle, release: this.$options.release };
        const deployOptions = {
            clean: this.$options.clean,
            device: this.$options.device,
            projectDir: this.$projectData.projectDir,
            emulator: this.$options.emulator,
            platformTemplate: this.$options.platformTemplate,
            release: this.$options.release,
            forceInstall: true,
            provision: this.$options.provision,
            teamId: this.$options.teamId,
            keyStoreAlias: this.$options.keyStoreAlias,
            keyStoreAliasPassword: this.$options.keyStoreAliasPassword,
            keyStorePassword: this.$options.keyStorePassword,
            keyStorePath: this.$options.keyStorePath
        };
        const deployPlatformInfo = {
            platform,
            appFilesUpdaterOptions,
            deployOptions,
            projectData: this.$projectData,
            buildPlatform: this.$platformService.buildPlatform.bind(this.$platformService),
            config: this.$options,
            env: this.$options.env,
        };
        return deployPlatformInfo;
    }
}
exports.DeployCommandHelper = DeployCommandHelper;
$injector.register("deployCommandHelper", DeployCommandHelper);