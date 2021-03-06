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
const net = require("net");
const helpers_1 = require("../helpers");
class Net {
    constructor($errors, $childProcess, $logger, $osInfo) {
        this.$errors = $errors;
        this.$childProcess = $childProcess;
        this.$logger = $logger;
        this.$osInfo = $osInfo;
    }
    getFreePort() {
        return __awaiter(this, void 0, void 0, function* () {
            const server = net.createServer((sock) => { });
            return new Promise((resolve, reject) => {
                let isResolved = false;
                server.listen(0, () => {
                    const portUsed = server.address().port;
                    server.close();
                    if (!isResolved) {
                        isResolved = true;
                        resolve(portUsed);
                    }
                });
                server.on("error", (err) => {
                    if (!isResolved) {
                        isResolved = true;
                        reject(err);
                    }
                });
            });
        });
    }
    isPortAvailable(port) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let isResolved = false;
                const server = net.createServer();
                server.on("error", (err) => {
                    if (!isResolved) {
                        isResolved = true;
                        resolve(false);
                    }
                });
                server.once("close", () => {
                    if (!isResolved) {
                        isResolved = true;
                        resolve(true);
                    }
                });
                server.on("listening", (err) => {
                    if (err && !isResolved) {
                        isResolved = true;
                        resolve(true);
                    }
                    server.close();
                });
                server.listen(port, "localhost");
            });
        });
    }
    getAvailablePortInRange(startPort, endPort) {
        return __awaiter(this, void 0, void 0, function* () {
            endPort = endPort || 65534;
            while (!(yield this.isPortAvailable(startPort))) {
                startPort++;
                if (startPort > endPort) {
                    this.$errors.failWithoutHelp("Unable to find free local port.");
                }
            }
            return startPort;
        });
    }
    waitForPortToListen(waitForPortListenData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!waitForPortListenData) {
                this.$errors.failWithoutHelp("You must pass port and timeout for check.");
            }
            const { timeout, port } = waitForPortListenData;
            const interval = waitForPortListenData.interval || Net.DEFAULT_INTERVAL;
            const endTime = new Date().getTime() + timeout;
            const platformData = {
                "darwin": {
                    command: "netstat -f inet -p tcp -anL",
                    regex: new RegExp(`\\.${port}\\b`, "g")
                },
                "linux": {
                    command: "netstat -tnl",
                    regex: new RegExp(`:${port}\\s`, "g")
                },
                "win32": {
                    command: "netstat -ant -p tcp",
                    regex: new RegExp(`TCP\\s+(\\d+\\.){3}\\d+:${port}.*?LISTEN`, "g")
                }
            };
            const platform = this.$osInfo.platform();
            const currentPlatformData = platformData[platform];
            if (!currentPlatformData) {
                this.$errors.failWithoutHelp(`Unable to check for free ports on ${platform}. Supported platforms are: ${_.keys(platformData).join(", ")}`);
            }
            while (true) {
                const { command, regex } = currentPlatformData;
                try {
                    const result = yield this.$childProcess.exec(command);
                    if (result && !!result.match(regex)) {
                        return true;
                    }
                }
                catch (err) {
                    this.$logger.trace(`Error while calling '${command}': ${err}`);
                }
                const currentTime = new Date().getTime();
                if (currentTime >= endTime) {
                    break;
                }
                yield helpers_1.sleep(interval);
            }
            return false;
        });
    }
}
Net.DEFAULT_INTERVAL = 1000;
exports.Net = Net;
$injector.register("net", Net);
