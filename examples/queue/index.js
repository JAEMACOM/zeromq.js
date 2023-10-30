"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zeromq_1 = require("zeromq");
const queue_1 = require("./queue");
async function main() {
    const sender = new zeromq_1.Dealer();
    await sender.bind("tcp://127.0.0.1:5555");
    const queue = new queue_1.Queue(sender);
    queue.send("hello");
    queue.send("world!");
    queue.send(null);
    const receiver = new zeromq_1.Dealer();
    receiver.connect("tcp://127.0.0.1:5555");
    for await (const [msg] of receiver) {
        if (msg.length === 0) {
            receiver.close();
            console.log("received: <empty message>");
        }
        else {
            console.log(`received: ${msg}`);
        }
    }
}
main().catch(err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map