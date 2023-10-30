"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
for (const proto of (0, helpers_1.testProtos)("tcp", "ipc", "inproc")) {
    describe(`proxy with ${proto} router/dealer`, function () {
        let proxy;
        let frontAddress;
        let backAddress;
        let req;
        let rep;
        beforeEach(async function () {
            /* ZMQ < 4.0.5 has no steerable proxy support. */
            if (semver.satisfies(zmq.version, "< 4.0.5")) {
                this.skip();
            }
            proxy = new zmq.Proxy(new zmq.Router(), new zmq.Dealer());
            frontAddress = (0, helpers_1.uniqAddress)(proto);
            backAddress = (0, helpers_1.uniqAddress)(proto);
            req = new zmq.Request();
            rep = new zmq.Reply();
        });
        afterEach(function () {
            /* Closing proxy sockets is only necessary if run() fails. */
            proxy.frontEnd.close();
            proxy.backEnd.close();
            req.close();
            rep.close();
            global.gc?.();
        });
        describe("run", function () {
            it("should proxy messages", async function () {
                /* REQ  -> foo ->  ROUTER <-> DEALER  -> foo ->  REP
                        <- foo <-                     <- foo <-
                        -> bar ->                     -> bar ->
                        <- bar <-                     <- bar <-
                                         pause
                                         resume
                        -> baz ->                     -> baz ->
                        <- baz <-                     <- baz <-
                        -> qux ->                     -> qux ->
                        <- qux <-                     <- qux <-
                 */
                await proxy.frontEnd.bind(frontAddress);
                await proxy.backEnd.bind(backAddress);
                const done = proxy.run();
                const messages = ["foo", "bar", "baz", "qux"];
                const received = [];
                await req.connect(frontAddress);
                await rep.connect(backAddress);
                const echo = async () => {
                    for await (const msg of rep) {
                        await rep.send(msg);
                    }
                };
                const send = async () => {
                    for (const msg of messages) {
                        if (received.length === 2) {
                            proxy.pause();
                            proxy.resume();
                        }
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
                proxy.terminate();
                await done;
            });
        });
    });
}
//# sourceMappingURL=proxy-router-dealer-test.js.map