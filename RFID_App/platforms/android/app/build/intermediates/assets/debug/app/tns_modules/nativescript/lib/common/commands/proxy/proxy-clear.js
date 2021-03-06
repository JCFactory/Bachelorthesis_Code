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
const proxy_base_1 = require("./proxy-base");
const proxyClearCommandName = "proxy|clear";
class ProxyClearCommand extends proxy_base_1.ProxyCommandBase {
    constructor($analyticsService, $logger, $proxyService) {
        super($analyticsService, $logger, $proxyService, proxyClearCommandName);
        this.$analyticsService = $analyticsService;
        this.$logger = $logger;
        this.$proxyService = $proxyService;
    }
    execute(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.$proxyService.clearCache();
            this.$logger.out("Successfully cleared proxy.");
            yield this.tryTrackUsage();
        });
    }
}
exports.ProxyClearCommand = ProxyClearCommand;
$injector.registerCommand(proxyClearCommandName, ProxyClearCommand);
