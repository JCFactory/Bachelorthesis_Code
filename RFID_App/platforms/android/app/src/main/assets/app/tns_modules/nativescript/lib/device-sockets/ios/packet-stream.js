"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream = require("stream");
class PacketStream extends stream.Transform {
    constructor(opts) {
        super(opts);
    }
    _transform(packet, encoding, done) {
        while (packet.length > 0) {
            if (!this.buffer) {
                const length = packet.readInt32BE(0);
                this.buffer = Buffer.allocUnsafe(length);
                this.offset = 0;
                packet = packet.slice(4);
            }
            packet.copy(this.buffer, this.offset);
            const copied = Math.min(this.buffer.length - this.offset, packet.length);
            this.offset += copied;
            packet = packet.slice(copied);
            if (this.offset === this.buffer.length) {
                this.push(this.buffer);
                this.buffer = undefined;
            }
        }
        done();
    }
}
exports.PacketStream = PacketStream;
