"use strict";
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
var _Emitter = io.socket.emitter.Emitter;
var _IO = io.socket.client.IO;
var _Socket = io.socket.client.Socket;
var _Ack = io.socket.client.Ack;
var SOCKET_CLASS = 'io.socket.client.Socket';
var SocketIO = (function (_super) {
    __extends(SocketIO, _super);
    function SocketIO(uri, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        var _options = new _IO.Options();
        if (options.query) {
            if (typeof options.query === 'string') {
                _options.query = options.query;
            }
            else {
                _options.query = Object.keys(options.query).map(function (key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(options.query[key]);
                }).join('&');
            }
        }
        if (options.android) {
            Object.keys(options.android).forEach(function (prop) {
                _options[prop] = options.android[prop];
            });
        }
        _this.android = _IO.socket(uri, _options);
        return _this;
    }
    Object.defineProperty(SocketIO.prototype, "connected", {
        get: function () {
            return this.android && this.android.connected();
        },
        enumerable: true,
        configurable: true
    });
    SocketIO.prototype.connect = function () {
        this.android.connect();
    };
    SocketIO.prototype.disconnect = function () {
        this.android.disconnect();
    };
    SocketIO.prototype.on = function (event, callback) {
        var listener = function (args) {
            var payload = Array.prototype.slice.call(args);
            var ack = payload.pop();
            if (typeof ack === 'undefined') {
                ack = null;
            }
            else if (typeof ack === 'object' && ack && !(ack.getClass().getName().indexOf(SOCKET_CLASS) === 0 && ack.call)) {
                payload.push(ack);
                ack = null;
            }
            payload = payload.map(helpers_1.deserialize);
            socketio_common_1.debug('on', event, payload, ack ? 'ack' : '');
            if (ack) {
                var _ack = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    socketio_common_1.debug('on', event, 'ack', args);
                    args = args.map(helpers_1.serialize);
                    ack.call(args);
                };
                payload.push(_ack);
            }
            callback.apply(null, payload);
        };
        listener = new _Emitter.Listener({
            call: listener,
        });
        this._listeners.set(callback, listener);
        this.android.on(event, listener);
        return this;
    };
    SocketIO.prototype.once = function (event, callback) {
        var listener = function (args) {
            var payload = Array.prototype.slice.call(args);
            var ack = payload.pop();
            if (typeof ack === 'undefined') {
                ack = null;
            }
            else if (typeof ack === 'object' && ack && !(ack.getClass().getName().indexOf(SOCKET_CLASS) === 0 && ack.call)) {
                payload.push(ack);
                ack = null;
            }
            payload = payload.map(helpers_1.deserialize);
            socketio_common_1.debug('once', event, payload, ack ? 'ack' : '');
            if (ack) {
                var _ack = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    socketio_common_1.debug('once', event, 'ack', args);
                    args = args.map(helpers_1.serialize);
                    ack.call(args);
                };
                payload.push(_ack);
            }
            callback.apply(null, payload);
        };
        listener = new _Emitter.Listener({
            call: listener,
        });
        this._listeners.set(callback, listener);
        this.android.once(event, listener);
        return this;
    };
    SocketIO.prototype.off = function (event, callback) {
        socketio_common_1.debug('off', event, callback);
        if (callback) {
            var listener = this._listeners.get(callback);
            if (listener) {
                this.android.off(event, listener);
                this._listeners.delete(callback);
            }
        }
        else {
            this.android.off(event);
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
                args = Array.prototype.slice.call(args).map(helpers_1.deserialize);
                socketio_common_1.debug('emit', event, 'ack', args);
                ack.apply(null, args);
            };
            _ack = new _Ack({
                call: _ack,
            });
            payload.push(_ack);
        }
        this.android.emit(event, payload);
        return this;
    };
    SocketIO.prototype.removeAllListeners = function () {
        this.android.off();
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
//# sourceMappingURL=socketio.android.js.map