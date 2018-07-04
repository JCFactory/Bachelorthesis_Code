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
class CleanCommand {
    constructor($options, $projectData, $platformService, $errors, $platformEnvironmentRequirements) {
        this.$options = $options;
        this.$projectData = $projectData;
        this.$platformService = $platformService;
        this.$errors = $errors;
        this.$platformEnvironmentRequirements = $platformEnvironmentRequirements;
        this.allowedParameters = [];
        this.$projectData.initializeProjectData();
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$platformService.cleanPlatforms(args, this.$options.platformTemplate, this.$projectData, this.$options);
        });
    }
    canExecute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!args || args.length === 0) {
                this.$errors.fail("No platform specified. Please specify a platform to clean");
            }
            _.each(args, platform => {
                this.$platformService.validatePlatform(platform, this.$projectData);
            });
            for (const platform of args) {
                this.$platformService.validatePlatformInstalled(platform, this.$projectData);
                const currentRuntimeVersion = this.$platformService.getCurrentPlatformVersion(platform, this.$projectData);
                yield this.$platformEnvironmentRequirements.checkEnvironmentRequirements(platform, this.$projectData.projectDir, currentRuntimeVersion);
            }
            return true;
        });
    }
}
exports.CleanCommand = CleanCommand;
$injector.registerCommand("platform|clean", CleanCommand);
