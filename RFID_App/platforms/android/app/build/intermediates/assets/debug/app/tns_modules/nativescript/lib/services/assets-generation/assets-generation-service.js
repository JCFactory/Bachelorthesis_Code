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
const Jimp = require("jimp");
const Color = require("color");
const decorators_1 = require("../../common/decorators");
const constants_1 = require("../../constants");
class AssetsGenerationService {
    constructor($logger, $projectDataService) {
        this.$logger = $logger;
        this.$projectDataService = $projectDataService;
    }
    get propertiesToEnumerate() {
        return {
            icon: ["icons"],
            splash: ["splashBackgrounds", "splashCenterImages", "splashImages"]
        };
    }
    generateIcons(resourceGenerationData) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$logger.info("Generating icons ...");
            yield this.generateImagesForDefinitions(resourceGenerationData, this.propertiesToEnumerate.icon);
            this.$logger.info("Icons generation completed.");
        });
    }
    generateSplashScreens(splashesGenerationData) {
        return __awaiter(this, void 0, void 0, function* () {
            this.$logger.info("Generating splash screens ...");
            yield this.generateImagesForDefinitions(splashesGenerationData, this.propertiesToEnumerate.splash);
            this.$logger.info("Splash screens generation completed.");
        });
    }
    generateImagesForDefinitions(generationData, propertiesToEnumerate) {
        return __awaiter(this, void 0, void 0, function* () {
            generationData.background = generationData.background || "white";
            const assetsStructure = yield this.$projectDataService.getAssetsStructure(generationData);
            const assetItems = _(assetsStructure)
                .filter((assetGroup, platform) => !generationData.platform || platform.toLowerCase() === generationData.platform.toLowerCase())
                .map((assetGroup) => _.filter(assetGroup, (assetSubGroup, imageTypeKey) => assetSubGroup && propertiesToEnumerate.indexOf(imageTypeKey) !== -1))
                .flatten()
                .map(assetSubGroup => assetSubGroup.images)
                .flatten()
                .filter(assetItem => !!assetItem.filename)
                .value();
            for (const assetItem of assetItems) {
                const operation = assetItem.resizeOperation || "resize";
                let tempScale = null;
                if (assetItem.scale) {
                    if (_.isNumber(assetItem.scale)) {
                        tempScale = assetItem.scale;
                    }
                    else {
                        const splittedElements = `${assetItem.scale}`.split(constants_1.AssetConstants.sizeDelimiter);
                        tempScale = splittedElements && splittedElements.length && splittedElements[0] && +splittedElements[0];
                    }
                }
                const scale = tempScale || constants_1.AssetConstants.defaultScale;
                const outputPath = assetItem.path;
                const width = assetItem.width * scale;
                const height = assetItem.height * scale;
                switch (operation) {
                    case "overlayWith":
                        const overlayImageScale = assetItem.overlayImageScale || constants_1.AssetConstants.defaultOverlayImageScale;
                        const imageResize = Math.round(Math.min(width, height) * overlayImageScale);
                        const image = yield this.resize(generationData.imagePath, imageResize, imageResize);
                        yield this.generateImage(generationData.background, width, height, outputPath, image);
                        break;
                    case "blank":
                        yield this.generateImage(generationData.background, width, height, outputPath);
                        break;
                    case "resize":
                        const resizedImage = yield this.resize(generationData.imagePath, width, height);
                        resizedImage.write(outputPath);
                        break;
                    default:
                        throw new Error(`Invalid image generation operation: ${operation}`);
                }
            }
        });
    }
    resize(imagePath, width, height) {
        return __awaiter(this, void 0, void 0, function* () {
            const image = yield Jimp.read(imagePath);
            return image.scaleToFit(width, height);
        });
    }
    generateImage(background, width, height, outputPath, overlayImage) {
        const J = Jimp;
        const backgroundColor = this.getRgbaNumber(background);
        let image = new J(width, height, backgroundColor);
        if (overlayImage) {
            const centeredWidth = (width - overlayImage.bitmap.width) / 2;
            const centeredHeight = (height - overlayImage.bitmap.height) / 2;
            image = image.composite(overlayImage, centeredWidth, centeredHeight);
        }
        image.write(outputPath);
    }
    getRgbaNumber(colorString) {
        const color = new Color(colorString);
        const colorRgb = color.rgb();
        const alpha = Math.round(colorRgb.alpha() * 255);
        return Jimp.rgbaToInt(colorRgb.red(), colorRgb.green(), colorRgb.blue(), alpha);
    }
}
__decorate([
    decorators_1.exported("assetsGenerationService")
], AssetsGenerationService.prototype, "generateIcons", null);
__decorate([
    decorators_1.exported("assetsGenerationService")
], AssetsGenerationService.prototype, "generateSplashScreens", null);
exports.AssetsGenerationService = AssetsGenerationService;
$injector.register("assetsGenerationService", AssetsGenerationService);
