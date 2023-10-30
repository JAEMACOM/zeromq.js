"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
for (const proto of (0, helpers_1.testProtos)("tcp", "ipc", "inproc")) {
    describe(`socket with ${proto} pair/pair`, function () {
        let sockA;
        let sockB;
        beforeEach(function () {
            sockA = new zmq.Pair();
            sockB = new zmq.Pair();
        });
        afterEach(function () {
            sockA.close();
            sockB.close();
            global.gc?.();
        });
        describe("send/receive", function () {
            it("should deliver messages", async function () {
                /* PAIR  -> foo ->  PAIR
                   [A]   -> bar ->  [B]
                         -> baz ->  responds when received
                         -> qux ->
                         <- foo <-
                         <- bar <-
                         <- baz <-
                         <- qux <-
                 */
                const address = (0, helpers_1.uniqAddress)(proto);
                const messages = ["foo", "bar", "baz", "qux"];
                const received = [];
                await sockA.bind(address);
                await sockB.connect(address);
                const echo = async () => {
                    for await (const msg of sockB) {
                        await sockB.send(msg);
                    }
                };
                const send = async () => {
                    for (const msg of messages) {
                        await sockA.send(msg);
                    }
                    for await (const msg of sockA) {
                        received.push(msg.toString());
                        if (received.length === messages.length) {
                            break;
                        }
                    }
                    sockB.close();
                };
                await Promise.all([echo(), send()]);
                chai_1.assert.deepEqual(received, messages);
            });
        });
    });
}
//# sourceMappingURL=socket-pair-test.js.map