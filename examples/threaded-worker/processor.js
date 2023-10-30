"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Processor = void 0;
const os_1 = require("os");
const zeromq_1 = require("zeromq");
const threaded_worker_1 = require("./threaded-worker");
class Processor {
    constructor(threads = (0, os_1.cpus)().length) {
        this.input = new zeromq_1.Push();
        this.output = new zeromq_1.Pull();
        this.signal = new zeromq_1.Publisher();
        console.log(`starting ${threads} worker threads`);
        console.log("---");
        this.threads = threads;
        this.init = Promise.all([
            this.input.bind("inproc://input"),
            this.output.bind("inproc://output"),
            this.signal.bind("inproc://signal"),
            new Promise(resolve => setTimeout(resolve, 100)),
        ]);
        this.exit = Promise.all([threaded_worker_1.ThreadedWorker.spawn(this.threads)]);
    }
    async process(str) {
        await this.init;
        const input = str.split("");
        for (const req of input.entries()) {
            await this.input.send(req.map(pt => pt.toString()));
        }
        const output = Array.from({ length: input.length });
        for await (const [pos, res] of this.output) {
            output[parseInt(pos.toString(), 10)] = res.toString();
            if (output.every(el => el !== undefined)) {
                break;
            }
        }
        return output.join("");
    }
    async stop() {
        await Promise.all([
            this.signal.send("stop"),
            this.input.unbind("inproc://input"),
            this.output.unbind("inproc://output"),
            this.signal.unbind("inproc://signal"),
        ]);
        await this.exit;
    }
}
exports.Processor = Processor;
//# sourceMappingURL=processor.js.map