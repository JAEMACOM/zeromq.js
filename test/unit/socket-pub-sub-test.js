"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
for (const proto of (0, helpers_1.testProtos)("tcp", "ipc", "inproc")) {
    describe(`socket with ${proto} pub/sub`, function () {
        let pub;
        let sub;
        beforeEach(function () {
            pub = new zmq.Publisher();
            sub = new zmq.Subscriber();
        });
        afterEach(function () {
            pub.close();
            sub.close();
            global.gc?.();
        });
        describe("send/receive", function () {
            it("should deliver messages", async function () {
                /* PUB  -> foo ->  SUB
                        -> bar ->  subscribed to all
                        -> baz ->
                        -> qux ->
                 */
                const address = (0, helpers_1.uniqAddress)(proto);
                const messages = ["foo", "bar", "baz", "qux"];
                const received = [];
                /* Subscribe to all. */
                sub.subscribe();
                await sub.bind(address);
                await pub.connect(address);
                const send = async () => {
                    /* Wait briefly before publishing to avoid slow joiner syndrome. */
                    await new Promise(resolve => {
                        setTimeout(resolve, 25);
                    });
                    for (const msg of messages) {
                        await pub.send(msg);
                    }
                };
                const receive = async () => {
                    for await (const [msg] of sub) {
                        chai_1.assert.instanceOf(msg, Buffer);
                        received.push(msg.toString());
                        if (received.length === messages.length) {
                            break;
                        }
                    }
                };
                await Promise.all([send(), receive()]);
                chai_1.assert.deepEqual(received, messages);
            });
        });
        describe("subscribe/unsubscribe", function () {
            it("should filter messages", async function () {
                /* PUB  -> foo -X  SUB
                        -> bar ->  subscribed to "ba"
                        -> baz ->
                        -> qux -X
                 */
                const address = (0, helpers_1.uniqAddress)(proto);
                const messages = ["foo", "bar", "baz", "qux"];
                const received = [];
                sub.subscribe("fo", "ba", "qu");
                sub.unsubscribe("fo", "qu");
                await sub.bind(address);
                await pub.connect(address);
                const send = async () => {
                    /* Wait briefly before publishing to avoid slow joiner syndrome. */
                    await new Promise(resolve => {
                        setTimeout(resolve, 25);
                    });
                    for (const msg of messages) {
                        await pub.send(msg);
                    }
                };
                const receive = async () => {
                    for await (const [msg] of sub) {
                        chai_1.assert.instanceOf(msg, Buffer);
                        received.push(msg.toString());
                        if (received.length === 2) {
                            break;
                        }
                    }
                };
                await Promise.all([send(), receive()]);
                chai_1.assert.deepEqual(received, ["bar", "baz"]);
            });
        });
    });
}
//# sourceMappingURL=socket-pub-sub-test.js.map