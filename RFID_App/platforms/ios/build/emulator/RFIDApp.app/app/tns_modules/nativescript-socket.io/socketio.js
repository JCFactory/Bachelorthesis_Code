'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var socketio_common_1 = require("./socketio.common");
exports.enableDebug = socketio_common_1.enableDebug;
exports.disableDebug = socketio_common_1.disableDebug;
var helpers_1 = require("./helpers");
SocketIOClient;
SocketAckEmitter;
OnAckCallback;
SocketEngine;
var NAMESPACE_REGEXP = /^https?\:\/\/[^\/]*(\/.*)$/i;
var SocketIO = (function (_super) {
    __extends(SocketIO, _super);
    function SocketIO(uri, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        var _options = {};
        if (NAMESPACE_REGEXP.test(uri)) {
            _options.nsp = uri.match(NAMESPACE_REGEXP)[1] || '/';
        }
        else {
            _options.nsp = '/';
        }
        if (options.query) {
            _options.connectParams = {};
            if (typeof options.query === 'string') {
                options.query.split('&').forEach(function (pair) {
                    pair = pair.split('=').map(decodeURIComponent);
                    _options.connectParams[pair[0]] = pair[1];
                });
            }
            else {
                Object.keys(options.query).forEach(function (key) {
                    _options.connectParams[key] = String(options.query[key]);
                });
            }
        }
        if (options.ios) {
            Object.keys(options.ios).forEach(function (prop) {
                _options[prop] = options.ios[prop];
            });
        }
        _this.ios = SocketIOClient.alloc().initWithSocketURLConfig(NSURL.URLWithString(uri), _options);
        return _this;
    }
    Object.defineProperty(SocketIO.prototype, "connected", {
        get: function () {
            return this.ios && this.ios.engine.connected;
        },
        enumerable: true,
        configurable: true
    });
    SocketIO.prototype.connect = function () {
        this.ios.connect();
    };
    SocketIO.prototype.disconnect = function () {
        this.ios.disconnect();
    };
    SocketIO.prototype.on = function (event, callback) {
        var listener = function (data, ack) {
            var payload = helpers_1.deserialize(data);
            socketio_common_1.debug('on', event, payload, ack && ack.expected ? 'ack' : '');
            if (ack && ack.expected) {
                var _ack = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    socketio_common_1.debug('on', event, 'ack', args);
                    args = args.map(helpers_1.serialize);
                    ack.with(args);
                };
                payload.push(_ack);
            }
            callback.apply(null, payload);
        };
        var listenerId = this.ios.onCallback(event, listener);
        this._listeners.set(callback, listenerId);
        return this;
    };
    SocketIO.prototype.once = function (event, callback) {
        var listener = function (data, ack) {
            var payload = helpers_1.deserialize(data);
            socketio_common_1.debug('once', event, payload, ack && ack.expected ? 'ack' : '');
            if (ack && ack.expected) {
                var _ack = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    socketio_common_1.debug('once', event, 'ack', args);
                    args = args.map(helpers_1.serialize);
                    ack.with(args);
                };
                payload.push(_ack);
            }
            callback.apply(null, payload);
        };
        var listenerId = this.ios.onceCallback(event, listener);
        this._listeners.set(callback, listenerId);
        return this;
    };
    SocketIO.prototype.off = function (event, callback) {
        socketio_common_1.debug('off', event, callback);
        if (callback) {
            var listenerId = this._listeners.get(callback);
            if (listenerId) {
                this.ios.offWithId(listenerId);
                this._listeners.delete(callback);
            }
        }
        else {
            this.ios.off(event);
        }
        return this;
    };
    SocketIO.prototype.emit = function (event) {
        var payload = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            payload[_i - 1] = arguments[_i];
        }
        var ack = payload.pop();
        if (typeof ack === 'undefined') {
            ack = null;
        }
        else if (typeof ack !== 'function') {
            payload.push(ack);
            ack = null;
        }
        socketio_common_1.debug('emit', event, payload, ack ? 'ack' : '');
        payload = payload.map(helpers_1.serialize);
        if (ack) {
            var _ack = function (args) {
                args = helpers_1.deserialize(args);
                socketio_common_1.debug('emit', event, 'ack', args);
                ack.apply(null, args);
            };
            this.ios.emitWithAckWith(event, payload).timingOutAfterCallback(0, _ack);
        }
        else {
            this.ios.emitWith(event, payload);
        }
        return this;
    };
    SocketIO.prototype.removeAllListeners = function () {
        this.ios.removeAllHandlers();
        return this;
    };
    return SocketIO;
}(socketio_common_1.Common));
exports.SocketIO = SocketIO;
function connect(uri, options) {
    var socketio = new SocketIO(uri, options || {});
    socketio.connect();
    return socketio;
}
exports.connect = connect;
//# sourceMappingURL=socketio.js.map