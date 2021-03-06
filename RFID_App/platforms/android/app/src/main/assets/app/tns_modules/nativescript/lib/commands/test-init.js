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
const path = require("path");
const constants_1 = require("../constants");
class TestInitCommand {
    constructor($npm, $projectData, $errors, $options, $prompter, $fs, $resources, $pluginsService, $logger) {
        this.$npm = $npm;
        this.$projectData = $projectData;
        this.$errors = $errors;
        this.$options = $options;
        this.$prompter = $prompter;
        this.$fs = $fs;
        this.$resources = $resources;
        this.$pluginsService = $pluginsService;
        this.$logger = $logger;
        this.allowedParameters = [];
        this.frameworkDependencies = {
            mocha: ['karma-chai', 'mocha'],
        };
        this.karmaConfigAdditionalFrameworks = {
            mocha: ['chai']
        };
        this.$projectData.initializeProjectData();
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectDir = this.$projectData.projectDir;
            const frameworkToInstall = this.$options.framework ||
                (yield this.$prompter.promptForChoice('Select testing framework:', constants_1.TESTING_FRAMEWORKS));
            if (constants_1.TESTING_FRAMEWORKS.indexOf(frameworkToInstall) === -1) {
                this.$errors.fail(`Unknown or unsupported unit testing framework: ${frameworkToInstall}`);
            }
            const dependencies = this.frameworkDependencies[frameworkToInstall] || [];
            const modulesToInstall = [
                {
                    name: 'karma',
                    version: "2.0.2"
                },
                {
                    name: `karma-${frameworkToInstall}`
                },
                {
                    name: 'karma-nativescript-launcher'
                }
            ];
            modulesToInstall.push(...dependencies.map(f => ({ name: f })));
            for (const mod of modulesToInstall) {
                let moduleToInstall = mod.name;
                if (mod.version) {
                    moduleToInstall += `@${mod.version}`;
                }
                yield this.$npm.install(moduleToInstall, projectDir, {
                    'save-dev': true,
                    'save-exact': true,
                    optional: false,
                    disableNpmInstall: this.$options.disableNpmInstall,
                    frameworkPath: this.$options.frameworkPath,
                    ignoreScripts: this.$options.ignoreScripts,
                    path: this.$options.path
                });
                const modulePath = path.join(projectDir, "node_modules", mod.name);
                const modulePackageJsonPath = path.join(modulePath, "package.json");
                const modulePackageJsonContent = this.$fs.readJson(modulePackageJsonPath);
                const modulePeerDependencies = modulePackageJsonContent.peerDependencies || {};
                for (const peerDependency in modulePeerDependencies) {
                    const dependencyVersion = modulePeerDependencies[peerDependency] || "*";
                    try {
                        yield this.$npm.install(`${peerDependency}@${dependencyVersion}`, projectDir, {
                            'save-dev': true,
                            'save-exact': true,
                            disableNpmInstall: false,
                            frameworkPath: this.$options.frameworkPath,
                            ignoreScripts: this.$options.ignoreScripts,
                            path: this.$options.path
                        });
                    }
                    catch (e) {
                        this.$logger.error(e.message);
                    }
                }
            }
            yield this.$pluginsService.add('nativescript-unit-test-runner', this.$projectData);
            const testsDir = path.join(this.$projectData.appDirectoryPath, 'tests');
            let shouldCreateSampleTests = true;
            if (this.$fs.exists(testsDir)) {
                this.$logger.info('app/tests/ directory already exists, will not create an example test project.');
                shouldCreateSampleTests = false;
            }
            this.$fs.ensureDirectoryExists(testsDir);
            const frameworks = [frameworkToInstall].concat(this.karmaConfigAdditionalFrameworks[frameworkToInstall] || [])
                .map(fw => `'${fw}'`)
                .join(', ');
            const karmaConfTemplate = this.$resources.readText('test/karma.conf.js');
            const karmaConf = _.template(karmaConfTemplate)({ frameworks });
            this.$fs.writeFile(path.join(projectDir, 'karma.conf.js'), karmaConf);
            const exampleFilePath = this.$resources.resolvePath(`test/example.${frameworkToInstall}.js`);
            if (shouldCreateSampleTests && this.$fs.exists(exampleFilePath)) {
                this.$fs.copyFile(exampleFilePath, path.join(testsDir, 'example.js'));
                this.$logger.info('\nExample test file created in app/tests/'.yellow);
            }
            else {
                this.$logger.info('\nPlace your test files under app/tests/'.yellow);
            }
            this.$logger.info('Run your tests using the "$ tns test <platform>" command.'.yellow);
        });
    }
}
$injector.registerCommand("test|init", TestInitCommand);
