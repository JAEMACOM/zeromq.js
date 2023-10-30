"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreadedWorker = void 0;
const worker_threads_1 = require("worker_threads");
const zmq = require("zeromq");
class ThreadedWorker {
    static async spawn(threads) {
        const workers = Array.from({ length: threads }).map(() => {
            return new Promise((resolve, reject) => {
                const src = `
          const zmq = require("zeromq")
          ${ThreadedWorker.toString()}
          new ThreadedWorker().run()
        `;
                new worker_threads_1.Worker(src, { eval: true }).on("exit", code => {
                    if (code === 0) {
                        resolve(undefined);
                    }
                    else {
                        reject(new Error(`Worker stopped with exit code ${code}`));
                    }
                });
            });
        });
        await Promise.all(workers);
        console.log("all workers stopped");
    }
    constructor() {
        /* Queue only 1 incoming message. */
        this.input = new zmq.Pull({ receiveHighWaterMark: 1 });
        this.output = new zmq.Push();
        this.signal = new zmq.Subscriber();
        this.shift = 13;
        this.maxDelay = 2000; /* Average of 1s. */
        this.input.connect("inproc://input");
        this.output.connect("inproc://output");
        this.signal.connect("inproc://signal");
        this.signal.subscribe();
        const listen = async () => {
            for await (const [sig] of this.signal) {
                if (sig.toString() === "stop") {
                    this.stop();
                }
            }
        };
        listen();
    }
    async stop() {
        this.input.close();
        this.output.close();
        this.signal.close();
    }
    /* Loop over input and produce output. */
    async run() {
        for await (const [pos, req] of this.input) {
            if (req.length !== 1) {
                console.log(`skipping invalid '${req}'`);
                continue;
            }
            console.log(`received work '${req}' at ${pos}`);
            const res = await this.work(req.toString());
            await this.output.send([pos, res]);
            console.log(`finished work '${req}' -> '${res}' at ${pos}`);
        }
    }
    /* Do the actual Caesar shift. */
    async work(req) {
        // await new Promise((resolve) => setTimeout(resolve, Math.random() * this.maxDelay))
        let char = req.charCodeAt(0);
        for (let i = 0; i < 200000001; i++) {
            if (char >= 65 && char <= 90) {
                char = ((char - 65 + this.shift) % 26) + 65;
            }
            else if (char >= 97 && char <= 122) {
                char = ((char - 97 + this.shift) % 26) + 97;
            }
        }
        return String.fromCharCode(char);
    }
}
exports.ThreadedWorker = ThreadedWorker;
//# sourceMappingURL=threaded-worker.js.map