"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minimatch = require("minimatch");
const constants = require("../constants");
const path = require("path");
const project_files_provider_base_1 = require("../common/services/project-files-provider-base");
class ProjectFilesProvider extends project_files_provider_base_1.ProjectFilesProviderBase {
    constructor($platformsData, $mobileHelper, $options) {
        super($mobileHelper, $options);
        this.$platformsData = $platformsData;
    }
    mapFilePath(filePath, platform, projectData, projectFilesConfig) {
        const platformData = this.$platformsData.getPlatformData(platform.toLowerCase(), projectData);
        const parsedFilePath = this.getPreparedFilePath(filePath, projectFilesConfig);
        let mappedFilePath = "";
        let relativePath;
        if (parsedFilePath.indexOf(constants.NODE_MODULES_FOLDER_NAME) > -1) {
            relativePath = path.relative(path.join(projectData.projectDir, constants.NODE_MODULES_FOLDER_NAME), parsedFilePath);
            mappedFilePath = path.join(platformData.appDestinationDirectoryPath, constants.APP_FOLDER_NAME, constants.TNS_MODULES_FOLDER_NAME, relativePath);
        }
        else {
            relativePath = path.relative(projectData.appDirectoryPath, parsedFilePath);
            mappedFilePath = path.join(platformData.appDestinationDirectoryPath, constants.APP_FOLDER_NAME, relativePath);
        }
        const appResourcesDirectoryPath = projectData.appResourcesDirectoryPath;
        const platformSpecificAppResourcesDirectoryPath = path.join(appResourcesDirectoryPath, platformData.normalizedPlatformName);
        if (parsedFilePath.indexOf(appResourcesDirectoryPath) > -1 && parsedFilePath.indexOf(platformSpecificAppResourcesDirectoryPath) === -1) {
            return null;
        }
        if (parsedFilePath.indexOf(platformSpecificAppResourcesDirectoryPath) > -1) {
            const appResourcesRelativePath = path.relative(path.join(projectData.appResourcesDirectoryPath, platformData.normalizedPlatformName), parsedFilePath);
            mappedFilePath = path.join(platformData.platformProjectService.getAppResourcesDestinationDirectoryPath(projectData), appResourcesRelativePath);
        }
        return mappedFilePath;
    }
    isFileExcluded(filePath) {
        return !!_.find(ProjectFilesProvider.INTERNAL_NONPROJECT_FILES, (pattern) => minimatch(filePath, pattern, { nocase: true }));
    }
}
ProjectFilesProvider.INTERNAL_NONPROJECT_FILES = ["**/*.ts"];
exports.ProjectFilesProvider = ProjectFilesProvider;
$injector.register("projectFilesProvider", ProjectFilesProvider);
