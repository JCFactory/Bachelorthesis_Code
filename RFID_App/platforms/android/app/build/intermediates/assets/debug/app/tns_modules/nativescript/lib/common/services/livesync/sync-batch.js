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
exports.SYNC_WAIT_THRESHOLD = 250;
class SyncBatch {
    constructor($logger, $projectFilesManager, done) {
        this.$logger = $logger;
        this.$projectFilesManager = $projectFilesManager;
        this.done = done;
        this.timer = null;
        this.syncQueue = [];
        this.syncInProgress = false;
    }
    get filesToSync() {
        const filteredFiles = _.remove(this.syncQueue, syncFile => this.$projectFilesManager.isFileExcluded(syncFile));
        this.$logger.trace("Removed files from syncQueue: ", filteredFiles);
        return this.syncQueue;
    }
    get syncPending() {
        return this.syncQueue.length > 0;
    }
    syncFiles(syncAction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.filesToSync.length > 0) {
                yield syncAction(this.filesToSync);
                this.reset();
            }
        });
    }
    addFile(file) {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.syncQueue.push(file);
        if (!this.syncInProgress) {
            this.timer = setTimeout(() => {
                if (this.syncQueue.length > 0) {
                    this.$logger.trace("Syncing %s", this.syncQueue.join(", "));
                    try {
                        this.syncInProgress = true;
                        this.done();
                    }
                    finally {
                        this.syncInProgress = false;
                    }
                }
                this.timer = null;
            }, exports.SYNC_WAIT_THRESHOLD);
        }
    }
    reset() {
        this.syncQueue = [];
    }
}
exports.SyncBatch = SyncBatch;
