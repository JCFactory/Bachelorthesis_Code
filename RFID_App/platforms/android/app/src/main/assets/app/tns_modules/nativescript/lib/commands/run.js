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
const constants_1 = require("../common/constants");
const constants_2 = require("../constants");
const decorators_1 = require("../common/decorators");
class RunCommandBase {
    constructor($projectData, $devicePlatformsConstants, $errors, $hostInfo, $liveSyncCommandHelper) {
        this.$projectData = $projectData;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.$errors = $errors;
        this.$hostInfo = $hostInfo;
        this.$liveSyncCommandHelper = $liveSyncCommandHelper;
        this.allowedParameters = [];
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.$liveSyncCommandHelper.executeCommandLiveSync(this.platform);
        });
    }
    canExecute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (args.length) {
                this.$errors.fail(constants_1.ERROR_NO_VALID_SUBCOMMAND_FORMAT, "run");
            }
            this.$projectData.initializeProjectData();
            this.platform = args[0] || this.platform;
            if (!this.platform && !this.$hostInfo.isDarwin) {
                this.platform = this.$devicePlatformsConstants.Android;
            }
            yield this.$liveSyncCommandHelper.validatePlatform(this.platform);
            return true;
        });
    }
}
exports.RunCommandBase = RunCommandBase;
$injector.registerCommand("run|*all", RunCommandBase);
class RunIosCommand {
    constructor($platformsData, $devicePlatformsConstants, $errors, $injector, $platformService, $projectData, $options) {
        this.$platformsData = $platformsData;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.$errors = $errors;
        this.$injector = $injector;
        this.$platformService = $platformService;
        this.$projectData = $projectData;
        this.$options = $options;
        this.allowedParameters = [];
    }
    get runCommand() {
        const runCommand = this.$injector.resolve(RunCommandBase);
        runCommand.platform = this.platform;
        return runCommand;
    }
    get platform() {
        return this.$devicePlatformsConstants.iOS;
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.$platformService.isPlatformSupportedForOS(this.$devicePlatformsConstants.iOS, this.$projectData)) {
                this.$errors.fail(`Applications for platform ${this.$devicePlatformsConstants.iOS} can not be built on this OS`);
            }
            return this.runCommand.execute(args);
        });
    }
    canExecute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.runCommand.canExecute(args)) && (yield this.$platformService.validateOptions(this.$options.provision, this.$options.teamId, this.$projectData, this.$platformsData.availablePlatforms.iOS));
        });
    }
}
__decorate([
    decorators_1.cache()
], RunIosCommand.prototype, "runCommand", null);
exports.RunIosCommand = RunIosCommand;
$injector.registerCommand("run|ios", RunIosCommand);
class RunAndroidCommand {
    constructor($platformsData, $devicePlatformsConstants, $errors, $injector, $platformService, $projectData, $options) {
        this.$platformsData = $platformsData;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.$errors = $errors;
        this.$injector = $injector;
        this.$platformService = $platformService;
        this.$projectData = $projectData;
        this.$options = $options;
        this.allowedParameters = [];
    }
    get runCommand() {
        const runCommand = this.$injector.resolve(RunCommandBase);
        runCommand.platform = this.platform;
        return runCommand;
    }
    get platform() {
        return this.$devicePlatformsConstants.Android;
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.runCommand.execute(args);
        });
    }
    canExecute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.runCommand.canExecute(args);
            if (!this.$platformService.isPlatformSupportedForOS(this.$devicePlatformsConstants.Android, this.$projectData)) {
                this.$errors.fail(`Applications for platform ${this.$devicePlatformsConstants.Android} can not be built on this OS`);
            }
            if (this.$options.release && (!this.$options.keyStorePath || !this.$options.keyStorePassword || !this.$options.keyStoreAlias || !this.$options.keyStoreAliasPassword)) {
                this.$errors.fail(constants_2.ANDROID_RELEASE_BUILD_ERROR_MESSAGE);
            }
            return this.$platformService.validateOptions(this.$options.provision, this.$options.teamId, this.$projectData, this.$platformsData.availablePlatforms.Android);
        });
    }
}
__decorate([
    decorators_1.cache()
], RunAndroidCommand.prototype, "runCommand", null);
exports.RunAndroidCommand = RunAndroidCommand;
$injector.registerCommand("run|android", RunAndroidCommand);
