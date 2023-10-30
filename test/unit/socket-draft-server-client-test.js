"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zmq = require("../../src");
const draft = require("../../src/draft");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
const errors_1 = require("../../src/errors");
if (zmq.capability.draft) {
    for (const proto of (0, helpers_1.testProtos)("tcp", "ipc", "inproc")) {
        describe(`draft socket with ${proto} server/client`, function () {
            let server;
            let clientA;
            let clientB;
            beforeEach(function () {
                server = new draft.Server();
                clientA = new draft.Client();
                clientB = new draft.Client();
            });
            afterEach(function () {
                server.close();
                clientA.close();
                clientB.close();
                global.gc?.();
            });
            describe("send/receive", function () {
                it("should deliver messages", async function () {
                    const address = (0, helpers_1.uniqAddress)(proto);
                    const messages = ["foo", "bar", "baz", "qux"];
                    const receivedA = [];
                    const receivedB = [];
                    await server.bind(address);
                    clientA.connect(address);
                    clientB.connect(address);
                    const echo = async () => {
                        for await (const [msg, { routingId }] of server) {
                            chai_1.assert.typeOf(routingId, "number");
                            await server.send(msg, { routingId });
                        }
                    };
                    const send = async () => {
                        for (const msg of messages) {
                            await clientA.send(msg);
                            await clientB.send(msg);
                        }
                        for await (const msg of clientA) {
                            receivedA.push(msg.toString());
                            if (receivedA.length === messages.length) {
                                break;
                            }
                        }
                        for await (const msg of clientB) {
                            receivedB.push(msg.toString());
                            if (receivedB.length === messages.length) {
                                break;
                            }
                        }
                        server.close();
                    };
                    await Promise.all([echo(), send()]);
                    chai_1.assert.deepEqual(receivedA, messages);
                    chai_1.assert.deepEqual(receivedB, messages);
                });
                it("should fail with unroutable message", async function () {
                    try {
                        await server.send("foo", { routingId: 12345 });
                        chai_1.assert.ok(false);
                    }
                    catch (err) {
                        if (!(0, errors_1.isFullError)(err)) {
                            throw err;
                        }
                        chai_1.assert.equal(err.message, "Host unreachable");
                        chai_1.assert.equal(err.code, "EHOSTUNREACH");
                        chai_1.assert.typeOf(err.errno, "number");
                    }
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
//# sourceMappingURL=socket-draft-server-client-test.js.map