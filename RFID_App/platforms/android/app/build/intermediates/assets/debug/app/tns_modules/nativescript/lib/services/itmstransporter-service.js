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
const temp = require("temp");
const os_1 = require("os");
const constants_1 = require("../constants");
const constants_2 = require("../constants");
const helpers_1 = require("../common/helpers");
class ITMSTransporterService {
    constructor($plistParser, $childProcess, $errors, $fs, $hostInfo, $httpClient, $injector, $logger, $xcodeSelectService) {
        this.$plistParser = $plistParser;
        this.$childProcess = $childProcess;
        this.$errors = $errors;
        this.$fs = $fs;
        this.$hostInfo = $hostInfo;
        this.$httpClient = $httpClient;
        this.$injector = $injector;
        this.$logger = $logger;
        this.$xcodeSelectService = $xcodeSelectService;
        this._itmsTransporterPath = null;
        this._itunesConnectApplications = null;
        this._bundleIdentifier = null;
    }
    get $projectData() {
        return this.$injector.resolve("projectData");
    }
    upload(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.$hostInfo.isDarwin) {
                this.$errors.failWithoutHelp("iOS publishing is only available on Mac OS X.");
            }
            temp.track();
            const itmsTransporterPath = yield this.getITMSTransporterPath(), ipaFileName = "app.ipa", itmsDirectory = temp.mkdirSync("itms-"), innerDirectory = path.join(itmsDirectory, "mybundle.itmsp"), ipaFileLocation = path.join(innerDirectory, ipaFileName), loggingLevel = data.verboseLogging ? constants_1.ITMSConstants.VerboseLoggingLevels.Verbose : constants_1.ITMSConstants.VerboseLoggingLevels.Informational, bundleId = yield this.getBundleIdentifier(data.ipaFilePath), iOSApplication = yield this.getiOSApplication(data.username, data.password, bundleId);
            this.$fs.createDirectory(innerDirectory);
            this.$fs.copyFile(data.ipaFilePath, ipaFileLocation);
            const ipaFileHash = yield this.$fs.getFileShasum(ipaFileLocation, { algorithm: "md5" }), ipaFileSize = this.$fs.getFileSize(ipaFileLocation), metadata = this.getITMSMetadataXml(iOSApplication.adamId, ipaFileName, ipaFileHash, ipaFileSize);
            this.$fs.writeFile(path.join(innerDirectory, constants_1.ITMSConstants.ApplicationMetadataFile), metadata);
            yield this.$childProcess.spawnFromEvent(itmsTransporterPath, ["-m", "upload", "-f", itmsDirectory, "-u", helpers_1.quoteString(data.username), "-p", helpers_1.quoteString(data.password), "-v", loggingLevel], "close", { stdio: "inherit" });
        });
    }
    getiOSApplications(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._itunesConnectApplications) {
                const requestBody = this.getContentDeliveryRequestBody(credentials), contentDeliveryResponse = yield this.$httpClient.httpRequest({
                    url: "https://contentdelivery.itunes.apple.com/WebObjects/MZLabelService.woa/json/MZITunesProducerService",
                    method: "POST",
                    body: requestBody,
                    headers: {
                        "Content-Length": requestBody.length
                    }
                }), contentDeliveryBody = JSON.parse(contentDeliveryResponse.body);
                if (!contentDeliveryBody.result.Success || !contentDeliveryBody.result.Applications) {
                    let errorMessage = ["Unable to connect to iTunes Connect"];
                    if (contentDeliveryBody.result.Errors && contentDeliveryBody.result.Errors.length) {
                        errorMessage = errorMessage.concat(contentDeliveryBody.result.Errors);
                    }
                    this.$errors.failWithoutHelp(errorMessage.join(os_1.EOL));
                }
                this._itunesConnectApplications = contentDeliveryBody.result.Applications.filter(app => app.type === constants_2.ItunesConnectApplicationTypes.iOS);
            }
            return this._itunesConnectApplications;
        });
    }
    getiOSApplication(username, password, bundleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const iOSApplications = yield this.getiOSApplications({ username, password });
            if (!iOSApplications || !iOSApplications.length) {
                this.$errors.failWithoutHelp(`Cannot find any registered applications for Apple ID ${username} in iTunes Connect.`);
            }
            const iOSApplication = _.find(iOSApplications, app => app.bundleId === bundleId);
            if (!iOSApplication) {
                this.$errors.failWithoutHelp(`Cannot find registered applications that match the specified identifier ${bundleId} in iTunes Connect.`);
            }
            return iOSApplication;
        });
    }
    getBundleIdentifier(ipaFileFullPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._bundleIdentifier) {
                if (!ipaFileFullPath) {
                    this._bundleIdentifier = this.$projectData.projectId;
                }
                else {
                    if (!this.$fs.exists(ipaFileFullPath) || path.extname(ipaFileFullPath) !== ".ipa") {
                        this.$errors.failWithoutHelp(`Cannot use specified ipa file ${ipaFileFullPath}. File either does not exist or is not an ipa file.`);
                    }
                    this.$logger.trace("--ipa set - extracting .ipa file to get app's bundle identifier");
                    temp.track();
                    const destinationDir = temp.mkdirSync("ipa-");
                    yield this.$fs.unzip(ipaFileFullPath, destinationDir);
                    const payloadDir = path.join(destinationDir, "Payload");
                    let allApps = this.$fs.readDirectory(payloadDir);
                    this.$logger.debug("ITMSTransporter .ipa Payload files:");
                    allApps.forEach(f => this.$logger.debug(" - " + f));
                    allApps = allApps.filter(f => path.extname(f).toLowerCase() === ".app");
                    if (allApps.length > 1) {
                        this.$errors.failWithoutHelp("In the .ipa the ITMSTransporter is uploading there is more than one .app file. We don't know which one to upload.");
                    }
                    else if (allApps.length <= 0) {
                        this.$errors.failWithoutHelp("In the .ipa the ITMSTransporter is uploading there must be at least one .app file.");
                    }
                    const appFile = path.join(payloadDir, allApps[0]);
                    const plistObject = yield this.$plistParser.parseFile(path.join(appFile, constants_1.INFO_PLIST_FILE_NAME));
                    const bundleId = plistObject && plistObject.CFBundleIdentifier;
                    if (!bundleId) {
                        this.$errors.failWithoutHelp(`Unable to determine bundle identifier from ${ipaFileFullPath}.`);
                    }
                    this.$logger.trace(`bundle identifier determined to be ${bundleId}`);
                    this._bundleIdentifier = bundleId;
                }
            }
            return this._bundleIdentifier;
        });
    }
    getITMSTransporterPath() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._itmsTransporterPath) {
                const xcodePath = yield this.$xcodeSelectService.getContentsDirectoryPath();
                const xcodeVersion = yield this.$xcodeSelectService.getXcodeVersion();
                let result = path.join(xcodePath, "Applications", "Application Loader.app", "Contents");
                xcodeVersion.patch = xcodeVersion.patch || "0";
                if (xcodeVersion.major && xcodeVersion.minor &&
                    helpers_1.versionCompare(xcodeVersion, "6.3.0") < 0) {
                    result = path.join(result, "MacOS");
                }
                this._itmsTransporterPath = path.join(result, constants_1.ITMSConstants.iTMSDirectoryName, "bin", constants_1.ITMSConstants.iTMSExecutableName);
            }
            if (!this.$fs.exists(this._itmsTransporterPath)) {
                this.$errors.failWithoutHelp('iTMS Transporter not found on this machine - make sure your Xcode installation is not damaged.');
            }
            return this._itmsTransporterPath;
        });
    }
    getContentDeliveryRequestBody(credentials) {
        return Buffer.from(JSON.stringify({
            id: "1",
            jsonrpc: "2.0",
            method: "lookupSoftwareApplications",
            params: {
                Username: credentials.username,
                Password: credentials.password,
                Version: "2.9.1 (441)",
                Application: "Application Loader",
                OSIdentifier: "Mac OS X 10.8.5 (x86_64)"
            }
        }), "utf8");
    }
    getITMSMetadataXml(appleId, ipaFileName, ipaFileHash, ipaFileSize) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<package version="software4.7" xmlns="http://apple.com/itunes/importer">
    <software_assets apple_id="${appleId}">
        <asset type="bundle">
            <data_file>
                <file_name>${ipaFileName}</file_name>
                <checksum type="md5">${ipaFileHash}</checksum>
                <size>${ipaFileSize}</size>
            </data_file>
        </asset>
    </software_assets>
</package>`;
    }
}
exports.ITMSTransporterService = ITMSTransporterService;
$injector.register("itmsTransporterService", ITMSTransporterService);
