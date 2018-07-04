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
class UpdatePlatformCommand {
    constructor($options, $projectData, $platformService, $platformEnvironmentRequirements, $errors) {
        this.$options = $options;
        this.$projectData = $projectData;
        this.$platformService = $platformService;
        this.$platformEnvironmentRequirements = $platformEnvironmentRequirements;
        this.$errors = $errors;
        this.allowedParameters = [];
        this.$projectData.initializeProjectData();
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$platformService.updatePlatforms(args, this.$options.platformTemplate, this.$projectData, this.$options);
        });
    }
    canExecute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!args || args.length === 0) {
                this.$errors.fail("No platform specified. Please specify platforms to update.");
            }
            _.each(args, arg => {
                const platform = arg.split("@")[0];
                this.$platformService.validatePlatform(platform, this.$projectData);
            });
            for (const arg of args) {
                const [platform, versionToBeInstalled] = arg.split("@");
                const argsToCheckEnvironmentRequirements = [platform];
                if (versionToBeInstalled) {
                    argsToCheckEnvironmentRequirements.push(this.$projectData.projectDir, versionToBeInstalled);
                }
                yield this.$platformEnvironmentRequirements.checkEnvironmentRequirements(...argsToCheckEnvironmentRequirements);
            }
            return true;
        });
    }
}
exports.UpdatePlatformCommand = UpdatePlatformCommand;
$injector.registerCommand("platform|update", UpdatePlatformCommand);
