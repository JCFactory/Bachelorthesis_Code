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
class ResourcesUpdateCommand {
    constructor($projectData, $errors, $androidResourcesMigrationService) {
        this.$projectData = $projectData;
        this.$errors = $errors;
        this.$androidResourcesMigrationService = $androidResourcesMigrationService;
        this.allowedParameters = [];
        this.$projectData.initializeProjectData();
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$androidResourcesMigrationService.migrate(this.$projectData.getAppResourcesDirectoryPath());
        });
    }
    canExecute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!args || args.length === 0) {
                args = ["android"];
            }
            for (const platform of args) {
                if (!this.$androidResourcesMigrationService.canMigrate(platform)) {
                    this.$errors.failWithoutHelp(`The ${platform} does not need to have its resources updated.`);
                }
                if (this.$androidResourcesMigrationService.hasMigrated(this.$projectData.getAppResourcesDirectoryPath())) {
                    this.$errors.failWithoutHelp("The App_Resources have already been updated for the Android platform.");
                }
            }
            return true;
        });
    }
}
exports.ResourcesUpdateCommand = ResourcesUpdateCommand;
$injector.registerCommand("resources|update", ResourcesUpdateCommand);
