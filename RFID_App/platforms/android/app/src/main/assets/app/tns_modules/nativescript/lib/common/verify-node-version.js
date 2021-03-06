"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var os = require("os");
var semver = require("semver");
var util = require("util");
var versionsCausingFailure = ["0.10.34", "4.0.0", "4.2.0", "5.0.0"];
var minimumRequiredVersion = "6.0.0";
function getNodeVersionOpts() {
    var supportedVersionsRange = require("../../package.json").engines.node;
    var cliName = "NativeScript";
    var deprecatedVersions = ["^6.0.0", "^7.0.0"];
    var nodeVer = process.version.substr(1);
    return {
        supportedVersionsRange: supportedVersionsRange,
        cliName: cliName,
        nodeVer: nodeVer,
        deprecatedVersions: deprecatedVersions
    };
}
function verifyNodeVersion() {
    var verificationOpts = getNodeVersionOpts();
    var cliName = verificationOpts.cliName;
    var supportedVersionsRange = verificationOpts.supportedVersionsRange;
    var nodeVer = verificationOpts.nodeVer;
    require("colors");
    if (versionsCausingFailure.indexOf(nodeVer) !== -1 || !semver.valid(nodeVer) || semver.lt(nodeVer, minimumRequiredVersion)) {
        console.error(util.format("%sNode.js '%s' is not supported. To be able to work with %s CLI, install any Node.js version in the following range: %s.%s", os.EOL, nodeVer, cliName, supportedVersionsRange, os.EOL).red.bold);
        process.exit(1);
    }
    var nodeWarning = getNodeWarning();
    if (nodeWarning) {
        console.warn((os.EOL + nodeWarning + os.EOL).yellow.bold);
    }
}
exports.verifyNodeVersion = verifyNodeVersion;
function getNodeWarning() {
    var verificationOpts = getNodeVersionOpts();
    var cliName = verificationOpts.cliName;
    var supportedVersionsRange = verificationOpts.supportedVersionsRange;
    var deprecatedVersions = verificationOpts.deprecatedVersions;
    var nodeVer = verificationOpts.nodeVer;
    var warningMessage = "";
    if (deprecatedVersions) {
        deprecatedVersions.forEach(function (version) {
            if (semver.satisfies(nodeVer, version)) {
                warningMessage = "Support for Node.js " + version + " is deprecated and will be removed in one of the next releases of " + cliName +
                    ". Please, upgrade to the latest Node.js LTS version. ";
                return warningMessage;
            }
        });
    }
    if (!warningMessage) {
        var checkSatisfied = semver.satisfies(nodeVer, supportedVersionsRange);
        if (!checkSatisfied) {
            warningMessage = "Support for Node.js " + nodeVer + " is not verified. " + cliName + " CLI might not install or run properly.";
        }
    }
    return warningMessage;
}
exports.getNodeWarning = getNodeWarning;
