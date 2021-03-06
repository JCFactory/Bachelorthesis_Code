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
const path = require("path");
const shell = require("shelljs");
const os = require("os");
const semver = require("semver");
const constants = require("../constants");
const helpers = require("../common/helpers");
const helpers_1 = require("../common/helpers");
const projectServiceBaseLib = require("./platform-project-service-base");
const plist_merge_patch_1 = require("plist-merge-patch");
const os_1 = require("os");
const temp = require("temp");
const plist = require("plist");
const mobileprovision = require("ios-mobileprovision-finder");
const constants_1 = require("../constants");
class IOSProjectService extends projectServiceBaseLib.PlatformProjectServiceBase {
    constructor($fs, $childProcess, $cocoapodsService, $errors, $logger, $iOSEmulatorServices, $injector, $projectDataService, $prompter, $config, $devicePlatformsConstants, $devicesService, $mobileHelper, $hostInfo, $pluginVariablesService, $xcprojService, $iOSProvisionService, $pbxprojDomXcode, $xcode, $iOSEntitlementsService, $platformEnvironmentRequirements, $plistParser, $sysInfo, $xCConfigService) {
        super($fs, $projectDataService);
        this.$childProcess = $childProcess;
        this.$cocoapodsService = $cocoapodsService;
        this.$errors = $errors;
        this.$logger = $logger;
        this.$iOSEmulatorServices = $iOSEmulatorServices;
        this.$injector = $injector;
        this.$prompter = $prompter;
        this.$config = $config;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.$devicesService = $devicesService;
        this.$mobileHelper = $mobileHelper;
        this.$hostInfo = $hostInfo;
        this.$pluginVariablesService = $pluginVariablesService;
        this.$xcprojService = $xcprojService;
        this.$iOSProvisionService = $iOSProvisionService;
        this.$pbxprojDomXcode = $pbxprojDomXcode;
        this.$xcode = $xcode;
        this.$iOSEntitlementsService = $iOSEntitlementsService;
        this.$platformEnvironmentRequirements = $platformEnvironmentRequirements;
        this.$plistParser = $plistParser;
        this.$sysInfo = $sysInfo;
        this.$xCConfigService = $xCConfigService;
        this._platformsDirCache = null;
        this._platformData = null;
    }
    get $npmInstallationManager() {
        return this.$injector.resolve("npmInstallationManager");
    }
    getPlatformData(projectData) {
        if (!projectData && !this._platformData) {
            throw new Error("First call of getPlatformData without providing projectData.");
        }
        if (projectData && projectData.platformsDir && this._platformsDirCache !== projectData.platformsDir) {
            const projectRoot = path.join(projectData.platformsDir, this.$devicePlatformsConstants.iOS.toLowerCase());
            this._platformData = {
                frameworkPackageName: constants.TNS_IOS_RUNTIME_NAME,
                normalizedPlatformName: "iOS",
                appDestinationDirectoryPath: path.join(projectRoot, projectData.projectName),
                platformProjectService: this,
                emulatorServices: this.$iOSEmulatorServices,
                projectRoot: projectRoot,
                deviceBuildOutputPath: path.join(projectRoot, constants.BUILD_DIR, "device"),
                emulatorBuildOutputPath: path.join(projectRoot, constants.BUILD_DIR, "emulator"),
                getValidBuildOutputData: (buildOptions) => {
                    if (buildOptions.isForDevice) {
                        return {
                            packageNames: [`${projectData.projectName}.ipa`]
                        };
                    }
                    return {
                        packageNames: [`${projectData.projectName}.app`, `${projectData.projectName}.zip`]
                    };
                },
                frameworkFilesExtensions: [".a", ".framework", ".bin"],
                frameworkDirectoriesExtensions: [".framework"],
                frameworkDirectoriesNames: ["Metadata", "metadataGenerator", "NativeScript", "internal"],
                targetedOS: ['darwin'],
                configurationFileName: constants.INFO_PLIST_FILE_NAME,
                configurationFilePath: path.join(projectRoot, projectData.projectName, projectData.projectName + `-${constants.INFO_PLIST_FILE_NAME}`),
                relativeToFrameworkConfigurationFilePath: path.join("__PROJECT_NAME__", "__PROJECT_NAME__-Info.plist"),
                fastLivesyncFileExtensions: [".tiff", ".tif", ".jpg", "jpeg", "gif", ".png", ".bmp", ".BMPf", ".ico", ".cur", ".xbm"]
            };
        }
        return this._platformData;
    }
    validateOptions(projectId, provision, teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (provision && teamId) {
                this.$errors.failWithoutHelp("The options --provision and --teamId are mutually exclusive.");
            }
            if (provision === true) {
                yield this.$iOSProvisionService.listProvisions(projectId);
                this.$errors.failWithoutHelp("Please provide provisioning profile uuid or name with the --provision option.");
                return false;
            }
            if (teamId === true) {
                yield this.$iOSProvisionService.listTeams();
                this.$errors.failWithoutHelp("Please provide team id or team name with the --teamId options.");
                return false;
            }
            return true;
        });
    }
    executeCommand(projectRoot, args, childProcessOpts, spawnFromEventOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            return { stderr: "", stdout: "", exitCode: 0 };
        });
    }
    getAppResourcesDestinationDirectoryPath(projectData) {
        const frameworkVersion = this.getFrameworkVersion(projectData);
        if (semver.lt(frameworkVersion, "1.3.0")) {
            return path.join(this.getPlatformData(projectData).projectRoot, projectData.projectName, "Resources", "icons");
        }
        return path.join(this.getPlatformData(projectData).projectRoot, projectData.projectName, "Resources");
    }
    validate(projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.$hostInfo.isDarwin) {
                return;
            }
            yield this.$platformEnvironmentRequirements.checkEnvironmentRequirements(this.getPlatformData(projectData).normalizedPlatformName, projectData.projectDir);
            const xcodeBuildVersion = yield this.getXcodeVersion();
            if (helpers.versionCompare(xcodeBuildVersion, IOSProjectService.XCODEBUILD_MIN_VERSION) < 0) {
                this.$errors.fail("NativeScript can only run in Xcode version %s or greater", IOSProjectService.XCODEBUILD_MIN_VERSION);
            }
        });
    }
    createProject(frameworkDir, frameworkVersion, projectData, config) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$fs.ensureDirectoryExists(path.join(this.getPlatformData(projectData).projectRoot, IOSProjectService.IOS_PROJECT_NAME_PLACEHOLDER));
            if (config.pathToTemplate) {
                this.$fs.readDirectory(frameworkDir)
                    .filter(dirName => dirName.indexOf(IOSProjectService.IOS_PROJECT_NAME_PLACEHOLDER) === -1)
                    .forEach(dirName => shell.cp("-R", path.join(frameworkDir, dirName), this.getPlatformData(projectData).projectRoot));
                shell.cp("-rf", path.join(config.pathToTemplate, "*"), this.getPlatformData(projectData).projectRoot);
            }
            else {
                shell.cp("-R", path.join(frameworkDir, "*"), this.getPlatformData(projectData).projectRoot);
            }
        });
    }
    interpolateData(projectData, platformSpecificData) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectRootFilePath = path.join(this.getPlatformData(projectData).projectRoot, IOSProjectService.IOS_PROJECT_NAME_PLACEHOLDER);
            if (this.$fs.exists(path.join(projectRootFilePath, IOSProjectService.IOS_PROJECT_NAME_PLACEHOLDER + "-Info.plist"))) {
                this.replaceFileName("-Info.plist", projectRootFilePath, projectData);
            }
            this.replaceFileName("-Prefix.pch", projectRootFilePath, projectData);
            const xcschemeDirPath = path.join(this.getPlatformData(projectData).projectRoot, IOSProjectService.IOS_PROJECT_NAME_PLACEHOLDER + IOSProjectService.XCODE_PROJECT_EXT_NAME, "xcshareddata/xcschemes");
            const xcschemeFilePath = path.join(xcschemeDirPath, IOSProjectService.IOS_PROJECT_NAME_PLACEHOLDER + IOSProjectService.XCODE_SCHEME_EXT_NAME);
            if (this.$fs.exists(xcschemeFilePath)) {
                this.$logger.debug("Found shared scheme at xcschemeFilePath, renaming to match project name.");
                this.$logger.debug("Checkpoint 0");
                this.replaceFileContent(xcschemeFilePath, projectData);
                this.$logger.debug("Checkpoint 1");
                this.replaceFileName(IOSProjectService.XCODE_SCHEME_EXT_NAME, xcschemeDirPath, projectData);
                this.$logger.debug("Checkpoint 2");
            }
            else {
                this.$logger.debug("Copying xcscheme from template not found at " + xcschemeFilePath);
            }
            this.replaceFileName(IOSProjectService.XCODE_PROJECT_EXT_NAME, this.getPlatformData(projectData).projectRoot, projectData);
            const pbxprojFilePath = this.getPbxProjPath(projectData);
            this.replaceFileContent(pbxprojFilePath, projectData);
        });
    }
    interpolateConfigurationFile(projectData, platformSpecificData) {
        return undefined;
    }
    afterCreateProject(projectRoot, projectData) {
        this.$fs.rename(path.join(projectRoot, IOSProjectService.IOS_PROJECT_NAME_PLACEHOLDER), path.join(projectRoot, projectData.projectName));
    }
    archive(projectData, buildConfig, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectRoot = this.getPlatformData(projectData).projectRoot;
            const archivePath = options && options.archivePath ? path.resolve(options.archivePath) : path.join(projectRoot, "/build/archive/", projectData.projectName + ".xcarchive");
            let args = ["archive", "-archivePath", archivePath, "-configuration",
                (!buildConfig || buildConfig.release) ? "Release" : "Debug"]
                .concat(this.xcbuildProjectArgs(projectRoot, projectData, "scheme"));
            if (options && options.additionalArgs) {
                args = args.concat(options.additionalArgs);
            }
            yield this.xcodebuild(args, projectRoot, buildConfig && buildConfig.buildOutputStdio);
            return archivePath;
        });
    }
    exportArchive(projectData, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectRoot = this.getPlatformData(projectData).projectRoot;
            const archivePath = options.archivePath;
            const exportPath = path.resolve(options.exportDir || path.join(projectRoot, "/build/archive"));
            const exportFile = path.join(exportPath, projectData.projectName + ".ipa");
            let plistTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
`;
            if (options && options.teamID) {
                plistTemplate += `    <key>teamID</key>
    <string>${options.teamID}</string>
`;
            }
            if (options && options.provision) {
                plistTemplate += `    <key>provisioningProfiles</key>
    <dict>
        <key>${projectData.projectId}</key>
        <string>${options.provision}</string>
    </dict>`;
            }
            plistTemplate += `    <key>method</key>
    <string>app-store</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <false/>
</dict>
</plist>`;
            temp.track();
            const exportOptionsPlist = temp.path({ prefix: "export-", suffix: ".plist" });
            this.$fs.writeFile(exportOptionsPlist, plistTemplate);
            yield this.xcodebuild([
                "-exportArchive",
                "-archivePath", archivePath,
                "-exportPath", exportPath,
                "-exportOptionsPlist", exportOptionsPlist
            ], projectRoot);
            return exportFile;
        });
    }
    exportDevelopmentArchive(projectData, buildConfig, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const platformData = this.getPlatformData(projectData);
            const projectRoot = platformData.projectRoot;
            const archivePath = options.archivePath;
            const buildOutputPath = path.join(projectRoot, "build", "device");
            const exportOptionsMethod = yield this.getExportOptionsMethod(projectData);
            let plistTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
	<string>${exportOptionsMethod}</string>`;
            if (options && options.provision) {
                plistTemplate += `    <key>provisioningProfiles</key>
<dict>
	<key>${projectData.projectId}</key>
	<string>${options.provision}</string>
</dict>`;
            }
            plistTemplate += `
    <key>uploadBitcode</key>
    <false/>
</dict>
</plist>`;
            temp.track();
            const exportOptionsPlist = temp.path({ prefix: "export-", suffix: ".plist" });
            this.$fs.writeFile(exportOptionsPlist, plistTemplate);
            const exportPath = path.resolve(options.exportDir || buildOutputPath);
            const exportFile = path.join(exportPath, projectData.projectName + ".ipa");
            yield this.xcodebuild([
                "-exportArchive",
                "-archivePath", archivePath,
                "-exportPath", exportPath,
                "-exportOptionsPlist", exportOptionsPlist
            ], projectRoot, buildConfig.buildOutputStdio);
            return exportFile;
        });
    }
    xcbuildProjectArgs(projectRoot, projectData, product) {
        const xcworkspacePath = path.join(projectRoot, projectData.projectName + ".xcworkspace");
        if (this.$fs.exists(xcworkspacePath)) {
            return ["-workspace", xcworkspacePath, product ? "-" + product : "-scheme", projectData.projectName];
        }
        else {
            const xcodeprojPath = path.join(projectRoot, projectData.projectName + ".xcodeproj");
            return ["-project", xcodeprojPath, product ? "-" + product : "-target", projectData.projectName];
        }
    }
    buildProject(projectRoot, projectData, buildConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const basicArgs = [
                'SHARED_PRECOMPS_DIR=' + path.join(projectRoot, 'build', 'sharedpch')
            ];
            const frameworkVersion = this.getFrameworkVersion(projectData);
            if (semver.lt(frameworkVersion, "1.4.0")) {
                basicArgs.push("-xcconfig", path.join(projectRoot, projectData.projectName, constants_1.BUILD_XCCONFIG_FILE_NAME));
            }
            const handler = (data) => {
                this.emit(constants.BUILD_OUTPUT_EVENT_NAME, data);
            };
            if (buildConfig.buildForDevice) {
                yield helpers_1.attachAwaitDetach(constants.BUILD_OUTPUT_EVENT_NAME, this.$childProcess, handler, this.buildForDevice(projectRoot, basicArgs, buildConfig, projectData));
            }
            else {
                yield helpers_1.attachAwaitDetach(constants.BUILD_OUTPUT_EVENT_NAME, this.$childProcess, handler, this.buildForSimulator(projectRoot, basicArgs, projectData, buildConfig));
            }
            this.validateApplicationIdentifier(projectData);
        });
    }
    validatePlugins(projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            const installedPlugins = yield this.$injector.resolve("pluginsService").getAllInstalledPlugins(projectData);
            for (const pluginData of installedPlugins) {
                const pluginsFolderExists = this.$fs.exists(path.join(pluginData.pluginPlatformsFolderPath(this.$devicePlatformsConstants.iOS.toLowerCase()), "Podfile"));
                const cocoaPodVersion = yield this.$sysInfo.getCocoaPodsVersion();
                if (pluginsFolderExists && !cocoaPodVersion) {
                    this.$errors.failWithoutHelp(`${pluginData.name} has Podfile and you don't have Cocoapods installed or it is not configured correctly. Please verify Cocoapods can work on your machine.`);
                }
            }
            Promise.resolve();
        });
    }
    buildForDevice(projectRoot, args, buildConfig, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultArchitectures = [
                'ARCHS=armv7 arm64',
                'VALID_ARCHS=armv7 arm64'
            ];
            if (!buildConfig.release && !buildConfig.architectures) {
                yield this.$devicesService.initialize({
                    platform: this.$devicePlatformsConstants.iOS.toLowerCase(), deviceId: buildConfig.device,
                    skipEmulatorStart: true
                });
                const instances = this.$devicesService.getDeviceInstances();
                const devicesArchitectures = _(instances)
                    .filter(d => this.$mobileHelper.isiOSPlatform(d.deviceInfo.platform) && d.deviceInfo.activeArchitecture)
                    .map(d => d.deviceInfo.activeArchitecture)
                    .uniq()
                    .value();
                if (devicesArchitectures.length > 0) {
                    const architectures = [
                        `ARCHS=${devicesArchitectures.join(" ")}`,
                        `VALID_ARCHS=${devicesArchitectures.join(" ")}`
                    ];
                    if (devicesArchitectures.length > 1) {
                        architectures.push('ONLY_ACTIVE_ARCH=NO');
                    }
                    buildConfig.architectures = architectures;
                }
            }
            args = args.concat((buildConfig && buildConfig.architectures) || defaultArchitectures);
            args = args.concat([
                "-sdk", "iphoneos",
                "CONFIGURATION_BUILD_DIR=" + path.join(projectRoot, "build", "device")
            ]);
            const xcodeBuildVersion = yield this.getXcodeVersion();
            if (helpers.versionCompare(xcodeBuildVersion, "8.0") >= 0) {
                yield this.setupSigningForDevice(projectRoot, buildConfig, projectData);
            }
            yield this.createIpa(projectRoot, projectData, buildConfig, args);
        });
    }
    xcodebuild(args, cwd, stdio = "inherit") {
        return __awaiter(this, void 0, void 0, function* () {
            const localArgs = [...args];
            const xcodeBuildVersion = yield this.getXcodeVersion();
            try {
                if (helpers.versionCompare(xcodeBuildVersion, "9.0") >= 0) {
                    localArgs.push("-allowProvisioningUpdates");
                }
            }
            catch (e) {
                this.$logger.warn("Failed to detect whether -allowProvisioningUpdates can be used with your xcodebuild version due to error: " + e);
            }
            if (this.$logger.getLevel() === "INFO") {
                localArgs.push("-quiet");
                this.$logger.info("Xcode build...");
            }
            return this.$childProcess.spawnFromEvent("xcodebuild", localArgs, "exit", { stdio: stdio || "inherit", cwd }, { emitOptions: { eventName: constants.BUILD_OUTPUT_EVENT_NAME }, throwError: true });
        });
    }
    setupSigningFromTeam(projectRoot, projectData, teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            const xcode = this.$pbxprojDomXcode.Xcode.open(this.getPbxProjPath(projectData));
            const signing = xcode.getSigning(projectData.projectName);
            let shouldUpdateXcode = false;
            if (signing && signing.style === "Automatic") {
                if (signing.team !== teamId) {
                    const teamIdsForName = yield this.$iOSProvisionService.getTeamIdsWithName(teamId);
                    if (!teamIdsForName.some(id => id === signing.team)) {
                        shouldUpdateXcode = true;
                    }
                }
            }
            else {
                shouldUpdateXcode = true;
            }
            if (shouldUpdateXcode) {
                const teamIdsForName = yield this.$iOSProvisionService.getTeamIdsWithName(teamId);
                if (teamIdsForName.length > 0) {
                    this.$logger.trace(`Team id ${teamIdsForName[0]} will be used for team name "${teamId}".`);
                    teamId = teamIdsForName[0];
                }
                xcode.setAutomaticSigningStyle(projectData.projectName, teamId);
                xcode.save();
                this.$logger.trace(`Set Automatic signing style and team id ${teamId}.`);
            }
            else {
                this.$logger.trace(`The specified ${teamId} is already set in the Xcode.`);
            }
        });
    }
    setupSigningFromProvision(projectRoot, projectData, provision, mobileProvisionData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (provision) {
                const xcode = this.$pbxprojDomXcode.Xcode.open(this.getPbxProjPath(projectData));
                const signing = xcode.getSigning(projectData.projectName);
                let shouldUpdateXcode = false;
                if (signing && signing.style === "Manual") {
                    for (const config in signing.configurations) {
                        const options = signing.configurations[config];
                        if (options.name !== provision && options.uuid !== provision) {
                            shouldUpdateXcode = true;
                            break;
                        }
                    }
                }
                else {
                    shouldUpdateXcode = true;
                }
                if (shouldUpdateXcode) {
                    const pickStart = Date.now();
                    const mobileprovision = mobileProvisionData || (yield this.$iOSProvisionService.pick(provision, projectData.projectId));
                    const pickEnd = Date.now();
                    this.$logger.trace("Searched and " + (mobileprovision ? "found" : "failed to find ") + " matching provisioning profile. (" + (pickEnd - pickStart) + "ms.)");
                    if (!mobileprovision) {
                        this.$errors.failWithoutHelp("Failed to find mobile provision with UUID or Name: " + provision);
                    }
                    xcode.setManualSigningStyle(projectData.projectName, {
                        team: mobileprovision.TeamIdentifier && mobileprovision.TeamIdentifier.length > 0 ? mobileprovision.TeamIdentifier[0] : undefined,
                        uuid: mobileprovision.UUID,
                        name: mobileprovision.Name,
                        identity: mobileprovision.Type === "Development" ? "iPhone Developer" : "iPhone Distribution"
                    });
                    xcode.save();
                    this.$logger.trace(`Set Manual signing style and provisioning profile: ${mobileprovision.Name} (${mobileprovision.UUID})`);
                }
                else {
                    this.$logger.trace(`The specified provisioning profile is already set in the Xcode: ${provision}`);
                }
            }
            else {
            }
        });
    }
    setupSigningForDevice(projectRoot, buildConfig, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            const xcode = this.$pbxprojDomXcode.Xcode.open(this.getPbxProjPath(projectData));
            const signing = xcode.getSigning(projectData.projectName);
            const hasProvisioningProfileInXCConfig = this.readXCConfigProvisioningProfileSpecifierForIPhoneOs(projectData) ||
                this.readXCConfigProvisioningProfileSpecifier(projectData) ||
                this.readXCConfigProvisioningProfileForIPhoneOs(projectData) ||
                this.readXCConfigProvisioningProfile(projectData);
            if (hasProvisioningProfileInXCConfig && (!signing || signing.style !== "Manual")) {
                xcode.setManualSigningStyle(projectData.projectName);
                xcode.save();
            }
            else if (!buildConfig.provision && !(signing && signing.style === "Manual" && !buildConfig.teamId)) {
                const teamId = yield this.getDevelopmentTeam(projectData, buildConfig.teamId);
                yield this.setupSigningFromTeam(projectRoot, projectData, teamId);
            }
        });
    }
    buildForSimulator(projectRoot, args, projectData, buildConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            args = args
                .concat([
                "build",
                "-configuration", buildConfig.release ? "Release" : "Debug",
                "-sdk", "iphonesimulator",
                "ARCHS=i386 x86_64",
                "VALID_ARCHS=i386 x86_64",
                "ONLY_ACTIVE_ARCH=NO",
                "CONFIGURATION_BUILD_DIR=" + path.join(projectRoot, "build", "emulator"),
                "CODE_SIGN_IDENTITY=",
            ])
                .concat(this.xcbuildProjectArgs(projectRoot, projectData));
            yield this.xcodebuild(args, projectRoot, buildConfig.buildOutputStdio);
        });
    }
    createIpa(projectRoot, projectData, buildConfig, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const archivePath = yield this.archive(projectData, buildConfig, { additionalArgs: args });
            const exportFileIpa = yield this.exportDevelopmentArchive(projectData, buildConfig, { archivePath, provision: buildConfig.provision || buildConfig.mobileProvisionIdentifier });
            return exportFileIpa;
        });
    }
    isPlatformPrepared(projectRoot, projectData) {
        return this.$fs.exists(path.join(projectRoot, projectData.projectName, constants.APP_FOLDER_NAME));
    }
    cleanDeviceTempFolder(deviceIdentifier) {
        return Promise.resolve();
    }
    addFramework(frameworkPath, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.$hostInfo.isWindows) {
                this.validateFramework(frameworkPath);
                const project = this.createPbxProj(projectData);
                const frameworkName = path.basename(frameworkPath, path.extname(frameworkPath));
                const frameworkBinaryPath = path.join(frameworkPath, frameworkName);
                const isDynamic = _.includes((yield this.$childProcess.spawnFromEvent("file", [frameworkBinaryPath], "close")).stdout, "dynamically linked");
                const frameworkAddOptions = { customFramework: true };
                if (isDynamic) {
                    frameworkAddOptions["embed"] = true;
                }
                const frameworkRelativePath = '$(SRCROOT)/' + this.getLibSubpathRelativeToProjectPath(frameworkPath, projectData);
                project.addFramework(frameworkRelativePath, frameworkAddOptions);
                this.savePbxProj(project, projectData);
            }
        });
    }
    addStaticLibrary(staticLibPath, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            const libraryName = path.basename(staticLibPath, ".a");
            const headersSubpath = path.join(path.dirname(staticLibPath), "include", libraryName);
            const project = this.createPbxProj(projectData);
            const relativeStaticLibPath = this.getLibSubpathRelativeToProjectPath(staticLibPath, projectData);
            project.addFramework(relativeStaticLibPath);
            const relativeHeaderSearchPath = path.join(this.getLibSubpathRelativeToProjectPath(headersSubpath, projectData));
            project.addToHeaderSearchPaths({ relativePath: relativeHeaderSearchPath });
            this.generateModulemap(headersSubpath, libraryName);
            this.savePbxProj(project, projectData);
        });
    }
    canUpdatePlatform(installedModuleDir, projectData) {
        const currentXcodeProjectFile = this.buildPathToCurrentXcodeProjectFile(projectData);
        const currentXcodeProjectFileContent = this.$fs.readFile(currentXcodeProjectFile);
        const newXcodeProjectFile = this.buildPathToNewXcodeProjectFile(installedModuleDir);
        this.replaceFileContent(newXcodeProjectFile, projectData);
        const newXcodeProjectFileContent = this.$fs.readFile(newXcodeProjectFile);
        const contentIsTheSame = currentXcodeProjectFileContent.toString() === newXcodeProjectFileContent.toString();
        if (!contentIsTheSame) {
            this.$logger.warn(`The content of the current project file: ${currentXcodeProjectFile} and the new project file: ${newXcodeProjectFile} is different.`);
        }
        return contentIsTheSame;
    }
    provideLaunchScreenIfMissing(projectData) {
        try {
            this.$logger.trace("Checking if we need to provide compatability LaunchScreen.xib");
            const platformData = this.getPlatformData(projectData);
            const projectPath = path.join(platformData.projectRoot, projectData.projectName);
            const projectPlist = this.getInfoPlistPath(projectData);
            const plistContent = plist.parse(this.$fs.readText(projectPlist));
            const storyName = plistContent["UILaunchStoryboardName"];
            this.$logger.trace(`Examining ${projectPlist} UILaunchStoryboardName: "${storyName}".`);
            if (storyName !== "LaunchScreen") {
                this.$logger.trace("The project has its UILaunchStoryboardName set to " + storyName + " which is not the pre v2.1.0 default LaunchScreen, probably the project is migrated so we are good to go.");
                return;
            }
            const expectedStoryPath = path.join(projectPath, "Resources", "LaunchScreen.storyboard");
            if (this.$fs.exists(expectedStoryPath)) {
                this.$logger.trace("LaunchScreen.storyboard was found. Project is up to date.");
                return;
            }
            this.$logger.trace("LaunchScreen file not found at: " + expectedStoryPath);
            const expectedXibPath = path.join(projectPath, "en.lproj", "LaunchScreen.xib");
            if (this.$fs.exists(expectedXibPath)) {
                this.$logger.trace("Obsolete LaunchScreen.xib was found. It'k OK, we are probably running with iOS runtime from pre v2.1.0.");
                return;
            }
            this.$logger.trace("LaunchScreen file not found at: " + expectedXibPath);
            const isTheLaunchScreenFile = (fileName) => fileName === "LaunchScreen.xib" || fileName === "LaunchScreen.storyboard";
            const matches = this.$fs.enumerateFilesInDirectorySync(projectPath, isTheLaunchScreenFile, { enumerateDirectories: false });
            if (matches.length > 0) {
                this.$logger.trace("Found LaunchScreen by slowly traversing all files here: " + matches + "\nConsider moving the LaunchScreen so it could be found at: " + expectedStoryPath);
                return;
            }
            const compatabilityXibPath = path.join(projectPath, "Resources", "LaunchScreen.xib");
            this.$logger.warn(`Failed to find LaunchScreen.storyboard but it was specified in the Info.plist.
Consider updating the resources in app/App_Resources/iOS/.
A good starting point would be to create a new project and diff the changes with your current one.
Also the following repo may be helpful: https://github.com/NativeScript/template-hello-world/tree/master/App_Resources/iOS
We will now place an empty obsolete compatability white screen LauncScreen.xib for you in ${path.relative(projectData.projectDir, compatabilityXibPath)} so your app may appear as it did in pre v2.1.0 versions of the ios runtime.`);
            const content = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.XIB" version="3.0" toolsVersion="6751" systemVersion="14A389" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" launchScreen="YES" useTraitCollections="YES">
    <dependencies>
        <plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="6736"/>
    </dependencies>
    <objects>
        <placeholder placeholderIdentifier="IBFilesOwner" id="-1" userLabel="File's Owner"/>
        <placeholder placeholderIdentifier="IBFirstResponder" id="-2" customClass="UIResponder"/>
        <view contentMode="scaleToFill" id="iN0-l3-epB">
            <rect key="frame" x="0.0" y="0.0" width="480" height="480"/>
            <autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/>
            <color key="backgroundColor" white="1" alpha="1" colorSpace="custom" customColorSpace="calibratedWhite"/>
            <nil key="simulatedStatusBarMetrics"/>
            <freeformSimulatedSizeMetrics key="simulatedDestinationMetrics"/>
            <point key="canvasLocation" x="548" y="455"/>
        </view>
    </objects>
</document>`;
            try {
                this.$fs.createDirectory(path.dirname(compatabilityXibPath));
                this.$fs.writeFile(compatabilityXibPath, content);
            }
            catch (e) {
                this.$logger.warn("We have failed to add compatability LaunchScreen.xib due to: " + e);
            }
        }
        catch (e) {
            this.$logger.warn("We have failed to check if we need to add a compatability LaunchScreen.xib due to: " + e);
        }
    }
    prepareProject(projectData, platformSpecificData) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectRoot = path.join(projectData.platformsDir, "ios");
            const provision = platformSpecificData && platformSpecificData.provision;
            const teamId = platformSpecificData && platformSpecificData.teamId;
            if (provision) {
                yield this.setupSigningFromProvision(projectRoot, projectData, provision, platformSpecificData.mobileProvisionData);
            }
            if (teamId) {
                yield this.setupSigningFromTeam(projectRoot, projectData, teamId);
            }
            const project = this.createPbxProj(projectData);
            this.provideLaunchScreenIfMissing(projectData);
            const resources = project.pbxGroupByName("Resources");
            if (resources) {
                const references = project.pbxFileReferenceSection();
                const xcodeProjectImages = _.map(resources.children, resource => this.replace(references[resource.value].name));
                this.$logger.trace("Images from Xcode project");
                this.$logger.trace(xcodeProjectImages);
                const appResourcesImages = this.$fs.readDirectory(this.getAppResourcesDestinationDirectoryPath(projectData));
                this.$logger.trace("Current images from App_Resources");
                this.$logger.trace(appResourcesImages);
                const imagesToAdd = _.difference(appResourcesImages, xcodeProjectImages);
                this.$logger.trace(`New images to add into xcode project: ${imagesToAdd.join(", ")}`);
                _.each(imagesToAdd, image => project.addResourceFile(path.relative(this.getPlatformData(projectData).projectRoot, path.join(this.getAppResourcesDestinationDirectoryPath(projectData), image))));
                const imagesToRemove = _.difference(xcodeProjectImages, appResourcesImages);
                this.$logger.trace(`Images to remove from xcode project: ${imagesToRemove.join(", ")}`);
                _.each(imagesToRemove, image => project.removeResourceFile(path.join(this.getAppResourcesDestinationDirectoryPath(projectData), image)));
                this.savePbxProj(project, projectData);
            }
        });
    }
    prepareAppResources(appResourcesDirectoryPath, projectData) {
        const platformFolder = path.join(appResourcesDirectoryPath, this.getPlatformData(projectData).normalizedPlatformName);
        const filterFile = (filename) => this.$fs.deleteFile(path.join(platformFolder, filename));
        filterFile(this.getPlatformData(projectData).configurationFileName);
        this.$fs.deleteDirectory(this.getAppResourcesDestinationDirectoryPath(projectData));
    }
    processConfigurationFilesFromAppResources(release, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mergeInfoPlists({ release }, projectData);
            yield this.$iOSEntitlementsService.merge(projectData);
            yield this.mergeProjectXcconfigFiles(release, projectData);
            for (const pluginData of yield this.getAllInstalledPlugins(projectData)) {
                yield this.$pluginVariablesService.interpolatePluginVariables(pluginData, this.getPlatformData(projectData).configurationFilePath, projectData);
            }
            this.$pluginVariablesService.interpolateAppIdentifier(this.getPlatformData(projectData).configurationFilePath, projectData);
        });
    }
    getInfoPlistPath(projectData) {
        return path.join(projectData.appResourcesDirectoryPath, this.getPlatformData(projectData).normalizedPlatformName, this.getPlatformData(projectData).configurationFileName);
    }
    ensureConfigurationFileInAppResources() {
        return null;
    }
    stopServices() {
        return __awaiter(this, void 0, void 0, function* () {
            return { stderr: "", stdout: "", exitCode: 0 };
        });
    }
    cleanProject(projectRoot) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve();
        });
    }
    mergeInfoPlists(buildOptions, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectDir = projectData.projectDir;
            const infoPlistPath = path.join(projectData.appResourcesDirectoryPath, this.getPlatformData(projectData).normalizedPlatformName, this.getPlatformData(projectData).configurationFileName);
            this.ensureConfigurationFileInAppResources();
            if (!this.$fs.exists(infoPlistPath)) {
                this.$logger.trace("Info.plist: No app/App_Resources/iOS/Info.plist found, falling back to pre-1.6.0 Info.plist behavior.");
                return;
            }
            const reporterTraceMessage = "Info.plist:";
            const reporter = {
                log: (txt) => this.$logger.trace(`${reporterTraceMessage} ${txt}`),
                warn: (txt) => this.$logger.warn(`${reporterTraceMessage} ${txt}`)
            };
            const session = new plist_merge_patch_1.PlistSession(reporter);
            const makePatch = (plistPath) => {
                if (!this.$fs.exists(plistPath)) {
                    this.$logger.trace("No plist found at: " + plistPath);
                    return;
                }
                this.$logger.trace("Schedule merge plist at: " + plistPath);
                session.patch({
                    name: path.relative(projectDir, plistPath),
                    read: () => this.$fs.readText(plistPath)
                });
            };
            const allPlugins = yield this.getAllInstalledPlugins(projectData);
            for (const plugin of allPlugins) {
                const pluginInfoPlistPath = path.join(plugin.pluginPlatformsFolderPath(IOSProjectService.IOS_PLATFORM_NAME), this.getPlatformData(projectData).configurationFileName);
                makePatch(pluginInfoPlistPath);
            }
            makePatch(infoPlistPath);
            if (projectData.projectId) {
                session.patch({
                    name: "CFBundleIdentifier from package.json nativescript.id",
                    read: () => `<?xml version="1.0" encoding="UTF-8"?>
						<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
						<plist version="1.0">
						<dict>
							<key>CFBundleIdentifier</key>
							<string>${projectData.projectId}</string>
						</dict>
						</plist>`
                });
            }
            if (!buildOptions.release && projectData.projectId) {
                session.patch({
                    name: "CFBundleURLTypes from package.json nativescript.id",
                    read: () => `<?xml version="1.0" encoding="UTF-8"?>
						<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
						<plist version="1.0">
						<dict>
							<key>CFBundleURLTypes</key>
							<array>
								<dict>
									<key>CFBundleTypeRole</key>
									<string>Editor</string>
									<key>CFBundleURLSchemes</key>
									<array>
										<string>${projectData.projectId.replace(/[^A-Za-z0-9]/g, "")}</string>
									</array>
								</dict>
							</array>
						</dict>
						</plist>`
                });
            }
            const plistContent = session.build();
            this.$logger.trace("Info.plist: Write to: " + this.getPlatformData(projectData).configurationFilePath);
            this.$fs.writeFile(this.getPlatformData(projectData).configurationFilePath, plistContent);
        });
    }
    getAllInstalledPlugins(projectData) {
        return this.$injector.resolve("pluginsService").getAllInstalledPlugins(projectData);
    }
    getXcodeprojPath(projectData) {
        return path.join(this.getPlatformData(projectData).projectRoot, projectData.projectName + IOSProjectService.XCODE_PROJECT_EXT_NAME);
    }
    getProjectPodFilePath(projectData) {
        return path.join(this.getPlatformData(projectData).projectRoot, "Podfile");
    }
    getPluginsDebugXcconfigFilePath(projectData) {
        return path.join(this.getPlatformData(projectData).projectRoot, "plugins-debug.xcconfig");
    }
    getPluginsReleaseXcconfigFilePath(projectData) {
        return path.join(this.getPlatformData(projectData).projectRoot, "plugins-release.xcconfig");
    }
    replace(name) {
        if (_.startsWith(name, '"')) {
            name = name.substr(1, name.length - 2);
        }
        return name.replace(/\\\"/g, "\"");
    }
    getLibSubpathRelativeToProjectPath(targetPath, projectData) {
        const frameworkPath = path.relative(this.getPlatformData(projectData).projectRoot, targetPath);
        return frameworkPath;
    }
    getPbxProjPath(projectData) {
        return path.join(this.getXcodeprojPath(projectData), "project.pbxproj");
    }
    createPbxProj(projectData) {
        const project = new this.$xcode.project(this.getPbxProjPath(projectData));
        project.parseSync();
        return project;
    }
    savePbxProj(project, projectData) {
        return this.$fs.writeFile(this.getPbxProjPath(projectData), project.writeSync());
    }
    preparePluginNativeCode(pluginData, projectData, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const pluginPlatformsFolderPath = pluginData.pluginPlatformsFolderPath(IOSProjectService.IOS_PLATFORM_NAME);
            const sourcePath = path.join(pluginPlatformsFolderPath, "src");
            if (this.$fs.exists(pluginPlatformsFolderPath) && this.$fs.exists(sourcePath)) {
                yield this.prepareNativeSourceCode(pluginData.name, sourcePath, projectData);
            }
            yield this.prepareResources(pluginPlatformsFolderPath, pluginData, projectData);
            yield this.prepareFrameworks(pluginPlatformsFolderPath, pluginData, projectData);
            yield this.prepareStaticLibs(pluginPlatformsFolderPath, pluginData, projectData);
            yield this.prepareCocoapods(pluginPlatformsFolderPath, projectData);
        });
    }
    removePluginNativeCode(pluginData, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pluginPlatformsFolderPath = pluginData.pluginPlatformsFolderPath(IOSProjectService.IOS_PLATFORM_NAME);
            this.removeNativeSourceCode(pluginPlatformsFolderPath, pluginData, projectData);
            this.removeFrameworks(pluginPlatformsFolderPath, pluginData, projectData);
            this.removeStaticLibs(pluginPlatformsFolderPath, pluginData, projectData);
            this.removeCocoapods(pluginPlatformsFolderPath, projectData);
        });
    }
    afterPrepareAllPlugins(projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.$fs.exists(this.getProjectPodFilePath(projectData))) {
                const projectPodfileContent = this.$fs.readText(this.getProjectPodFilePath(projectData));
                this.$logger.trace("Project Podfile content");
                this.$logger.trace(projectPodfileContent);
                const firstPostInstallIndex = projectPodfileContent.indexOf(IOSProjectService.PODFILE_POST_INSTALL_SECTION_NAME);
                if (firstPostInstallIndex !== -1 && firstPostInstallIndex !== projectPodfileContent.lastIndexOf(IOSProjectService.PODFILE_POST_INSTALL_SECTION_NAME)) {
                    this.$cocoapodsService.mergePodfileHookContent(IOSProjectService.PODFILE_POST_INSTALL_SECTION_NAME, this.getProjectPodFilePath(projectData));
                }
                const xcuserDataPath = path.join(this.getXcodeprojPath(projectData), "xcuserdata");
                const sharedDataPath = path.join(this.getXcodeprojPath(projectData), "xcshareddata");
                if (!this.$fs.exists(xcuserDataPath) && !this.$fs.exists(sharedDataPath)) {
                    this.$logger.info("Creating project scheme...");
                    yield this.checkIfXcodeprojIsRequired();
                    const createSchemeRubyScript = `ruby -e "require 'xcodeproj'; xcproj = Xcodeproj::Project.open('${projectData.projectName}.xcodeproj'); xcproj.recreate_user_schemes; xcproj.save"`;
                    yield this.$childProcess.exec(createSchemeRubyScript, { cwd: this.getPlatformData(projectData).projectRoot });
                }
                yield this.executePodInstall(projectData);
            }
        });
    }
    beforePrepareAllPlugins() {
        return Promise.resolve();
    }
    checkForChanges(changesInfo, { provision, teamId }, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            const hasProvision = provision !== undefined;
            const hasTeamId = teamId !== undefined;
            if (hasProvision || hasTeamId) {
                const pbxprojPath = this.getPbxProjPath(projectData);
                if (this.$fs.exists(pbxprojPath)) {
                    const xcode = this.$pbxprojDomXcode.Xcode.open(pbxprojPath);
                    const signing = xcode.getSigning(projectData.projectName);
                    if (hasProvision) {
                        if (signing && signing.style === "Manual") {
                            for (const name in signing.configurations) {
                                const config = signing.configurations[name];
                                if (config.uuid !== provision && config.name !== provision) {
                                    changesInfo.signingChanged = true;
                                    break;
                                }
                            }
                        }
                        else {
                            changesInfo.signingChanged = true;
                        }
                    }
                    if (hasTeamId) {
                        if (signing && signing.style === "Automatic") {
                            if (signing.team !== teamId) {
                                const teamIdsForName = yield this.$iOSProvisionService.getTeamIdsWithName(teamId);
                                if (!teamIdsForName.some(id => id === signing.team)) {
                                    changesInfo.signingChanged = true;
                                }
                            }
                        }
                        else {
                            changesInfo.signingChanged = true;
                        }
                    }
                }
                else {
                    changesInfo.signingChanged = true;
                }
            }
        });
    }
    prebuildNativePlugin(options) {
        return __awaiter(this, void 0, void 0, function* () {
            Promise.resolve();
        });
    }
    checkIfPluginsNeedBuild(projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    getBuildOptions(configurationFilePath) {
        return [];
    }
    getAllLibsForPluginWithFileExtension(pluginData, fileExtension) {
        const filterCallback = (fileName, pluginPlatformsFolderPath) => path.extname(fileName) === fileExtension;
        return this.getAllNativeLibrariesForPlugin(pluginData, IOSProjectService.IOS_PLATFORM_NAME, filterCallback);
    }
    buildPathToCurrentXcodeProjectFile(projectData) {
        return path.join(projectData.platformsDir, "ios", `${projectData.projectName}.xcodeproj`, "project.pbxproj");
    }
    buildPathToNewXcodeProjectFile(newModulesDir) {
        return path.join(newModulesDir, constants.PROJECT_FRAMEWORK_FOLDER_NAME, `${IOSProjectService.IOS_PROJECT_NAME_PLACEHOLDER}.xcodeproj`, "project.pbxproj");
    }
    validateFramework(libraryPath) {
        const infoPlistPath = path.join(libraryPath, constants.INFO_PLIST_FILE_NAME);
        if (!this.$fs.exists(infoPlistPath)) {
            this.$errors.failWithoutHelp("The bundle at %s does not contain an Info.plist file.", libraryPath);
        }
        const plistJson = this.$plistParser.parseFileSync(infoPlistPath);
        const packageType = plistJson["CFBundlePackageType"];
        if (packageType !== "FMWK") {
            this.$errors.failWithoutHelp("The bundle at %s does not appear to be a dynamic framework.", libraryPath);
        }
    }
    replaceFileContent(file, projectData) {
        const fileContent = this.$fs.readText(file);
        const replacedContent = helpers.stringReplaceAll(fileContent, IOSProjectService.IOS_PROJECT_NAME_PLACEHOLDER, projectData.projectName);
        this.$fs.writeFile(file, replacedContent);
    }
    replaceFileName(fileNamePart, fileRootLocation, projectData) {
        const oldFileName = IOSProjectService.IOS_PROJECT_NAME_PLACEHOLDER + fileNamePart;
        const newFileName = projectData.projectName + fileNamePart;
        this.$fs.rename(path.join(fileRootLocation, oldFileName), path.join(fileRootLocation, newFileName));
    }
    executePodInstall(projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.$childProcess.exec("which pod");
                yield this.$childProcess.exec("which xcodeproj");
            }
            catch (e) {
                this.$errors.failWithoutHelp("CocoaPods or ruby gem 'xcodeproj' is not installed. Run `sudo gem install cocoapods` and try again.");
            }
            yield this.$xcprojService.verifyXcproj(true);
            this.$logger.info("Installing pods...");
            const podTool = this.$config.USE_POD_SANDBOX ? "sandbox-pod" : "pod";
            const childProcess = yield this.$childProcess.spawnFromEvent(podTool, ["install"], "close", { cwd: this.getPlatformData(projectData).projectRoot, stdio: ['pipe', process.stdout, 'pipe'] });
            if (childProcess.stderr) {
                const warnings = childProcess.stderr.match(/(\u001b\[(?:\d*;){0,5}\d*m[\s\S]+?\u001b\[(?:\d*;){0,5}\d*m)|(\[!\].*?\n)|(.*?warning.*)/gi);
                _.each(warnings, (warning) => {
                    this.$logger.warnWithLabel(warning.replace("\n", ""));
                });
                let errors = childProcess.stderr;
                _.each(warnings, warning => {
                    errors = errors.replace(warning, "");
                });
                if (errors.trim()) {
                    this.$errors.failWithoutHelp(`Pod install command failed. Error output: ${errors}`);
                }
            }
            if ((yield this.$xcprojService.getXcprojInfo()).shouldUseXcproj) {
                yield this.$childProcess.spawnFromEvent("xcproj", ["--project", this.getXcodeprojPath(projectData), "touch"], "close");
            }
            return childProcess;
        });
    }
    prepareNativeSourceCode(pluginName, pluginPlatformsFolderPath, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            const project = this.createPbxProj(projectData);
            const group = this.getRootGroup(pluginName, pluginPlatformsFolderPath);
            project.addPbxGroup(group.files, group.name, group.path, null, { isMain: true });
            project.addToHeaderSearchPaths(group.path);
            this.savePbxProj(project, projectData);
        });
    }
    getRootGroup(name, rootPath) {
        const filePathsArr = [];
        const rootGroup = { name: name, files: filePathsArr, path: rootPath };
        if (this.$fs.exists(rootPath) && !this.$fs.isEmptyDir(rootPath)) {
            this.$fs.readDirectory(rootPath).forEach(fileName => {
                const filePath = path.join(rootGroup.path, fileName);
                filePathsArr.push(filePath);
            });
        }
        return rootGroup;
    }
    prepareResources(pluginPlatformsFolderPath, pluginData, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            const project = this.createPbxProj(projectData);
            const resourcesPath = path.join(pluginPlatformsFolderPath, "Resources");
            if (this.$fs.exists(resourcesPath) && !this.$fs.isEmptyDir(resourcesPath)) {
                for (const fileName of this.$fs.readDirectory(resourcesPath)) {
                    const filePath = path.join(resourcesPath, fileName);
                    project.addResourceFile(filePath);
                }
            }
            this.savePbxProj(project, projectData);
        });
    }
    prepareFrameworks(pluginPlatformsFolderPath, pluginData, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const fileName of this.getAllLibsForPluginWithFileExtension(pluginData, ".framework")) {
                yield this.addFramework(path.join(pluginPlatformsFolderPath, fileName), projectData);
            }
        });
    }
    prepareStaticLibs(pluginPlatformsFolderPath, pluginData, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const fileName of this.getAllLibsForPluginWithFileExtension(pluginData, ".a")) {
                yield this.addStaticLibrary(path.join(pluginPlatformsFolderPath, fileName), projectData);
            }
        });
    }
    prepareCocoapods(pluginPlatformsFolderPath, projectData, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const pluginPodFilePath = path.join(pluginPlatformsFolderPath, "Podfile");
            if (this.$fs.exists(pluginPodFilePath)) {
                const pluginPodFileContent = this.$fs.readText(pluginPodFilePath);
                const pluginPodFilePreparedContent = this.buildPodfileContent(pluginPodFilePath, pluginPodFileContent);
                let projectPodFileContent = this.$fs.exists(this.getProjectPodFilePath(projectData)) ? this.$fs.readText(this.getProjectPodFilePath(projectData)) : "";
                if (!~projectPodFileContent.indexOf(pluginPodFilePreparedContent)) {
                    const podFileHeader = this.$cocoapodsService.getPodfileHeader(projectData.projectName), podFileFooter = this.$cocoapodsService.getPodfileFooter();
                    if (_.startsWith(projectPodFileContent, podFileHeader)) {
                        projectPodFileContent = projectPodFileContent.substr(podFileHeader.length);
                    }
                    if (_.endsWith(projectPodFileContent, podFileFooter)) {
                        projectPodFileContent = projectPodFileContent.substr(0, projectPodFileContent.length - podFileFooter.length);
                    }
                    const contentToWrite = `${podFileHeader}${projectPodFileContent}${pluginPodFilePreparedContent}${podFileFooter}`;
                    this.$fs.writeFile(this.getProjectPodFilePath(projectData), contentToWrite);
                    const project = this.createPbxProj(projectData);
                    this.savePbxProj(project, projectData);
                }
            }
            if (opts && opts.executePodInstall && this.$fs.exists(pluginPodFilePath)) {
                yield this.executePodInstall(projectData);
            }
        });
    }
    removeNativeSourceCode(pluginPlatformsFolderPath, pluginData, projectData) {
        const project = this.createPbxProj(projectData);
        const group = this.getRootGroup(pluginData.name, pluginPlatformsFolderPath);
        project.removePbxGroup(group.name, group.path);
        project.removeFromHeaderSearchPaths(group.path);
        this.savePbxProj(project, projectData);
    }
    removeFrameworks(pluginPlatformsFolderPath, pluginData, projectData) {
        const project = this.createPbxProj(projectData);
        _.each(this.getAllLibsForPluginWithFileExtension(pluginData, ".framework"), fileName => {
            const relativeFrameworkPath = this.getLibSubpathRelativeToProjectPath(fileName, projectData);
            project.removeFramework(relativeFrameworkPath, { customFramework: true, embed: true });
        });
        this.savePbxProj(project, projectData);
    }
    removeStaticLibs(pluginPlatformsFolderPath, pluginData, projectData) {
        const project = this.createPbxProj(projectData);
        _.each(this.getAllLibsForPluginWithFileExtension(pluginData, ".a"), fileName => {
            const staticLibPath = path.join(pluginPlatformsFolderPath, fileName);
            const relativeStaticLibPath = this.getLibSubpathRelativeToProjectPath(path.basename(staticLibPath), projectData);
            project.removeFramework(relativeStaticLibPath);
            const headersSubpath = path.join("include", path.basename(staticLibPath, ".a"));
            const relativeHeaderSearchPath = path.join(this.getLibSubpathRelativeToProjectPath(headersSubpath, projectData));
            project.removeFromHeaderSearchPaths({ relativePath: relativeHeaderSearchPath });
        });
        this.savePbxProj(project, projectData);
    }
    removeCocoapods(pluginPlatformsFolderPath, projectData) {
        const pluginPodFilePath = path.join(pluginPlatformsFolderPath, "Podfile");
        if (this.$fs.exists(pluginPodFilePath) && this.$fs.exists(this.getProjectPodFilePath(projectData))) {
            const pluginPodFileContent = this.$fs.readText(pluginPodFilePath);
            let projectPodFileContent = this.$fs.readText(this.getProjectPodFilePath(projectData));
            const contentToRemove = this.buildPodfileContent(pluginPodFilePath, pluginPodFileContent);
            projectPodFileContent = helpers.stringReplaceAll(projectPodFileContent, contentToRemove, "");
            if (projectPodFileContent.trim() === `use_frameworks!${os.EOL}${os.EOL}target "${projectData.projectName}" do${os.EOL}${os.EOL}end`) {
                this.$fs.deleteFile(this.getProjectPodFilePath(projectData));
            }
            else {
                this.$fs.writeFile(this.getProjectPodFilePath(projectData), projectPodFileContent);
            }
        }
    }
    buildPodfileContent(pluginPodFilePath, pluginPodFileContent) {
        return `# Begin Podfile - ${pluginPodFilePath} ${os.EOL} ${pluginPodFileContent} ${os.EOL} # End Podfile ${os.EOL}`;
    }
    generateModulemap(headersFolderPath, libraryName) {
        const headersFilter = (fileName, containingFolderPath) => (path.extname(fileName) === ".h" && this.$fs.getFsStats(path.join(containingFolderPath, fileName)).isFile());
        const headersFolderContents = this.$fs.readDirectory(headersFolderPath);
        let headers = _(headersFolderContents).filter(item => headersFilter(item, headersFolderPath)).value();
        if (!headers.length) {
            this.$fs.deleteFile(path.join(headersFolderPath, "module.modulemap"));
            return;
        }
        headers = _.map(headers, value => `header "${value}"`);
        const modulemap = `module ${libraryName} { explicit module ${libraryName} { ${headers.join(" ")} } }`;
        this.$fs.writeFile(path.join(headersFolderPath, "module.modulemap"), modulemap);
    }
    mergeXcconfigFiles(pluginFile, projectFile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.$fs.exists(projectFile)) {
                this.$fs.writeFile(projectFile, "");
            }
            yield this.checkIfXcodeprojIsRequired();
            const escapedProjectFile = projectFile.replace(/'/g, "\\'"), escapedPluginFile = pluginFile.replace(/'/g, "\\'"), mergeScript = `require 'xcodeproj'; Xcodeproj::Config.new('${escapedProjectFile}').merge(Xcodeproj::Config.new('${escapedPluginFile}')).save_as(Pathname.new('${escapedProjectFile}'))`;
            yield this.$childProcess.exec(`ruby -e "${mergeScript}"`);
        });
    }
    mergeProjectXcconfigFiles(release, projectData) {
        return __awaiter(this, void 0, void 0, function* () {
            const pluginsXcconfigFilePath = release ? this.getPluginsReleaseXcconfigFilePath(projectData) : this.getPluginsDebugXcconfigFilePath(projectData);
            this.$fs.deleteFile(pluginsXcconfigFilePath);
            const allPlugins = yield this.$injector.resolve("pluginsService").getAllInstalledPlugins(projectData);
            for (const plugin of allPlugins) {
                const pluginPlatformsFolderPath = plugin.pluginPlatformsFolderPath(IOSProjectService.IOS_PLATFORM_NAME);
                const pluginXcconfigFilePath = path.join(pluginPlatformsFolderPath, constants_1.BUILD_XCCONFIG_FILE_NAME);
                if (this.$fs.exists(pluginXcconfigFilePath)) {
                    yield this.mergeXcconfigFiles(pluginXcconfigFilePath, pluginsXcconfigFilePath);
                }
            }
            const appResourcesXcconfigPath = path.join(projectData.appResourcesDirectoryPath, this.getPlatformData(projectData).normalizedPlatformName, constants_1.BUILD_XCCONFIG_FILE_NAME);
            if (this.$fs.exists(appResourcesXcconfigPath)) {
                yield this.mergeXcconfigFiles(appResourcesXcconfigPath, pluginsXcconfigFilePath);
            }
            const entitlementsPropertyValue = this.$xCConfigService.readPropertyValue(pluginsXcconfigFilePath, constants.CODE_SIGN_ENTITLEMENTS);
            if (entitlementsPropertyValue === null && this.$fs.exists(this.$iOSEntitlementsService.getPlatformsEntitlementsPath(projectData))) {
                temp.track();
                const tempEntitlementsDir = temp.mkdirSync("entitlements");
                const tempEntitlementsFilePath = path.join(tempEntitlementsDir, "set-entitlements.xcconfig");
                const entitlementsRelativePath = this.$iOSEntitlementsService.getPlatformsEntitlementsRelativePath(projectData);
                this.$fs.writeFile(tempEntitlementsFilePath, `CODE_SIGN_ENTITLEMENTS = ${entitlementsRelativePath}${os_1.EOL}`);
                yield this.mergeXcconfigFiles(tempEntitlementsFilePath, pluginsXcconfigFilePath);
            }
            const podFilesRootDirName = path.join("Pods", "Target Support Files", `Pods-${projectData.projectName}`);
            const podFolder = path.join(this.getPlatformData(projectData).projectRoot, podFilesRootDirName);
            if (this.$fs.exists(podFolder)) {
                if (release) {
                    yield this.mergeXcconfigFiles(path.join(this.getPlatformData(projectData).projectRoot, podFilesRootDirName, `Pods-${projectData.projectName}.release.xcconfig`), this.getPluginsReleaseXcconfigFilePath(projectData));
                }
                else {
                    yield this.mergeXcconfigFiles(path.join(this.getPlatformData(projectData).projectRoot, podFilesRootDirName, `Pods-${projectData.projectName}.debug.xcconfig`), this.getPluginsDebugXcconfigFilePath(projectData));
                }
            }
        });
    }
    checkIfXcodeprojIsRequired() {
        return __awaiter(this, void 0, void 0, function* () {
            const xcprojInfo = yield this.$xcprojService.getXcprojInfo();
            if (xcprojInfo.shouldUseXcproj && !xcprojInfo.xcprojAvailable) {
                const errorMessage = `You are using CocoaPods version ${xcprojInfo.cocoapodVer} which does not support Xcode ${xcprojInfo.xcodeVersion.major}.${xcprojInfo.xcodeVersion.minor} yet.${os_1.EOL}${os_1.EOL}You can update your cocoapods by running $sudo gem install cocoapods from a terminal.${os_1.EOL}${os_1.EOL}In order for the NativeScript CLI to be able to work correctly with this setup you need to install xcproj command line tool and add it to your PATH. Xcproj can be installed with homebrew by running $ brew install xcproj from the terminal`;
                this.$errors.failWithoutHelp(errorMessage);
                return true;
            }
        });
    }
    getXcodeVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            let xcodeBuildVersion = "";
            try {
                xcodeBuildVersion = yield this.$childProcess.exec("xcodebuild -version | head -n 1 | sed -e 's/Xcode //'");
            }
            catch (error) {
                this.$errors.fail("xcodebuild execution failed. Make sure that you have latest Xcode and tools installed.");
            }
            const splitedXcodeBuildVersion = xcodeBuildVersion.split(".");
            xcodeBuildVersion = `${splitedXcodeBuildVersion[0] || 0}.${splitedXcodeBuildVersion[1] || 0}`;
            return xcodeBuildVersion;
        });
    }
    getBuildXCConfigFilePath(projectData) {
        const buildXCConfig = path.join(projectData.appResourcesDirectoryPath, this.getPlatformData(projectData).normalizedPlatformName, constants_1.BUILD_XCCONFIG_FILE_NAME);
        return buildXCConfig;
    }
    readTeamId(projectData) {
        let teamId = this.$xCConfigService.readPropertyValue(this.getBuildXCConfigFilePath(projectData), "DEVELOPMENT_TEAM");
        const fileName = path.join(this.getPlatformData(projectData).projectRoot, "teamid");
        if (this.$fs.exists(fileName)) {
            teamId = this.$fs.readText(fileName);
        }
        return teamId;
    }
    readXCConfigProvisioningProfile(projectData) {
        return this.$xCConfigService.readPropertyValue(this.getBuildXCConfigFilePath(projectData), "PROVISIONING_PROFILE");
    }
    readXCConfigProvisioningProfileForIPhoneOs(projectData) {
        return this.$xCConfigService.readPropertyValue(this.getBuildXCConfigFilePath(projectData), "PROVISIONING_PROFILE[sdk=iphoneos*]");
    }
    readXCConfigProvisioningProfileSpecifier(projectData) {
        return this.$xCConfigService.readPropertyValue(this.getBuildXCConfigFilePath(projectData), "PROVISIONING_PROFILE_SPECIFIER");
    }
    readXCConfigProvisioningProfileSpecifierForIPhoneOs(projectData) {
        return this.$xCConfigService.readPropertyValue(this.getBuildXCConfigFilePath(projectData), "PROVISIONING_PROFILE_SPECIFIER[sdk=iphoneos*]");
    }
    getDevelopmentTeam(projectData, teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            teamId = teamId || this.readTeamId(projectData);
            if (!teamId) {
                const teams = yield this.$iOSProvisionService.getDevelopmentTeams();
                this.$logger.warn("Xcode 8 requires a team id to be specified when building for device.");
                this.$logger.warn("You can specify the team id by setting the DEVELOPMENT_TEAM setting in build.xcconfig file located in App_Resources folder of your app, or by using the --teamId option when calling run, debug or livesync commands.");
                if (teams.length === 1) {
                    teamId = teams[0].id;
                    this.$logger.warn("Found and using the following development team installed on your system: " + teams[0].name + " (" + teams[0].id + ")");
                }
                else if (teams.length > 0) {
                    if (!helpers.isInteractive()) {
                        this.$errors.failWithoutHelp(`Unable to determine default development team. Available development teams are: ${_.map(teams, team => team.id)}. Specify team in app/App_Resources/iOS/build.xcconfig file in the following way: DEVELOPMENT_TEAM = <team id>`);
                    }
                    const choices = [];
                    for (const team of teams) {
                        choices.push(team.name + " (" + team.id + ")");
                    }
                    const choice = yield this.$prompter.promptForChoice('Found multiple development teams, select one:', choices);
                    teamId = teams[choices.indexOf(choice)].id;
                    const choicesPersist = [
                        "Yes, set the DEVELOPMENT_TEAM setting in build.xcconfig file.",
                        "Yes, persist the team id in platforms folder.",
                        "No, don't persist this setting."
                    ];
                    const choicePersist = yield this.$prompter.promptForChoice("Do you want to make teamId: " + teamId + " a persistent choice for your app?", choicesPersist);
                    switch (choicesPersist.indexOf(choicePersist)) {
                        case 0:
                            const xcconfigFile = path.join(projectData.appResourcesDirectoryPath, this.getPlatformData(projectData).normalizedPlatformName, constants_1.BUILD_XCCONFIG_FILE_NAME);
                            this.$fs.appendFile(xcconfigFile, "\nDEVELOPMENT_TEAM = " + teamId + "\n");
                            break;
                        case 1:
                            this.$fs.writeFile(path.join(this.getPlatformData(projectData).projectRoot, "teamid"), teamId);
                            break;
                        default:
                            break;
                    }
                }
            }
            this.$logger.trace(`Selected teamId is '${teamId}'.`);
            return teamId;
        });
    }
    validateApplicationIdentifier(projectData) {
        const infoPlistPath = path.join(projectData.appResourcesDirectoryPath, this.getPlatformData(projectData).normalizedPlatformName, this.getPlatformData(projectData).configurationFileName);
        const mergedPlistPath = this.getPlatformData(projectData).configurationFilePath;
        if (!this.$fs.exists(infoPlistPath) || !this.$fs.exists(mergedPlistPath)) {
            return;
        }
        const infoPlist = plist.parse(this.$fs.readText(infoPlistPath));
        const mergedPlist = plist.parse(this.$fs.readText(mergedPlistPath));
        if (infoPlist.CFBundleIdentifier && infoPlist.CFBundleIdentifier !== mergedPlist.CFBundleIdentifier) {
            this.$logger.warnWithLabel("The CFBundleIdentifier key inside the 'Info.plist' will be overriden by the 'id' inside 'package.json'.");
        }
    }
    getExportOptionsMethod(projectData) {
        const embeddedMobileProvisionPath = path.join(this.getPlatformData(projectData).projectRoot, "build", "archive", `${projectData.projectName}.xcarchive`, 'Products', 'Applications', `${projectData.projectName}.app`, "embedded.mobileprovision");
        const provision = mobileprovision.provision.readFromFile(embeddedMobileProvisionPath);
        return {
            "Development": "development",
            "AdHoc": "ad-hoc",
            "Distribution": "app-store",
            "Enterprise": "enterprise"
        }[provision.Type];
    }
}
IOSProjectService.XCODE_PROJECT_EXT_NAME = ".xcodeproj";
IOSProjectService.XCODE_SCHEME_EXT_NAME = ".xcscheme";
IOSProjectService.XCODEBUILD_MIN_VERSION = "6.0";
IOSProjectService.IOS_PROJECT_NAME_PLACEHOLDER = "__PROJECT_NAME__";
IOSProjectService.IOS_PLATFORM_NAME = "ios";
IOSProjectService.PODFILE_POST_INSTALL_SECTION_NAME = "post_install";
exports.IOSProjectService = IOSProjectService;
$injector.register("iOSProjectService", IOSProjectService);
