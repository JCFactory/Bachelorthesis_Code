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
const os = require("os");
const temp = require("temp");
const decorators_1 = require("../decorators");
const constants_1 = require("../constants");
const semver_1 = require("semver");
temp.track();
class TypeScriptService {
    constructor($childProcess, $fs, $logger, $npmService, $options, $projectConstants, $processService, $errors) {
        this.$childProcess = $childProcess;
        this.$fs = $fs;
        this.$logger = $logger;
        this.$npmService = $npmService;
        this.$options = $options;
        this.$projectConstants = $projectConstants;
        this.$processService = $processService;
        this.$errors = $errors;
    }
    transpile(projectDir, typeScriptFiles, definitionFiles, options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || {};
            const compilerOptions = this.getCompilerOptions(projectDir, options);
            const typeScriptCompilerSettings = yield this.getTypeScriptCompilerSettings({ useLocalTypeScriptCompiler: options.useLocalTypeScriptCompiler }, projectDir);
            this.noEmitOnError = compilerOptions.noEmitOnError;
            this.typeScriptFiles = typeScriptFiles || [];
            this.definitionFiles = definitionFiles || [];
            const runTranspilationOptions = { compilerOptions };
            if (this.typeScriptFiles.length > 0) {
                let typeScriptDefinitionsFiles = [];
                if (!this.hasTsConfigFile(projectDir)) {
                    typeScriptDefinitionsFiles = this.getDefaultTypeScriptDefinitionsFiles(options.pathToDefaultDefinitionFiles);
                }
                typeScriptDefinitionsFiles = typeScriptDefinitionsFiles.concat(this.getTypeScriptFilesData(projectDir).definitionFiles);
                const filesToTranspile = this.typeScriptFiles.concat(typeScriptDefinitionsFiles);
                this.$logger.out("Compiling...".yellow);
                _.each(this.typeScriptFiles, file => {
                    this.$logger.out(`### Compile ${file}`.cyan);
                });
                runTranspilationOptions.filesToTranspile = filesToTranspile;
            }
            this.$logger.out(`Using tsc version ${typeScriptCompilerSettings.version}`.cyan);
            yield this.runTranspilation(projectDir, typeScriptCompilerSettings.pathToCompiler, runTranspilationOptions);
        });
    }
    getTypeScriptFilesData(projectDir) {
        const rootNodeModules = path.join(projectDir, constants_1.NODE_MODULES_DIR_NAME);
        const projectFiles = this.$fs.enumerateFilesInDirectorySync(projectDir, (fileName, fstat) => fileName !== rootNodeModules);
        const typeScriptFiles = _.filter(projectFiles, this.isTypeScriptFile);
        const definitionFiles = _.filter(typeScriptFiles, file => _.endsWith(file, constants_1.FileExtensions.TYPESCRIPT_DEFINITION_FILE));
        return { definitionFiles: definitionFiles, typeScriptFiles: _.difference(typeScriptFiles, definitionFiles) };
    }
    isTypeScriptProject(projectDir) {
        const typeScriptFilesData = this.getTypeScriptFilesData(projectDir);
        return !!typeScriptFilesData.typeScriptFiles.length;
    }
    isTypeScriptFile(file) {
        return path.extname(file) === constants_1.FileExtensions.TYPESCRIPT_FILE;
    }
    hasTsConfigFile(projectDir) {
        return this.$fs.exists(this.getPathToTsConfigFile(projectDir));
    }
    getPathToTsConfigFile(projectDir) {
        return path.join(projectDir, this.$projectConstants.TSCONFIG_JSON_NAME);
    }
    getCompilerOptions(projectDir, options) {
        let tsConfigFile;
        const pathToConfigJsonFile = this.getPathToTsConfigFile(projectDir);
        if (this.hasTsConfigFile(projectDir)) {
            tsConfigFile = this.$fs.readJson(pathToConfigJsonFile);
        }
        tsConfigFile = tsConfigFile || { compilerOptions: {} };
        const compilerOptions = options.compilerOptions || {};
        const defaultOptions = options.defaultCompilerOptions || {};
        const compilerOptionsKeys = _.union(_.keys(compilerOptions), _.keys(tsConfigFile.compilerOptions), _.keys(defaultOptions));
        const result = {};
        _.each(compilerOptionsKeys, (key) => {
            result[key] = this.getCompilerOptionByKey(key, compilerOptions, tsConfigFile.compilerOptions, defaultOptions);
        });
        result.noEmitOnError = result.noEmitOnError || false;
        return result;
    }
    getCompilerOptionByKey(key, compilerOptions, tsConfigFileOptions, defaultOptions) {
        if (_.has(compilerOptions, key)) {
            return compilerOptions[key];
        }
        if (_.has(tsConfigFileOptions, key)) {
            return tsConfigFileOptions[key];
        }
        return defaultOptions[key];
    }
    getTypeScriptCompilerSettings(options, projectDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const typeScriptInNodeModulesDir = path.join(constants_1.NODE_MODULES_DIR_NAME, TypeScriptService.TYPESCRIPT_MODULE_NAME);
            const typeScriptInProjectsNodeModulesDir = path.join(projectDir, typeScriptInNodeModulesDir);
            let typeScriptCompilerVersion;
            if (this.$fs.exists(typeScriptInProjectsNodeModulesDir)) {
                typeScriptCompilerVersion = this.$fs.readJson(path.join(typeScriptInProjectsNodeModulesDir, this.$projectConstants.PACKAGE_JSON_NAME)).version;
                if (semver_1.gte(typeScriptCompilerVersion, TypeScriptService.DEFAULT_TSC_VERSION)) {
                    this.typeScriptModuleFilePath = typeScriptInProjectsNodeModulesDir;
                }
                else {
                    typeScriptCompilerVersion = null;
                }
            }
            if (!this.typeScriptModuleFilePath) {
                if (options.useLocalTypeScriptCompiler) {
                    const typeScriptJsFilePath = require.resolve(TypeScriptService.TYPESCRIPT_MODULE_NAME);
                    this.typeScriptModuleFilePath = typeScriptJsFilePath.substring(0, typeScriptJsFilePath.indexOf(typeScriptInNodeModulesDir) + typeScriptInNodeModulesDir.length);
                }
                else {
                    const typeScriptModuleInstallationDir = this.createTempDirectoryForTsc();
                    const pluginToInstall = {
                        name: TypeScriptService.TYPESCRIPT_MODULE_NAME,
                        version: TypeScriptService.DEFAULT_TSC_VERSION,
                        installTypes: false
                    };
                    yield this.$npmService.install(typeScriptModuleInstallationDir, pluginToInstall);
                    this.typeScriptModuleFilePath = path.join(typeScriptModuleInstallationDir, typeScriptInNodeModulesDir);
                }
            }
            const typeScriptCompilerPath = path.join(this.typeScriptModuleFilePath, "lib", "tsc");
            typeScriptCompilerVersion = typeScriptCompilerVersion || this.$fs.readJson(path.join(this.typeScriptModuleFilePath, this.$projectConstants.PACKAGE_JSON_NAME)).version;
            return { pathToCompiler: typeScriptCompilerPath, version: typeScriptCompilerVersion };
        });
    }
    runTranspilation(projectDir, typeScriptCompilerPath, options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || {};
            const startTime = new Date().getTime();
            let params = _([])
                .concat(typeScriptCompilerPath)
                .concat(options.filesToTranspile || [])
                .concat(this.getTypeScriptCompilerOptionsAsArguments(options.compilerOptions) || [])
                .value();
            params = ~typeScriptCompilerPath.indexOf(projectDir) ? [typeScriptCompilerPath] : params;
            const output = yield this.$childProcess.spawnFromEvent(process.argv[0], params, "close", { cwd: projectDir, stdio: "inherit" }, { throwError: false });
            if (output.exitCode === 1 || output.exitCode === 5) {
                this.$errors.failWithoutHelp(`TypeScript compiler failed with exit code ${output.exitCode}.`);
            }
            const endTime = new Date().getTime();
            const time = (endTime - startTime) / 1000;
            this.$logger.out(`${os.EOL}Success: ${time.toFixed(2)}s${os.EOL}.`.green);
            this.startWatchProcess(params, projectDir);
        });
    }
    startWatchProcess(params, projectDir) {
        if (!this._watchProcess && this.$options.watch) {
            params.push("--watch");
            this._watchProcess = this.$childProcess.spawn(process.argv[0], params, { cwd: projectDir });
            this.$processService.attachToProcessExitSignals(this, () => this._watchProcess.kill());
        }
    }
    getTypeScriptCompilerOptionsAsArguments(options) {
        this.noEmitOnError = options.noEmitOnError;
        return _(options)
            .keys()
            .map((option) => {
            const value = options[option];
            if (typeof (value) === "string") {
                return [`--${option}`, value];
            }
            else if (_.isArray(value)) {
                return [`--${option}`, value.join(",")];
            }
            else if (value) {
                return [`--${option}`];
            }
            else {
                return null;
            }
        })
            .filter(argument => !!argument)
            .flatten()
            .value();
    }
    getDefaultTypeScriptDefinitionsFiles(defaultTypeScriptDefinitionsFilesPath) {
        if (!this.$fs.exists(defaultTypeScriptDefinitionsFilesPath)) {
            return [];
        }
        const defaultDefinitionsFiles = this.$fs.readDirectory(defaultTypeScriptDefinitionsFilesPath);
        const remainingDefaultDefinitionFiles = _.filter(defaultDefinitionsFiles, defFile => !_.some(this.definitionFiles, f => path.basename(f) === defFile));
        return _.map(remainingDefaultDefinitionFiles, (definitionFilePath) => {
            return path.join(defaultTypeScriptDefinitionsFilesPath, definitionFilePath);
        }).concat(this.definitionFiles);
    }
    createTempDirectoryForTsc() {
        const tempDir = temp.mkdirSync(`typescript-compiler-${TypeScriptService.DEFAULT_TSC_VERSION}`);
        this.$fs.writeJson(path.join(tempDir, this.$projectConstants.PACKAGE_JSON_NAME), { name: "tsc-container", version: "1.0.0" });
        return tempDir;
    }
}
TypeScriptService.DEFAULT_TSC_VERSION = "2.0.10";
TypeScriptService.TYPESCRIPT_MODULE_NAME = "typescript";
__decorate([
    decorators_1.exported("typeScriptService")
], TypeScriptService.prototype, "transpile", null);
exports.TypeScriptService = TypeScriptService;
$injector.register("typeScriptService", TypeScriptService);
