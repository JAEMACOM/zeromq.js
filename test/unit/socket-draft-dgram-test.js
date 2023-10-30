"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zmq = require("../../src");
const draft = require("../../src/draft");
const chai_1 = require("chai");
const dgram_1 = require("dgram");
const helpers_1 = require("./helpers");
if (zmq.capability.draft) {
    for (const proto of (0, helpers_1.testProtos)("udp")) {
        describe(`draft socket with ${proto} dgram`, function () {
            let dgram;
            beforeEach(function () {
                dgram = new draft.Datagram();
            });
            afterEach(function () {
                dgram.close();
                global.gc?.();
            });
            describe("send/receive", function () {
                it("should deliver messages", async function () {
                    const messages = ["foo", "bar", "baz", "qux"];
                    const address = (0, helpers_1.uniqAddress)(proto);
                    const port = parseInt(address.split(":").pop(), 10);
                    await dgram.bind(address);
                    const echo = async () => {
                        for await (const [id, msg] of dgram) {
                            await dgram.send([id, msg]);
                        }
                    };
                    const received = [];
                    const send = async () => {
                        for (const msg of messages) {
                            const client = (0, dgram_1.createSocket)("udp4");
                            await new Promise(resolve => {
                                client.on("message", res => {
                                    received.push(res.toString());
                                    client.close();
                                    resolve(undefined);
                                });
                                client.send(msg, port, "localhost");
                            });
                        }
                        dgram.close();
                    };
                    await Promise.all([echo(), send()]);
                    chai_1.assert.deepEqual(received, messages);
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
//# sourceMappingURL=socket-draft-dgram-test.js.map