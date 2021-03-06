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
const gaze = require("gaze");
const path = require("path");
const os = require("os");
const hostInfo = $injector.resolve("hostInfo");
class CancellationService {
    constructor($fs, $logger) {
        this.$fs = $fs;
        this.$logger = $logger;
        this.watches = {};
        this.$fs.createDirectory(CancellationService.killSwitchDir);
        this.$fs.chmod(CancellationService.killSwitchDir, "0777");
    }
    begin(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const triggerFile = CancellationService.makeKillSwitchFileName(name);
            if (!this.$fs.exists(triggerFile)) {
                this.$fs.writeFile(triggerFile, "");
                if (!hostInfo.isWindows) {
                    this.$fs.chmod(triggerFile, "0777");
                }
            }
            this.$logger.trace("Starting watch on killswitch %s", triggerFile);
            const watcherInitialized = new Promise((resolve, reject) => {
                gaze(triggerFile, function (err, watcher) {
                    this.on("deleted", (filePath) => process.exit());
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(watcher);
                    }
                });
            });
            const watcher = yield watcherInitialized;
            if (watcher) {
                this.watches[name] = watcher;
            }
        });
    }
    end(name) {
        const watcher = this.watches[name];
        delete this.watches[name];
        watcher.close();
    }
    dispose() {
        _(this.watches).keys().each(name => this.end(name));
    }
    static get killSwitchDir() {
        return path.join(os.tmpdir(), process.env.SUDO_USER || process.env.USER || process.env.USERNAME || '', "KillSwitches");
    }
    static makeKillSwitchFileName(name) {
        return path.join(CancellationService.killSwitchDir, name);
    }
}
class CancellationServiceDummy {
    dispose() {
    }
    begin(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return;
        });
    }
    end(name) {
    }
}
if (hostInfo.isWindows) {
    $injector.register("cancellation", CancellationService);
}
else {
    $injector.register("cancellation", CancellationServiceDummy);
}
