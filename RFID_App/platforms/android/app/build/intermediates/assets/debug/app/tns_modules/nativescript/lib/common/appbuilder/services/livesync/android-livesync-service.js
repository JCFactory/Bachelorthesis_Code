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
const android_livesync_service_1 = require("../../../mobile/android/android-livesync-service");
const path = require("path");
const helpers = require("../../../helpers");
class AppBuilderAndroidLiveSyncService extends android_livesync_service_1.AndroidLiveSyncService {
    constructor(_device, $fs, $mobileHelper, $options) {
        super(_device, $fs, $mobileHelper);
        this.$options = $options;
    }
    refreshApplication(deviceAppData) {
        return __awaiter(this, void 0, void 0, function* () {
            const commands = [this.liveSyncCommands.SyncFilesCommand()];
            if (this.$options.watch || this.$options.file) {
                commands.push(this.liveSyncCommands.RefreshCurrentViewCommand());
            }
            else {
                commands.push(this.liveSyncCommands.ReloadStartViewCommand());
            }
            yield this.livesync(deviceAppData.appIdentifier, yield deviceAppData.getDeviceProjectRootPath(), commands);
        });
    }
    removeFiles(appIdentifier, localToDevicePaths) {
        return __awaiter(this, void 0, void 0, function* () {
            if (localToDevicePaths && localToDevicePaths.length) {
                const deviceProjectRootPath = localToDevicePaths[0].deviceProjectRootPath;
                const commands = _.map(localToDevicePaths, ldp => {
                    const relativePath = path.relative(deviceProjectRootPath, ldp.getDevicePath()), unixPath = helpers.fromWindowsRelativePathToUnix(relativePath);
                    return this.liveSyncCommands.DeleteFile(unixPath);
                });
                yield this.livesync(appIdentifier, deviceProjectRootPath, commands);
            }
        });
    }
}
exports.AppBuilderAndroidLiveSyncService = AppBuilderAndroidLiveSyncService;
$injector.register("androidLiveSyncServiceLocator", { factory: AppBuilderAndroidLiveSyncService });
