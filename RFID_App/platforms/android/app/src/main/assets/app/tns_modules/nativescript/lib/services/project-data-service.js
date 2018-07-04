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
const path = require("path");
const project_data_1 = require("../project-data");
const decorators_1 = require("../common/decorators");
const constants_1 = require("../constants");
class ProjectDataService {
    constructor($fs, $staticConfig, $logger, $devicePlatformsConstants, $androidResourcesMigrationService, $injector) {
        this.$fs = $fs;
        this.$staticConfig = $staticConfig;
        this.$logger = $logger;
        this.$devicePlatformsConstants = $devicePlatformsConstants;
        this.$androidResourcesMigrationService = $androidResourcesMigrationService;
        this.$injector = $injector;
    }
    getNSValue(projectDir, propertyName) {
        return this.getValue(projectDir, this.getNativeScriptPropertyName(propertyName));
    }
    setNSValue(projectDir, key, value) {
        this.setValue(projectDir, this.getNativeScriptPropertyName(key), value);
    }
    removeNSProperty(projectDir, propertyName) {
        this.removeProperty(projectDir, this.getNativeScriptPropertyName(propertyName));
    }
    removeDependency(projectDir, dependencyName) {
        const projectFileInfo = this.getProjectFileData(projectDir);
        delete projectFileInfo.projectData[ProjectDataService.DEPENDENCIES_KEY_NAME][dependencyName];
        this.$fs.writeJson(projectFileInfo.projectFilePath, projectFileInfo.projectData);
    }
    getProjectData(projectDir) {
        const projectDataInstance = this.$injector.resolve(project_data_1.ProjectData);
        projectDataInstance.initializeProjectData(projectDir);
        return projectDataInstance;
    }
    getProjectDataFromContent(packageJsonContent, nsconfigContent, projectDir) {
        const projectDataInstance = this.$injector.resolve(project_data_1.ProjectData);
        projectDataInstance.initializeProjectDataFromContent(packageJsonContent, nsconfigContent, projectDir);
        return projectDataInstance;
    }
    getAssetsStructure(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const iOSAssetStructure = yield this.getIOSAssetsStructure(opts);
            const androidAssetStructure = yield this.getAndroidAssetsStructure(opts);
            this.$logger.trace("iOS Assets structure:", JSON.stringify(iOSAssetStructure, null, 2));
            this.$logger.trace("Android Assets structure:", JSON.stringify(androidAssetStructure, null, 2));
            return {
                ios: iOSAssetStructure,
                android: androidAssetStructure
            };
        });
    }
    getIOSAssetsStructure(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectDir = opts.projectDir;
            const projectData = this.getProjectData(projectDir);
            const basePath = path.join(projectData.appResourcesDirectoryPath, this.$devicePlatformsConstants.iOS, constants_1.AssetConstants.iOSAssetsDirName);
            const pathToIcons = path.join(basePath, constants_1.AssetConstants.iOSIconsDirName);
            const icons = yield this.getIOSAssetSubGroup(pathToIcons);
            const pathToSplashBackgrounds = path.join(basePath, constants_1.AssetConstants.iOSSplashBackgroundsDirName);
            const splashBackgrounds = yield this.getIOSAssetSubGroup(pathToSplashBackgrounds);
            const pathToSplashCenterImages = path.join(basePath, constants_1.AssetConstants.iOSSplashCenterImagesDirName);
            const splashCenterImages = yield this.getIOSAssetSubGroup(pathToSplashCenterImages);
            const pathToSplashImages = path.join(basePath, constants_1.AssetConstants.iOSSplashImagesDirName);
            const splashImages = yield this.getIOSAssetSubGroup(pathToSplashImages);
            return {
                icons,
                splashBackgrounds,
                splashCenterImages,
                splashImages
            };
        });
    }
    getAndroidAssetsStructure(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectDir = opts.projectDir;
            const projectData = this.getProjectData(projectDir);
            const pathToAndroidDir = path.join(projectData.appResourcesDirectoryPath, this.$devicePlatformsConstants.Android);
            const hasMigrated = this.$androidResourcesMigrationService.hasMigrated(projectData.appResourcesDirectoryPath);
            const basePath = hasMigrated ? path.join(pathToAndroidDir, constants_1.SRC_DIR, constants_1.MAIN_DIR, constants_1.RESOURCES_DIR) : pathToAndroidDir;
            const currentStructure = this.$fs.enumerateFilesInDirectorySync(basePath);
            const content = this.getImageDefinitions().android;
            return {
                icons: this.getAndroidAssetSubGroup(content.icons, currentStructure),
                splashBackgrounds: this.getAndroidAssetSubGroup(content.splashBackgrounds, currentStructure),
                splashCenterImages: this.getAndroidAssetSubGroup(content.splashCenterImages, currentStructure),
                splashImages: null
            };
        });
    }
    getImageDefinitions() {
        const pathToImageDefinitions = path.join(__dirname, "..", "..", constants_1.CLI_RESOURCES_DIR_NAME, constants_1.AssetConstants.assets, constants_1.AssetConstants.imageDefinitionsFileName);
        const imageDefinitions = this.$fs.readJson(pathToImageDefinitions);
        return imageDefinitions;
    }
    getIOSAssetSubGroup(dirPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const pathToContentJson = path.join(dirPath, constants_1.AssetConstants.iOSResourcesFileName);
            const content = this.$fs.exists(pathToContentJson) && this.$fs.readJson(pathToContentJson) || { images: [] };
            const imageDefinitions = this.getImageDefinitions().ios;
            _.each(content && content.images, image => {
                if (image.filename) {
                    image.path = path.join(dirPath, image.filename);
                }
                _.each(imageDefinitions, (assetSubGroup) => {
                    const assetItem = _.find(assetSubGroup, assetElement => assetElement.filename === image.filename && path.basename(assetElement.directory) === path.basename(dirPath));
                    if (image.size) {
                        const [width, height] = image.size.toString().split(constants_1.AssetConstants.sizeDelimiter);
                        if (width && height) {
                            image.width = +width;
                            image.height = +height;
                        }
                    }
                    if (assetItem) {
                        if (!image.width || !image.height) {
                            image.width = assetItem.width;
                            image.height = assetItem.height;
                            image.size = image.size || `${assetItem.width}${constants_1.AssetConstants.sizeDelimiter}${assetItem.height}`;
                        }
                        image.resizeOperation = image.resizeOperation || assetItem.resizeOperation;
                        image.overlayImageScale = image.overlayImageScale || assetItem.overlayImageScale;
                        image.scale = image.scale || assetItem.scale;
                        return false;
                    }
                });
            });
            return content;
        });
    }
    getAndroidAssetSubGroup(assetItems, realPaths) {
        const assetSubGroup = {
            images: []
        };
        const normalizedPaths = _.map(realPaths, p => path.normalize(p));
        _.each(assetItems, assetItem => {
            _.each(normalizedPaths, currentNormalizedPath => {
                const imagePath = path.join(assetItem.directory, assetItem.filename);
                if (currentNormalizedPath.indexOf(path.normalize(imagePath)) !== -1) {
                    assetItem.path = currentNormalizedPath;
                    assetItem.size = `${assetItem.width}${constants_1.AssetConstants.sizeDelimiter}${assetItem.height}`;
                    assetSubGroup.images.push(assetItem);
                    return false;
                }
            });
        });
        return assetSubGroup;
    }
    getValue(projectDir, propertyName) {
        const projectData = this.getProjectFileData(projectDir).projectData;
        if (projectData) {
            try {
                return this.getPropertyValueFromJson(projectData, propertyName);
            }
            catch (err) {
                this.$logger.trace(`Error while trying to get property ${propertyName} from ${projectDir}. Error is:`, err);
            }
        }
        return null;
    }
    getNativeScriptPropertyName(propertyName) {
        return `${this.$staticConfig.CLIENT_NAME_KEY_IN_PROJECT_FILE}${constants_1.NATIVESCRIPT_PROPS_INTERNAL_DELIMITER}${propertyName}`;
    }
    getPropertyValueFromJson(jsonData, dottedPropertyName) {
        const props = dottedPropertyName.split(constants_1.NATIVESCRIPT_PROPS_INTERNAL_DELIMITER);
        let result = jsonData[props.shift()];
        for (const prop of props) {
            result = result[prop];
        }
        return result;
    }
    setValue(projectDir, key, value) {
        const projectFileInfo = this.getProjectFileData(projectDir);
        const props = key.split(constants_1.NATIVESCRIPT_PROPS_INTERNAL_DELIMITER);
        const data = projectFileInfo.projectData;
        let currentData = data;
        _.each(props, (prop, index) => {
            if (index === (props.length - 1)) {
                currentData[prop] = value;
            }
            else {
                currentData[prop] = currentData[prop] || Object.create(null);
            }
            currentData = currentData[prop];
        });
        this.$fs.writeJson(projectFileInfo.projectFilePath, data);
    }
    removeProperty(projectDir, propertyName) {
        const projectFileInfo = this.getProjectFileData(projectDir);
        const data = projectFileInfo.projectData;
        let currentData = data;
        const props = propertyName.split(constants_1.NATIVESCRIPT_PROPS_INTERNAL_DELIMITER);
        const propertyToDelete = props.splice(props.length - 1, 1)[0];
        _.each(props, (prop) => {
            currentData = currentData[prop];
        });
        delete currentData[propertyToDelete];
        this.$fs.writeJson(projectFileInfo.projectFilePath, data);
    }
    getProjectFileData(projectDir) {
        const projectFilePath = path.join(projectDir, this.$staticConfig.PROJECT_FILE_NAME);
        const projectFileContent = this.$fs.readText(projectFilePath);
        const projectData = projectFileContent ? JSON.parse(projectFileContent) : Object.create(null);
        return {
            projectData,
            projectFilePath
        };
    }
    getNsConfigDefaultContent(data) {
        const config = {};
        Object.assign(config, data);
        return JSON.stringify(config);
    }
}
ProjectDataService.DEPENDENCIES_KEY_NAME = "dependencies";
__decorate([
    decorators_1.exported("projectDataService")
], ProjectDataService.prototype, "getProjectData", null);
__decorate([
    decorators_1.exported("projectDataService")
], ProjectDataService.prototype, "getProjectDataFromContent", null);
__decorate([
    decorators_1.exported("projectDataService")
], ProjectDataService.prototype, "getAssetsStructure", null);
__decorate([
    decorators_1.exported("projectDataService")
], ProjectDataService.prototype, "getIOSAssetsStructure", null);
__decorate([
    decorators_1.exported("projectDataService")
], ProjectDataService.prototype, "getAndroidAssetsStructure", null);
__decorate([
    decorators_1.exported("projectDataService")
], ProjectDataService.prototype, "getNsConfigDefaultContent", null);
exports.ProjectDataService = ProjectDataService;
$injector.register("projectDataService", ProjectDataService);
