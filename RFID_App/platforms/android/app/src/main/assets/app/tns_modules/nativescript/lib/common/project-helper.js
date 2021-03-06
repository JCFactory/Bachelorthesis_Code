"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class ProjectHelper {
    constructor($logger, $fs, $staticConfig, $errors, $options) {
        this.$logger = $logger;
        this.$fs = $fs;
        this.$staticConfig = $staticConfig;
        this.$errors = $errors;
        this.$options = $options;
        this.cachedProjectDir = "";
    }
    get projectDir() {
        if (this.cachedProjectDir !== "") {
            return this.cachedProjectDir;
        }
        this.cachedProjectDir = null;
        let projectDir = path.resolve(this.$options.path || ".");
        while (true) {
            this.$logger.trace("Looking for project in '%s'", projectDir);
            const projectFilePath = path.join(projectDir, this.$staticConfig.PROJECT_FILE_NAME);
            if (this.$fs.exists(projectFilePath) && this.isProjectFileCorrect(projectFilePath)) {
                this.$logger.debug("Project directory is '%s'.", projectDir);
                this.cachedProjectDir = projectDir;
                break;
            }
            const dir = path.dirname(projectDir);
            if (dir === projectDir) {
                this.$logger.debug("No project found at or above '%s'.", this.$options.path || path.resolve("."));
                break;
            }
            projectDir = dir;
        }
        return this.cachedProjectDir;
    }
    generateDefaultAppId(appName, baseAppId) {
        let sanitizedName = this.sanitizeName(appName);
        if (sanitizedName) {
            if (/^\d+$/.test(sanitizedName)) {
                sanitizedName = "the" + sanitizedName;
            }
        }
        else {
            sanitizedName = "the";
        }
        return `${baseAppId}.${sanitizedName}`;
    }
    sanitizeName(appName) {
        const sanitizedName = _.filter(appName.split(""), (c) => /[a-zA-Z0-9]/.test(c)).join("");
        return sanitizedName;
    }
    isProjectFileCorrect(projectFilePath) {
        if (this.$staticConfig.CLIENT_NAME_KEY_IN_PROJECT_FILE) {
            try {
                const fileContent = this.$fs.readJson(projectFilePath);
                const clientSpecificData = fileContent[this.$staticConfig.CLIENT_NAME_KEY_IN_PROJECT_FILE];
                return !!clientSpecificData;
            }
            catch (err) {
                this.$errors.failWithoutHelp("The project file is corrupted. Additional technical information: %s", err);
            }
        }
        return true;
    }
}
exports.ProjectHelper = ProjectHelper;
$injector.register("projectHelper", ProjectHelper);
