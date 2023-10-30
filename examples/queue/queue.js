"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
class Queue {
    constructor(socket, max = 100) {
        this.queue = [];
        this.sending = false;
        this.socket = socket;
        this.max = max;
    }
    send(msg) {
        if (this.queue.length > this.max) {
            throw new Error("Queue is full");
        }
        this.queue.push(msg);
        this.trySend();
    }
    async trySend() {
        if (this.sending) {
            return;
        }
        this.sending = true;
        while (this.queue.length) {
            await this.socket.send(this.queue.shift());
        }
        this.sending = false;
    }
}
exports.Queue = Queue;
//# sourceMappingURL=queue.js.map