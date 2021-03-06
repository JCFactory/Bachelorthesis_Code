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
class LiveSyncCommandHelper {
    constructor($platformService, $projectData, $options, $liveSyncService, $iosDeviceOperations, $mobileHelper, $devicesService, $platformsData, $analyticsService, $bundleValidatorHelper, $errors, $iOSSimulatorLogProvider) {
        this.$platformService = $platformService;
        this.$projectData = $projectData;
        this.$options = $options;
        this.$liveSyncService = $liveSyncService;
        this.$iosDeviceOperations = $iosDeviceOperations;
        this.$mobileHelper = $mobileHelper;
        this.$devicesService = $devicesService;
        this.$platformsData = $platformsData;
        this.$analyticsService = $analyticsService;
        this.$bundleValidatorHelper = $bundleValidatorHelper;
        this.$errors = $errors;
        this.$iOSSimulatorLogProvider = $iOSSimulatorLogProvider;
        this.$analyticsService.setShouldDispose(this.$options.justlaunch || !this.$options.watch);
    }
    getPlatformsForOperation(platform) {
        const availablePlatforms = platform ? [platform] : _.values(this.$platformsData.availablePlatforms);
        return availablePlatforms;
    }
    executeCommandLiveSync(platform, additionalOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$devicesService.initialize({
                deviceId: this.$options.device,
                platform: platform,
                emulator: this.$options.emulator,
                skipDeviceDetectionInterval: true,
                skipInferPlatform: !platform
            });
            yield this.$devicesService.detectCurrentlyAttachedDevices({ shouldReturnImmediateResult: false, platform: platform });
            const devices = this.$devicesService.getDeviceInstances()
                .filter(d => !platform || d.deviceInfo.platform.toLowerCase() === platform.toLowerCase());
            const devicesPlatforms = _(devices).map(d => d.deviceInfo.platform).uniq().value();
            if (this.$options.bundle && devicesPlatforms.length > 1) {
                this.$errors.failWithoutHelp("Bundling doesn't work with multiple platforms. Please specify platform to the run command.");
            }
            yield this.executeLiveSyncOperation(devices, platform, additionalOptions);
        });
    }
    executeLiveSyncOperation(devices, platform, additionalOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!devices || !devices.length) {
                if (platform) {
                    this.$errors.failWithoutHelp("Unable to find applicable devices to execute operation. Ensure connected devices are trusted and try again.");
                }
                else {
                    this.$errors.failWithoutHelp("Unable to find applicable devices to execute operation and unable to start emulator when platform is not specified.");
                }
            }
            const workingWithiOSDevices = !platform || this.$mobileHelper.isiOSPlatform(platform);
            const shouldKeepProcessAlive = this.$options.watch || !this.$options.justlaunch;
            if (workingWithiOSDevices && shouldKeepProcessAlive) {
                this.$iosDeviceOperations.setShouldDispose(false);
                this.$iOSSimulatorLogProvider.setShouldDispose(false);
            }
            if (this.$options.release) {
                yield this.runInReleaseMode(platform, additionalOptions);
                return;
            }
            const deviceDescriptors = devices
                .map(d => {
                let buildAction;
                const buildConfig = {
                    buildForDevice: !d.isEmulator,
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
                buildAction = additionalOptions && additionalOptions.buildPlatform ?
                    additionalOptions.buildPlatform.bind(additionalOptions.buildPlatform, d.deviceInfo.platform, buildConfig, this.$projectData) :
                    this.$platformService.buildPlatform.bind(this.$platformService, d.deviceInfo.platform, buildConfig, this.$projectData);
                const info = {
                    identifier: d.deviceInfo.identifier,
                    platformSpecificOptions: this.$options,
                    buildAction,
                    debugggingEnabled: additionalOptions && additionalOptions.deviceDebugMap && additionalOptions.deviceDebugMap[d.deviceInfo.identifier],
                    debugOptions: this.$options,
                    outputPath: additionalOptions && additionalOptions.getOutputDirectory && additionalOptions.getOutputDirectory({
                        platform: d.deviceInfo.platform,
                        emulator: d.isEmulator,
                        projectDir: this.$projectData.projectDir
                    }),
                    skipNativePrepare: additionalOptions && additionalOptions.skipNativePrepare
                };
                return info;
            });
            const liveSyncInfo = {
                projectDir: this.$projectData.projectDir,
                skipWatcher: !this.$options.watch,
                watchAllFiles: this.$options.syncAllFiles,
                clean: this.$options.clean,
                bundle: !!this.$options.bundle,
                release: this.$options.release,
                env: this.$options.env
            };
            yield this.$liveSyncService.liveSync(deviceDescriptors, liveSyncInfo);
        });
    }
    validatePlatform(platform) {
        return __awaiter(this, void 0, void 0, function* () {
            const availablePlatforms = this.getPlatformsForOperation(platform);
            for (const availablePlatform of availablePlatforms) {
                const platformData = this.$platformsData.getPlatformData(availablePlatform, this.$projectData);
                const platformProjectService = platformData.platformProjectService;
                yield platformProjectService.validate(this.$projectData);
            }
            this.$bundleValidatorHelper.validate();
        });
    }
    runInReleaseMode(platform, additionalOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const runPlatformOptions = {
                device: this.$options.device,
                emulator: this.$options.emulator,
                justlaunch: this.$options.justlaunch
            };
            const deployOptions = _.merge({
                projectDir: this.$projectData.projectDir,
                clean: true,
            }, this.$options.argv);
            const availablePlatforms = this.getPlatformsForOperation(platform);
            for (const currentPlatform of availablePlatforms) {
                const deployPlatformInfo = {
                    platform: currentPlatform,
                    appFilesUpdaterOptions: {
                        bundle: !!this.$options.bundle,
                        release: this.$options.release
                    },
                    deployOptions,
                    buildPlatform: this.$platformService.buildPlatform.bind(this.$platformService),
                    projectData: this.$projectData,
                    config: this.$options,
                    env: this.$options.env
                };
                yield this.$platformService.deployPlatform(deployPlatformInfo);
                yield this.$platformService.startApplication(currentPlatform, runPlatformOptions, { appId: this.$projectData.projectId, projectName: this.$projectData.projectName });
                this.$platformService.trackProjectType(this.$projectData);
            }
        });
    }
}
exports.LiveSyncCommandHelper = LiveSyncCommandHelper;
$injector.register("liveSyncCommandHelper", LiveSyncCommandHelper);
