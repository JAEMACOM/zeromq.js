"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
const errors_1 = require("../../src/errors");
for (const proto of (0, helpers_1.testProtos)("tcp", "ipc", "inproc")) {
    describe(`socket with ${proto} router/dealer`, function () {
        let router;
        let dealerA;
        let dealerB;
        beforeEach(function () {
            router = new zmq.Router();
            dealerA = new zmq.Dealer();
            dealerB = new zmq.Dealer();
        });
        afterEach(function () {
            router.close();
            dealerA.close();
            dealerB.close();
            global.gc?.();
        });
        describe("send/receive", function () {
            it("should deliver messages", async function () {
                const address = (0, helpers_1.uniqAddress)(proto);
                const messages = ["foo", "bar", "baz", "qux"];
                const receivedA = [];
                const receivedB = [];
                await router.bind(address);
                dealerA.connect(address);
                dealerB.connect(address);
                const echo = async () => {
                    for await (const [sender, msg] of router) {
                        await router.send([sender, msg]);
                    }
                };
                const send = async () => {
                    for (const msg of messages) {
                        await dealerA.send(msg);
                        await dealerB.send(msg);
                    }
                    for await (const msg of dealerA) {
                        receivedA.push(msg.toString());
                        if (receivedA.length === messages.length) {
                            break;
                        }
                    }
                    for await (const msg of dealerB) {
                        receivedB.push(msg.toString());
                        if (receivedB.length === messages.length) {
                            break;
                        }
                    }
                    router.close();
                };
                await Promise.all([echo(), send()]);
                chai_1.assert.deepEqual(receivedA, messages);
                chai_1.assert.deepEqual(receivedB, messages);
            });
            /* This only works reliably with ZMQ 4.2.3+ */
            if (semver.satisfies(zmq.version, ">= 4.2.3")) {
                it("should fail with unroutable message if mandatory", async function () {
                    router.mandatory = true;
                    router.sendTimeout = 0;
                    try {
                        await router.send(["fooId", "foo"]);
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
            }
        });
    });
}
//# sourceMappingURL=socket-router-dealer-test.js.map