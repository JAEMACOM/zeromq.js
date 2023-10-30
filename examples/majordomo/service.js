"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const types_1 = require("./types");
class Service {
    constructor(socket, name) {
        this.workers = new Map();
        this.requests = [];
        this.socket = socket;
        this.name = name;
    }
    dispatchRequest(client, ...req) {
        this.requests.push([client, req]);
        this.dispatchPending();
    }
    async dispatchReply(worker, client, ...rep) {
        this.workers.set(worker.toString("hex"), worker);
        console.log(`dispatching '${this.name}' ` +
            `${client.toString("hex")} <- rep ${worker.toString("hex")}`);
        await this.socket.send([client, null, types_1.Header.Client, this.name, ...rep]);
        this.dispatchPending();
    }
    async dispatchPending() {
        while (this.workers.size && this.requests.length) {
            const [key, worker] = this.workers.entries().next().value;
            this.workers.delete(key);
            const [client, req] = this.requests.shift();
            console.log(`dispatching '${this.name}' ` +
                `${client.toString("hex")} req -> ${worker.toString("hex")}`);
            await this.socket.send([
                worker,
                null,
                types_1.Header.Worker,
                types_1.Message.Request,
                client,
                null,
                ...req,
            ]);
        }
    }
    register(worker) {
        console.log(`registered worker ${worker.toString("hex")} for '${this.name}'`);
        this.workers.set(worker.toString("hex"), worker);
        this.dispatchPending();
    }
    deregister(worker) {
        console.log(`deregistered worker ${worker.toString("hex")} for '${this.name}'`);
        this.workers.delete(worker.toString("hex"));
        this.dispatchPending();
    }
}
exports.Service = Service;
//# sourceMappingURL=service.js.map