"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProjectConstants {
    constructor() {
        this.PROJECT_FILE = ".abproject";
        this.PROJECT_IGNORE_FILE = ".abignore";
        this.DEBUG_CONFIGURATION_NAME = "debug";
        this.DEBUG_PROJECT_FILE_NAME = ".debug.abproject";
        this.RELEASE_CONFIGURATION_NAME = "release";
        this.RELEASE_PROJECT_FILE_NAME = ".release.abproject";
        this.CORE_PLUGINS_PROPERTY_NAME = "CorePlugins";
        this.CORDOVA_PLUGIN_VARIABLES_PROPERTY_NAME = "CordovaPluginVariables";
        this.APPIDENTIFIER_PROPERTY_NAME = "AppIdentifier";
        this.EXPERIMENTAL_TAG = "Experimental";
        this.NATIVESCRIPT_APP_DIR_NAME = "app";
        this.IMAGE_DEFINITIONS_FILE_NAME = 'image-definitions.json';
        this.PACKAGE_JSON_NAME = "package.json";
        this.ADDITIONAL_FILE_DISPOSITION = "AdditionalFile";
        this.BUILD_RESULT_DISPOSITION = "BuildResult";
        this.ADDITIONAL_FILES_DIRECTORY = ".ab";
        this.REFERENCES_FILE_NAME = "abreferences.d.ts";
        this.OLD_REFERENCES_FILE_NAME = ".abreferences.d.ts";
        this.ANDROID_PLATFORM_NAME = "Android";
        this.IOS_PLATFORM_NAME = "iOS";
        this.WP8_PLATFORM_NAME = "WP8";
        this.TSCONFIG_JSON_NAME = "tsconfig.json";
        this.APPBUILDER_PROJECT_PLATFORMS_NAMES = {
            android: this.ANDROID_PLATFORM_NAME,
            ios: this.IOS_PLATFORM_NAME,
            wp8: this.WP8_PLATFORM_NAME
        };
        this.IONIC_PROJECT_PLATFORMS_NAMES = {
            android: "android",
            ios: "ios",
            wp8: "wp8"
        };
    }
}
exports.ProjectConstants = ProjectConstants;
$injector.register("projectConstants", ProjectConstants);
