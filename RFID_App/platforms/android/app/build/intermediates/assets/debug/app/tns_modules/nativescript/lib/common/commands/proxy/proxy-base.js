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
class ProxyCommandBase {
    constructor($analyticsService, $logger, $proxyService, commandName) {
        this.$analyticsService = $analyticsService;
        this.$logger = $logger;
        this.$proxyService = $proxyService;
        this.commandName = commandName;
        this.disableAnalytics = true;
        this.allowedParameters = [];
    }
    tryTrackUsage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.$analyticsService.trackFeature(this.commandName);
            }
            catch (ex) {
                this.$logger.trace("Error in trying to track proxy command usage:");
                this.$logger.trace(ex);
            }
        });
    }
}
exports.ProxyCommandBase = ProxyCommandBase;
