"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
const zeromq_1 = require("zeromq");
const types_1 = require("./types");
class Worker {
    constructor(address = "tcp://127.0.0.1:5555") {
        this.service = "";
        this.socket = new zeromq_1.Dealer();
        this.address = address;
        this.socket.connect(address);
    }
    async start() {
        await this.socket.send([null, types_1.Header.Worker, types_1.Message.Ready, this.service]);
        const loop = async () => {
            for await (const [blank1, header, type, client, blank2, ...req] of this
                .socket) {
                const rep = await this.process(...req);
                try {
                    await this.socket.send([
                        null,
                        types_1.Header.Worker,
                        types_1.Message.Reply,
                        client,
                        null,
                        ...rep,
                    ]);
                }
                catch (err) {
                    console.error(`unable to send reply for ${this.address}`);
                }
            }
        };
        loop();
    }
    async stop() {
        if (!this.socket.closed) {
            await this.socket.send([
                null,
                types_1.Header.Worker,
                types_1.Message.Disconnect,
                this.service,
            ]);
            this.socket.close();
        }
    }
    async process(...req) {
        return req;
    }
}
exports.Worker = Worker;
//# sourceMappingURL=worker.js.map