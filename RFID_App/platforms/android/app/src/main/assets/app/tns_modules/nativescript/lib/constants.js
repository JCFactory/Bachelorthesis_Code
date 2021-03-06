"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("colors");
exports.APP_FOLDER_NAME = "app";
exports.APP_RESOURCES_FOLDER_NAME = "App_Resources";
exports.PROJECT_FRAMEWORK_FOLDER_NAME = "framework";
exports.NATIVESCRIPT_KEY_NAME = "nativescript";
exports.NODE_MODULES_FOLDER_NAME = "node_modules";
exports.TNS_MODULES_FOLDER_NAME = "tns_modules";
exports.TNS_CORE_MODULES_NAME = "tns-core-modules";
exports.TNS_ANDROID_RUNTIME_NAME = "tns-android";
exports.TNS_IOS_RUNTIME_NAME = "tns-ios";
exports.PACKAGE_JSON_FILE_NAME = "package.json";
exports.NODE_MODULE_CACHE_PATH_KEY_NAME = "node-modules-cache-path";
exports.DEFAULT_APP_IDENTIFIER_PREFIX = "org.nativescript";
exports.LIVESYNC_EXCLUDED_DIRECTORIES = ["app_resources"];
exports.TESTING_FRAMEWORKS = ['jasmine', 'mocha', 'qunit'];
exports.TEST_RUNNER_NAME = "nativescript-unit-test-runner";
exports.LIVESYNC_EXCLUDED_FILE_PATTERNS = ["**/*.js.map", "**/*.ts"];
exports.XML_FILE_EXTENSION = ".xml";
exports.PLATFORMS_DIR_NAME = "platforms";
exports.HOOKS_DIR_NAME = "hooks";
exports.LIB_DIR_NAME = "lib";
exports.CODE_SIGN_ENTITLEMENTS = "CODE_SIGN_ENTITLEMENTS";
exports.AWAIT_NOTIFICATION_TIMEOUT_SECONDS = 9;
exports.SRC_DIR = "src";
exports.MAIN_DIR = "main";
exports.ASSETS_DIR = "assets";
exports.MANIFEST_FILE_NAME = "AndroidManifest.xml";
exports.APP_GRADLE_FILE_NAME = "app.gradle";
exports.INFO_PLIST_FILE_NAME = "Info.plist";
exports.INCLUDE_GRADLE_NAME = "include.gradle";
exports.BUILD_XCCONFIG_FILE_NAME = "build.xcconfig";
exports.BUILD_DIR = "build";
exports.OUTPUTS_DIR = "outputs";
exports.APK_DIR = "apk";
exports.RESOURCES_DIR = "res";
exports.CONFIG_NS_FILE_NAME = "nsconfig.json";
exports.CONFIG_NS_APP_RESOURCES_ENTRY = "appResourcesPath";
exports.CONFIG_NS_APP_ENTRY = "appPath";
exports.DEPENDENCIES_JSON_NAME = "dependencies.json";
exports.APK_EXTENSION_NAME = ".apk";
class PackageVersion {
}
PackageVersion.NEXT = "next";
PackageVersion.LATEST = "latest";
PackageVersion.RC = "rc";
exports.PackageVersion = PackageVersion;
const liveSyncOperation = "LiveSync Operation";
class LiveSyncTrackActionNames {
}
LiveSyncTrackActionNames.LIVESYNC_OPERATION = liveSyncOperation;
LiveSyncTrackActionNames.LIVESYNC_OPERATION_BUILD = `${liveSyncOperation} - Build`;
LiveSyncTrackActionNames.DEVICE_INFO = `Device Info for ${liveSyncOperation}`;
exports.LiveSyncTrackActionNames = LiveSyncTrackActionNames;
exports.PackageJsonKeysToKeep = ["name", "main", "android", "version", "pluginsData"];
class SaveOptions {
}
SaveOptions.PRODUCTION = "save";
SaveOptions.DEV = "save-dev";
SaveOptions.OPTIONAL = "save-optional";
SaveOptions.EXACT = "save-exact";
exports.SaveOptions = SaveOptions;
class ReleaseType {
}
ReleaseType.MAJOR = "major";
ReleaseType.PREMAJOR = "premajor";
ReleaseType.MINOR = "minor";
ReleaseType.PREMINOR = "preminor";
ReleaseType.PATCH = "patch";
ReleaseType.PREPATCH = "prepatch";
ReleaseType.PRERELEASE = "prerelease";
exports.ReleaseType = ReleaseType;
exports.RESERVED_TEMPLATE_NAMES = {
    "default": "tns-template-hello-world",
    "tsc": "tns-template-hello-world-ts",
    "typescript": "tns-template-hello-world-ts",
    "ng": "tns-template-hello-world-ng",
    "angular": "tns-template-hello-world-ng"
};
exports.ANALYTICS_LOCAL_TEMPLATE_PREFIX = "localTemplate_";
class ITMSConstants {
}
ITMSConstants.ApplicationMetadataFile = "metadata.xml";
ITMSConstants.VerboseLoggingLevels = {
    Informational: "informational",
    Verbose: "detailed"
};
ITMSConstants.iTMSExecutableName = "iTMSTransporter";
ITMSConstants.iTMSDirectoryName = "itms";
exports.ITMSConstants = ITMSConstants;
class ItunesConnectApplicationTypesClass {
    constructor() {
        this.iOS = "iOS App";
        this.Mac = "Mac OS X App";
    }
}
exports.ItunesConnectApplicationTypes = new ItunesConnectApplicationTypesClass();
class LiveSyncPaths {
}
LiveSyncPaths.SYNC_DIR_NAME = "sync";
LiveSyncPaths.REMOVEDSYNC_DIR_NAME = "removedsync";
LiveSyncPaths.FULLSYNC_DIR_NAME = "fullsync";
LiveSyncPaths.IOS_DEVICE_PROJECT_ROOT_PATH = "Library/Application Support/LiveSync";
LiveSyncPaths.IOS_DEVICE_SYNC_ZIP_PATH = "Library/Application Support/LiveSync/sync.zip";
exports.LiveSyncPaths = LiveSyncPaths;
exports.ANGULAR_NAME = "angular";
exports.TYPESCRIPT_NAME = "typescript";
exports.BUILD_OUTPUT_EVENT_NAME = "buildOutput";
exports.CONNECTION_ERROR_EVENT_NAME = "connectionError";
exports.USER_INTERACTION_NEEDED_EVENT_NAME = "userInteractionNeeded";
exports.DEBUGGER_ATTACHED_EVENT_NAME = "debuggerAttached";
exports.DEBUGGER_DETACHED_EVENT_NAME = "debuggerDetached";
exports.VERSION_STRING = "version";
exports.INSPECTOR_CACHE_DIRNAME = "ios-inspector";
exports.POST_INSTALL_COMMAND_NAME = "post-install-cli";
exports.ANDROID_RELEASE_BUILD_ERROR_MESSAGE = "When producing a release build, you need to specify all --key-store-* options.";
class DebugCommandErrors {
}
DebugCommandErrors.UNABLE_TO_USE_FOR_DEVICE_AND_EMULATOR = "The options --for-device and --emulator cannot be used simultaneously. Please use only one of them.";
DebugCommandErrors.NO_DEVICES_EMULATORS_FOUND_FOR_OPTIONS = "Unable to find device or emulator for specified options.";
DebugCommandErrors.UNSUPPORTED_DEVICE_OS_FOR_DEBUGGING = "Unsupported device OS for debugging";
exports.DebugCommandErrors = DebugCommandErrors;
exports.AnalyticsEventLabelDelimiter = "__";
exports.NATIVESCRIPT_CLOUD_EXTENSION_NAME = "nativescript-cloud";
exports.NATIVESCRIPT_PROPS_INTERNAL_DELIMITER = "**|__**";
exports.CLI_RESOURCES_DIR_NAME = "resources";
class AssetConstants {
}
AssetConstants.iOSResourcesFileName = "Contents.json";
AssetConstants.iOSAssetsDirName = "Assets.xcassets";
AssetConstants.iOSIconsDirName = "AppIcon.appiconset";
AssetConstants.iOSSplashBackgroundsDirName = "LaunchScreen.AspectFill.imageset";
AssetConstants.iOSSplashCenterImagesDirName = "LaunchScreen.Center.imageset";
AssetConstants.iOSSplashImagesDirName = "LaunchImage.launchimage";
AssetConstants.imageDefinitionsFileName = "image-definitions.json";
AssetConstants.assets = "assets";
AssetConstants.sizeDelimiter = "x";
AssetConstants.defaultScale = 1;
AssetConstants.defaultOverlayImageScale = 0.8;
exports.AssetConstants = AssetConstants;
class MacOSVersions {
}
MacOSVersions.Sierra = "10.12";
MacOSVersions.HighSierra = "10.13";
exports.MacOSVersions = MacOSVersions;
exports.MacOSDeprecationStringFormat = "Support for macOS %s is deprecated and will be removed in one of the next releases of NativeScript. Please, upgrade to the latest macOS version.";
exports.PROGRESS_PRIVACY_POLICY_URL = "https://www.progress.com/legal/privacy-policy";
class SubscribeForNewsletterMessages {
}
SubscribeForNewsletterMessages.AgreeToReceiveEmailMsg = "I agree to receive email communications from Progress Software or its Partners (`https://www.progress.com/partners/partner-directory`)," +
    "containing information about Progress Software's products. Consent may be withdrawn at any time.";
SubscribeForNewsletterMessages.ReviewPrivacyPolicyMsg = `You can review the Progress Software Privacy Policy at \`${exports.PROGRESS_PRIVACY_POLICY_URL}\``;
SubscribeForNewsletterMessages.PromptMsg = "Input your e-mail address to agree".green + " or " + "leave empty to decline".red.bold + ":";
exports.SubscribeForNewsletterMessages = SubscribeForNewsletterMessages;
class TemplateVersions {
}
TemplateVersions.v1 = "v1";
TemplateVersions.v2 = "v2";
exports.TemplateVersions = TemplateVersions;
class ProjectTemplateErrors {
}
ProjectTemplateErrors.InvalidTemplateVersionStringFormat = "The template '%s' has a NativeScript version '%s' that is not supported. Unable to create project from it.";
exports.ProjectTemplateErrors = ProjectTemplateErrors;
class Hooks {
}
Hooks.createProject = "createProject";
exports.Hooks = Hooks;
exports.PACKAGE_PLACEHOLDER_NAME = "__PACKAGE__";
