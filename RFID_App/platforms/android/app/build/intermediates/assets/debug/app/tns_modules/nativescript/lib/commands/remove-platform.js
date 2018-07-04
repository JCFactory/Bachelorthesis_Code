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
class RemovePlatformCommand {
    constructor($platformService, $projectData, $errors) {
        this.$platformService = $platformService;
        this.$projectData = $projectData;
        this.$errors = $errors;
        this.allowedParameters = [];
        this.$projectData.initializeProjectData();
    }
    execute(args) {
        return this.$platformService.removePlatforms(args, this.$projectData);
    }
    canExecute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!args || args.length === 0) {
                this.$errors.fail("No platform specified. Please specify a platform to remove");
            }
            _.each(args, platform => {
                this.$platformService.validatePlatform(platform, this.$projectData);
            });
            return true;
        });
    }
}
exports.RemovePlatformCommand = RemovePlatformCommand;
$injector.registerCommand("platform|remove", RemovePlatformCommand);
