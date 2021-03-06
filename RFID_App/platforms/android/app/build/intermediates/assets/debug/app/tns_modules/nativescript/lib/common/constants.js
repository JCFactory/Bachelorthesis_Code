"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProvisionType {
}
ProvisionType.Development = "Development";
ProvisionType.AdHoc = "AdHoc";
ProvisionType.AppStore = "AppStore";
ProvisionType.Enterprise = "Enterprise";
exports.ProvisionType = ProvisionType;
class DeviceTypes {
}
DeviceTypes.Emulator = "Emulator";
DeviceTypes.Simulator = "Simulator";
DeviceTypes.Device = "Device";
exports.DeviceTypes = DeviceTypes;
exports.APP_RESOURCES_FOLDER_NAME = "App_Resources";
exports.ERROR_NO_DEVICES = "Cannot find connected devices. Reconnect any connected devices, verify that your system recognizes them, and run this command again.";
exports.ERROR_CANT_USE_SIMULATOR = "You can use iOS simulator only on OS X.";
exports.ERROR_NO_DEVICES_CANT_USE_IOS_SIMULATOR = "Cannot find connected devices and cannot start iOS simulator on this OS.";
exports.ERROR_CANNOT_RESOLVE_DEVICE = "Cannot resolve the specified connected device. The provided platform does not match the provided index or identifier. To list currently connected devices and verify that the specified pair of platform and index or identifier exists, run 'device'.";
exports.ERROR_NO_VALID_SUBCOMMAND_FORMAT = "The input is not valid sub-command for '%s' command";
exports.UNREACHABLE_STATUS = "Unreachable";
exports.CONNECTED_STATUS = "Connected";
class LiveSyncConstants {
}
LiveSyncConstants.VERSION_2 = 2;
LiveSyncConstants.VERSION_3 = 3;
LiveSyncConstants.GUID = "12590FAA-5EDD-4B12-856D-F52A0A1599F2";
LiveSyncConstants.DEVICE_TMP_DIR_FORMAT_V2 = `/data/local/tmp/${LiveSyncConstants.GUID}/%s`;
LiveSyncConstants.ANDROID_FILES_PATH = `files/${LiveSyncConstants.GUID}`;
LiveSyncConstants.DEVICE_TMP_DIR_FORMAT_V3 = `/mnt/sdcard/Android/data/%s/${LiveSyncConstants.ANDROID_FILES_PATH}`;
LiveSyncConstants.CHECK_LIVESYNC_INTENT_NAME = "com.telerik.IsLiveSyncSupported";
LiveSyncConstants.IOS_PROJECT_PATH = "/Documents/AppBuilder/LiveSync";
exports.LiveSyncConstants = LiveSyncConstants;
class DeviceDiscoveryEventNames {
}
DeviceDiscoveryEventNames.DEVICE_FOUND = "deviceFound";
DeviceDiscoveryEventNames.DEVICE_LOST = "deviceLost";
exports.DeviceDiscoveryEventNames = DeviceDiscoveryEventNames;
exports.DEVICE_LOG_EVENT_NAME = "deviceLogData";
exports.TARGET_FRAMEWORK_IDENTIFIERS = {
    Cordova: "Cordova",
    NativeScript: "NativeScript"
};
class Configurations {
}
Configurations.Debug = "Debug";
Configurations.Release = "Release";
exports.Configurations = Configurations;
exports.NODE_MODULES_DIR_NAME = "node_modules";
exports.TNS_CORE_MODULES = "tns-core-modules";
class FileExtensions {
}
FileExtensions.TYPESCRIPT_DEFINITION_FILE = ".d.ts";
FileExtensions.TYPESCRIPT_FILE = ".ts";
FileExtensions.PNG_FILE = ".png";
FileExtensions.NINE_PATCH_PNG_FILE = ".9.png";
exports.FileExtensions = FileExtensions;
exports.IOS_POST_NOTIFICATION_COMMAND_TYPE = "PostNotification";
exports.IOS_OBSERVE_NOTIFICATION_COMMAND_TYPE = "ObserveNotification";
exports.IOS_RELAY_NOTIFICATION_COMMAND_TYPE = "RelayNotification";
class Proxy {
}
Proxy.CACHE_FILE_NAME = "proxy-cache.json";
Proxy.USE_PROXY = "USE_PROXY";
Proxy.PROXY_PORT = "PROXY_PORT";
Proxy.PROXY_HOSTNAME = "PROXY_HOSTNAME";
exports.Proxy = Proxy;
class HttpStatusCodes {
}
HttpStatusCodes.SEE_OTHER = 303;
HttpStatusCodes.PAYMENT_REQUIRED = 402;
HttpStatusCodes.PROXY_AUTHENTICATION_REQUIRED = 407;
exports.HttpStatusCodes = HttpStatusCodes;
exports.HttpProtocolToPort = {
    'http:': 80,
    'https:': 443
};
exports.DEFAULT_CHUNK_SIZE = 100;
exports.DEBUGGER_PORT_FOUND_EVENT_NAME = "DEBUGGER_PORT_FOUND";
exports.ATTACH_REQUEST_EVENT_NAME = "ATTACH_REQUEST";
