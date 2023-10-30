"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zmq = require("../../src");
const draft = require("../../src/draft");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
if (zmq.capability.draft) {
    for (const proto of (0, helpers_1.testProtos)("tcp", "ipc", "inproc", "udp")) {
        describe(`draft socket with ${proto} radio/dish`, function () {
            let radio;
            let dish;
            beforeEach(function () {
                radio = new draft.Radio();
                dish = new draft.Dish();
            });
            afterEach(function () {
                global.gc?.();
                radio.close();
                dish.close();
                global.gc?.();
            });
            describe("send/receive", function () {
                it("should deliver messages", async function () {
                    /* RADIO -> foo -> DISH
                             -> bar -> joined all
                             -> baz ->
                             -> qux ->
                    */
                    const address = (0, helpers_1.uniqAddress)(proto);
                    const messages = ["foo", "bar", "baz", "qux"];
                    /* Max 15 non-null bytes. */
                    const uuid = Buffer.from([
                        0xf6, 0x46, 0x1f, 0x03, 0xd2, 0x0d, 0xc8, 0x66, 0xe5, 0x5f, 0xf5,
                        0xa1, 0x65, 0x62, 0xb2,
                    ]);
                    const received = [];
                    dish.join(uuid);
                    await dish.bind(address);
                    await radio.connect(address);
                    const send = async () => {
                        /* Wait briefly before publishing to avoid slow joiner syndrome. */
                        await new Promise(resolve => {
                            setTimeout(resolve, 25);
                        });
                        for (const msg of messages) {
                            await radio.send(msg, { group: uuid });
                        }
                    };
                    const receive = async () => {
                        for await (const [msg, { group }] of dish) {
                            chai_1.assert.instanceOf(msg, Buffer);
                            chai_1.assert.instanceOf(group, Buffer);
                            chai_1.assert.deepEqual(group, uuid);
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
            describe("join/leave", function () {
                it("should filter messages", async function () {
                    /* RADIO -> foo -X  DISH
                             -> bar ->  joined "ba"
                             -> baz ->
                             -> qux -X
                    */
                    const address = (0, helpers_1.uniqAddress)(proto);
                    const messages = ["foo", "bar", "baz", "qux"];
                    const received = [];
                    /* Everything after null byte should be ignored. */
                    dish.join(Buffer.from("fo\x00ba"), Buffer.from("ba\x00fo"));
                    dish.leave(Buffer.from("fo"));
                    await dish.bind(address);
                    await radio.connect(address);
                    const send = async () => {
                        /* Wait briefly before publishing to avoid slow joiner syndrome. */
                        await new Promise(resolve => {
                            setTimeout(resolve, 25);
                        });
                        for (const msg of messages) {
                            await radio.send(msg, { group: msg.slice(0, 2) });
                        }
                    };
                    const receive = async () => {
                        for await (const [msg, { group }] of dish) {
                            chai_1.assert.instanceOf(msg, Buffer);
                            chai_1.assert.deepEqual(group, msg.slice(0, 2));
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
}
else {
    if (process.env.ZMQ_DRAFT === "true") {
        throw new Error("Draft API requested but not available at runtime.");
    }
}
//# sourceMappingURL=socket-draft-radio-dish-test.js.map