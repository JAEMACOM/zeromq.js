"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zmq = require("../../src");
const draft = require("../../src/draft");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
if (zmq.capability.draft) {
    for (const proto of (0, helpers_1.testProtos)("tcp", "ipc", "inproc")) {
        describe(`socket with ${proto} scatter/gather`, function () {
            let scatter;
            let gather;
            beforeEach(function () {
                scatter = new draft.Scatter();
                gather = new draft.Gather();
            });
            afterEach(function () {
                scatter.close();
                gather.close();
                global.gc?.();
            });
            describe("send/receive", function () {
                it("should deliver messages", async function () {
                    /* SCATTER -> foo ->  GATHER
                               -> bar ->
                               -> baz ->
                               -> qux ->
                    */
                    const address = (0, helpers_1.uniqAddress)(proto);
                    const messages = ["foo", "bar", "baz", "qux"];
                    const received = [];
                    await gather.bind(address);
                    await scatter.connect(address);
                    for (const msg of messages) {
                        await scatter.send(msg);
                    }
                    for await (const [msg] of gather) {
                        chai_1.assert.instanceOf(msg, Buffer);
                        received.push(msg.toString());
                        if (received.length === messages.length) {
                            break;
                        }
                    }
                    chai_1.assert.deepEqual(received, messages);
                });
                if (proto !== "inproc") {
                    it("should deliver messages with immediate", async function () {
                        const address = (0, helpers_1.uniqAddress)(proto);
                        const messages = ["foo", "bar", "baz", "qux"];
                        const received = [];
                        await gather.bind(address);
                        scatter.immediate = true;
                        await scatter.connect(address);
                        /* Never connected, without immediate: true it would cause lost msgs. */
                        await scatter.connect((0, helpers_1.uniqAddress)(proto));
                        for (const msg of messages) {
                            await scatter.send(msg);
                        }
                        for await (const [msg] of gather) {
                            chai_1.assert.instanceOf(msg, Buffer);
                            received.push(msg.toString());
                            if (received.length === messages.length) {
                                break;
                            }
                        }
                        chai_1.assert.deepEqual(received, messages);
                    });
                }
            });
        });
    }
}
else {
    if (process.env.ZMQ_DRAFT === "true") {
        throw new Error("Draft API requested but not available at runtime.");
    }
}
//# sourceMappingURL=socket-draft-scatter-gather-test.js.map