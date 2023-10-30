"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
const errors_1 = require("../../src/errors");
for (const proto of (0, helpers_1.testProtos)("tcp", "ipc", "inproc")) {
    describe(`socket with ${proto} req/rep`, function () {
        let req;
        let rep;
        beforeEach(function () {
            req = new zmq.Request();
            rep = new zmq.Reply();
        });
        afterEach(function () {
            req.close();
            rep.close();
            global.gc?.();
        });
        describe("send/receive", function () {
            it("should deliver messages", async function () {
                /* REQ  -> foo ->  REP
                        <- foo <-
                        -> bar ->
                        <- bar <-
                        -> baz ->
                        <- baz <-
                        -> qux ->
                        <- qux <-
                 */
                const address = (0, helpers_1.uniqAddress)(proto);
                const messages = ["foo", "bar", "baz", "qux"];
                const received = [];
                await rep.bind(address);
                await req.connect(address);
                const echo = async () => {
                    for await (const msg of rep) {
                        await rep.send(msg);
                    }
                };
                const send = async () => {
                    for (const msg of messages) {
                        await req.send(Buffer.from(msg));
                        const [res] = await req.receive();
                        received.push(res.toString());
                        if (received.length === messages.length) {
                            break;
                        }
                    }
                    rep.close();
                };
                await Promise.all([echo(), send()]);
                chai_1.assert.deepEqual(received, messages);
            });
            it("should throw when waiting for a response", async function () {
                /* REQ  -> foo ->  REP
                        -X foo
                        <- foo <-
                 */
                const address = (0, helpers_1.uniqAddress)(proto);
                /* FIXME: Also trigger EFSM without setting timeout. */
                req.sendTimeout = 2;
                await rep.bind(address);
                await req.connect(address);
                const echo = async () => {
                    const msg = await rep.receive();
                    await rep.send(msg);
                };
                const send = async () => {
                    await req.send(Buffer.from("foo"));
                    chai_1.assert.equal(req.writable, false);
                    try {
                        await req.send(Buffer.from("bar"));
                        chai_1.assert.ok(false);
                    }
                    catch (err) {
                        if (!(0, errors_1.isFullError)(err)) {
                            throw err;
                        }
                        chai_1.assert.equal(err.message, "Operation cannot be accomplished in current state");
                        chai_1.assert.equal(err.code, "EFSM");
                        chai_1.assert.typeOf(err.errno, "number");
                    }
                    const [msg] = await req.receive();
                    chai_1.assert.deepEqual(msg, Buffer.from("foo"));
                    rep.close();
                };
                await Promise.all([echo(), send()]);
            });
        });
    });
}
//# sourceMappingURL=socket-req-rep-test.js.map