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
const helpers = require("../common/helpers");
class ListPlatformsCommand {
    constructor($platformService, $projectData, $logger) {
        this.$platformService = $platformService;
        this.$projectData = $projectData;
        this.$logger = $logger;
        this.allowedParameters = [];
        this.$projectData.initializeProjectData();
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const installedPlatforms = this.$platformService.getInstalledPlatforms(this.$projectData);
            if (installedPlatforms.length > 0) {
                const preparedPlatforms = this.$platformService.getPreparedPlatforms(this.$projectData);
                if (preparedPlatforms.length > 0) {
                    this.$logger.out("The project is prepared for: ", helpers.formatListOfNames(preparedPlatforms, "and"));
                }
                else {
                    this.$logger.out("The project is not prepared for any platform");
                }
                this.$logger.out("Installed platforms: ", helpers.formatListOfNames(installedPlatforms, "and"));
            }
            else {
                const formattedPlatformsList = helpers.formatListOfNames(this.$platformService.getAvailablePlatforms(this.$projectData), "and");
                this.$logger.out("Available platforms for this OS: ", formattedPlatformsList);
                this.$logger.out("No installed platforms found. Use $ tns platform add");
            }
        });
    }
}
exports.ListPlatformsCommand = ListPlatformsCommand;
$injector.registerCommand("platform|*list", ListPlatformsCommand);
