"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Common = (function () {
    function Common() {
        this._listeners = new WeakMap();
    }
    Object.defineProperty(Common.prototype, "disconnected", {
        get: function () {
            return !this.connected;
        },
        enumerable: true,
        configurable: true
    });
    Common.prototype.open = function () {
        this.connect();
    };
    Common.prototype.close = function () {
        this.disconnect();
    };
    Common.prototype.addEventListener = function (event, callback) {
        return this.on(event, callback);
    };
    Common.prototype.removeListener = function (event, callback) {
        return this.off(event, callback);
    };
    Common.prototype.removeEventListener = function (event, callback) {
        return this.off(event, callback);
    };
    return Common;
}());
exports.Common = Common;
exports.debugNop = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
};
function debugDefault() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    args = args.map(function (value) {
        if (typeof value === 'object' && value) {
            try {
                value = JSON.stringify(value);
            }
            catch (e) {
                value = value.toString();
            }
        }
        return value;
    });
    args.unshift('nativescript-socket.io');
    console.log.apply(console, args);
}
exports.debugDefault = debugDefault;
var _debug = exports.debugNop;
function debug() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    _debug.apply(null, args);
}
exports.debug = debug;
function enableDebug(debugFn) {
    if (debugFn === void 0) { debugFn = debugDefault; }
    _debug = debugFn;
}
exports.enableDebug = enableDebug;
function disableDebug() {
    _debug = exports.debugNop;
}
exports.disableDebug = disableDebug;
//# sourceMappingURL=socketio.common.js.map