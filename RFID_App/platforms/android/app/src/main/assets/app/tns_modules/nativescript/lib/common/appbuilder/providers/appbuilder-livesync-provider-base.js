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
class AppBuilderLiveSyncProviderBase {
    constructor($androidLiveSyncServiceLocator, $iosLiveSyncServiceLocator) {
        this.$androidLiveSyncServiceLocator = $androidLiveSyncServiceLocator;
        this.$iosLiveSyncServiceLocator = $iosLiveSyncServiceLocator;
    }
    get deviceSpecificLiveSyncServices() {
        return {
            android: (_device, $injector) => {
                return $injector.resolve(this.$androidLiveSyncServiceLocator.factory, { _device: _device });
            },
            ios: (_device, $injector) => {
                return $injector.resolve(this.$iosLiveSyncServiceLocator.factory, { _device: _device });
            }
        };
    }
    preparePlatformForSync(platform) {
        return;
    }
    canExecuteFastSync(filePath) {
        return false;
    }
    transferFiles(deviceAppData, localToDevicePaths, projectFilesPath, isFullSync) {
        return __awaiter(this, void 0, void 0, function* () {
            yield deviceAppData.device.fileSystem.transferFiles(deviceAppData, localToDevicePaths);
        });
    }
}
exports.AppBuilderLiveSyncProviderBase = AppBuilderLiveSyncProviderBase;
