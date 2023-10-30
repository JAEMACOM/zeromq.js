"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
for (const proto of (0, helpers_1.testProtos)("tcp", "ipc", "inproc")) {
    describe(`socket with ${proto} push/pull`, function () {
        let push;
        let pull;
        beforeEach(function () {
            push = new zmq.Push();
            pull = new zmq.Pull();
        });
        afterEach(function () {
            push.close();
            pull.close();
            global.gc?.();
        });
        describe("send/receive", function () {
            it("should deliver messages", async function () {
                /* PUSH  -> foo ->  PULL
                         -> bar ->
                         -> baz ->
                         -> qux ->
                 */
                const address = (0, helpers_1.uniqAddress)(proto);
                const messages = ["foo", "bar", "baz", "qux"];
                const received = [];
                await pull.bind(address);
                await push.connect(address);
                for (const msg of messages) {
                    await push.send(msg);
                }
                for await (const [msg] of pull) {
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
                    await pull.bind(address);
                    push.immediate = true;
                    await push.connect(address);
                    /* Never connected, without immediate: true it would cause lost msgs. */
                    await push.connect((0, helpers_1.uniqAddress)(proto));
                    for (const msg of messages) {
                        await push.send(msg);
                    }
                    for await (const [msg] of pull) {
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
//# sourceMappingURL=socket-push-pull-test.js.map