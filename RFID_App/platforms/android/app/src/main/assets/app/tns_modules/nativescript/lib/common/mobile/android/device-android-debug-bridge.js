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
const android_debug_bridge_1 = require("./android-debug-bridge");
class DeviceAndroidDebugBridge extends android_debug_bridge_1.AndroidDebugBridge {
    constructor(identifier, $childProcess, $errors, $logger, $staticConfig, $androidDebugBridgeResultHandler) {
        super($childProcess, $errors, $logger, $staticConfig, $androidDebugBridgeResultHandler);
        this.identifier = identifier;
        this.$childProcess = $childProcess;
        this.$errors = $errors;
        this.$logger = $logger;
        this.$staticConfig = $staticConfig;
        this.$androidDebugBridgeResultHandler = $androidDebugBridgeResultHandler;
    }
    executeShellCommand(args, options) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            args.unshift("shell");
            return _super("executeCommand").call(this, args, options);
        });
    }
    sendBroadcastToDevice(action, extras) {
        return __awaiter(this, void 0, void 0, function* () {
            extras = extras || {};
            const broadcastCommand = ["am", "broadcast", "-a", `${action}`];
            _.each(extras, (value, key) => broadcastCommand.push("-e", key, value));
            const result = yield this.executeShellCommand(broadcastCommand);
            this.$logger.trace(`Broadcast result ${result} from ${broadcastCommand}`);
            const match = result.match(/Broadcast completed: result=(\d+)/);
            if (match) {
                return +match[1];
            }
            this.$errors.failWithoutHelp("Unable to broadcast to android device:\n%s", result);
        });
    }
    composeCommand(params) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            return _super("composeCommand").call(this, params, this.identifier);
        });
    }
}
exports.DeviceAndroidDebugBridge = DeviceAndroidDebugBridge;
