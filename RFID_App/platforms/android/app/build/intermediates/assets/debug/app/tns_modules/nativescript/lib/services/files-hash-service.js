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
const helpers_1 = require("../common/helpers");
const constants_1 = require("../common/constants");
class FilesHashService {
    constructor($fs, $logger) {
        this.$fs = $fs;
        this.$logger = $logger;
    }
    generateHashes(files) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = {};
            const action = (file) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const isFile = this.$fs.getFsStats(file).isFile();
                    if (isFile) {
                        result[file] = yield this.$fs.getFileShasum(file);
                    }
                }
                catch (err) {
                    this.$logger.trace(`Unable to generate hash for file ${file}. Error is: ${err}`);
                }
            });
            yield helpers_1.executeActionByChunks(files, constants_1.DEFAULT_CHUNK_SIZE, action);
            return result;
        });
    }
    getChanges(files, oldHashes) {
        return __awaiter(this, void 0, void 0, function* () {
            const newHashes = yield this.generateHashes(files);
            return _.omitBy(newHashes, (hash, pathToFile) => !!_.find(oldHashes, (oldHash, oldPath) => pathToFile === oldPath && hash === oldHash));
        });
    }
}
exports.FilesHashService = FilesHashService;
$injector.register("filesHashService", FilesHashService);
