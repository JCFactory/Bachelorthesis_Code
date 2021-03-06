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
const events_1 = require("events");
const constants_1 = require("../../constants");
const packet_stream_1 = require("./packet-stream");
const net = require("net");
const ws = require("ws");
const helpers = require("../../common/helpers");
const temp = require("temp");
class SocketProxyFactory extends events_1.EventEmitter {
    constructor($logger, $errors, $options, $net) {
        super();
        this.$logger = $logger;
        this.$errors = $errors;
        this.$options = $options;
        this.$net = $net;
    }
    createTCPSocketProxy(factory) {
        return __awaiter(this, void 0, void 0, function* () {
            const socketFactory = (callback) => __awaiter(this, void 0, void 0, function* () { return helpers.connectEventually(factory, callback); });
            this.$logger.info("\nSetting up proxy...\nPress Ctrl + C to terminate, or disconnect.\n");
            const server = net.createServer({
                allowHalfOpen: true
            });
            server.on("connection", (frontendSocket) => __awaiter(this, void 0, void 0, function* () {
                this.$logger.info("Frontend client connected.");
                frontendSocket.on("end", () => {
                    this.$logger.info('Frontend socket closed!');
                    if (!this.$options.watch) {
                        process.exit(0);
                    }
                });
                yield socketFactory((backendSocket) => {
                    this.$logger.info("Backend socket created.");
                    backendSocket.on("end", () => {
                        this.$logger.info("Backend socket closed!");
                        if (!this.$options.watch) {
                            process.exit(0);
                        }
                    });
                    frontendSocket.on("close", () => {
                        this.$logger.info("Frontend socket closed");
                        if (!backendSocket.destroyed) {
                            backendSocket.destroy();
                        }
                    });
                    backendSocket.on("close", () => {
                        this.$logger.info("Backend socket closed");
                        if (!frontendSocket.destroyed) {
                            frontendSocket.destroy();
                        }
                    });
                    backendSocket.pipe(frontendSocket);
                    frontendSocket.pipe(backendSocket);
                    frontendSocket.resume();
                });
            }));
            const socketFileLocation = temp.path({ suffix: ".sock" });
            server.listen(socketFileLocation);
            if (!this.$options.client) {
                this.$logger.info("socket-file-location: " + socketFileLocation);
            }
            return server;
        });
    }
    createWebSocketProxy(factory, deviceIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            const localPort = yield this.$net.getAvailablePortInRange(41000);
            this.$logger.info("\nSetting up debugger proxy...\nPress Ctrl + C to terminate, or disconnect.\n");
            const server = new ws.Server({
                port: localPort,
                host: "localhost",
                verifyClient: (info, callback) => __awaiter(this, void 0, void 0, function* () {
                    this.$logger.info("Frontend client connected.");
                    let _socket;
                    try {
                        _socket = yield factory();
                    }
                    catch (err) {
                        err.deviceIdentifier = deviceIdentifier;
                        this.$logger.trace(err);
                        this.emit(constants_1.CONNECTION_ERROR_EVENT_NAME, err);
                        this.$errors.failWithoutHelp(`Cannot connect to device socket. The error message is ${err.message}`);
                    }
                    this.$logger.info("Backend socket created.");
                    info.req["__deviceSocket"] = _socket;
                    callback(true);
                })
            });
            server.on("connection", (webSocket, req) => {
                const encoding = "utf16le";
                const deviceSocket = req["__deviceSocket"];
                const packets = new packet_stream_1.PacketStream();
                deviceSocket.pipe(packets);
                packets.on("data", (buffer) => {
                    webSocket.send(buffer.toString(encoding));
                });
                webSocket.on("error", err => {
                    this.$logger.trace("Error on debugger websocket", err);
                });
                deviceSocket.on("error", err => {
                    this.$logger.trace("Error on debugger deviceSocket", err);
                });
                webSocket.on("message", (message) => {
                    const length = Buffer.byteLength(message, encoding);
                    const payload = Buffer.allocUnsafe(length + 4);
                    payload.writeInt32BE(length, 0);
                    payload.write(message, 4, length, encoding);
                    deviceSocket.write(payload);
                });
                deviceSocket.on("close", () => {
                    this.$logger.info("Backend socket closed!");
                    webSocket.close();
                });
                webSocket.on("close", () => {
                    this.$logger.info('Frontend socket closed!');
                    deviceSocket.destroy();
                    if (!this.$options.watch) {
                        process.exit(0);
                    }
                });
            });
            this.$logger.info("Opened localhost " + localPort);
            return server;
        });
    }
}
exports.SocketProxyFactory = SocketProxyFactory;
$injector.register("socketProxyFactory", SocketProxyFactory);
