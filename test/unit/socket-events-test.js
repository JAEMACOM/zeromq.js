"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
const errors_1 = require("../../src/errors");
for (const proto of (0, helpers_1.testProtos)("tcp", "ipc", "inproc")) {
    describe(`socket with ${proto} events`, function () {
        let sockA;
        let sockB;
        beforeEach(function () {
            sockA = new zmq.Dealer();
            sockB = new zmq.Dealer();
        });
        afterEach(function () {
            sockA.close();
            sockB.close();
            global.gc?.();
        });
        describe("when not connected", function () {
            it("should receive events", async function () {
                const done = (0, helpers_1.captureEventsUntil)(sockA, "end");
                sockA.close();
                const events = await done;
                chai_1.assert.deepEqual(events, [{ type: "end" }]);
            });
        });
        describe("when connected", function () {
            it("should return same object", function () {
                chai_1.assert.equal(sockA.events, sockA.events);
            });
            if (proto !== "inproc") {
                it("should receive bind events", async function () {
                    const address = (0, helpers_1.uniqAddress)(proto);
                    const [event] = await Promise.all([
                        (0, helpers_1.captureEvent)(sockA, "bind"),
                        sockA.bind(address),
                        sockB.connect(address),
                    ]);
                    chai_1.assert.deepEqual(event, { type: "bind", address });
                });
                it("should receive connect events", async function () {
                    this.slow(250);
                    const address = (0, helpers_1.uniqAddress)(proto);
                    const [event] = await Promise.all([
                        (0, helpers_1.captureEvent)(sockB, "connect"),
                        sockA.bind(address),
                        sockB.connect(address),
                    ]);
                    chai_1.assert.deepEqual(event, { type: "connect", address });
                });
            }
            if (proto === "tcp") {
                it("should receive error events", async function () {
                    const address = (0, helpers_1.uniqAddress)(proto);
                    await sockA.bind(address);
                    const [event] = await Promise.all([
                        (0, helpers_1.captureEvent)(sockB, "bind:error"),
                        sockB.bind(address).catch(() => {
                            /* Ignore */
                        }),
                    ]);
                    chai_1.assert.equal(`tcp://${event.address}`, address);
                    chai_1.assert.instanceOf(event.error, Error);
                    chai_1.assert.equal(event.error.message, "Address already in use");
                    chai_1.assert.equal(event.error.code, "EADDRINUSE");
                    chai_1.assert.typeOf(event.error.errno, "number");
                });
            }
            it("should receive events with emitter", async function () {
                const address = (0, helpers_1.uniqAddress)(proto);
                const events = [];
                sockA.events.on("bind", event => {
                    events.push(event);
                });
                sockA.events.on("accept", event => {
                    events.push(event);
                });
                sockA.events.on("close", event => {
                    events.push(event);
                });
                sockA.events.on("end", event => {
                    events.push(event);
                });
                chai_1.assert.throws(() => sockA.events.receive(), Error, "Observer is in event emitter mode. After a call to events.on() it " +
                    "is not possible to read events with events.receive().");
                const connected = (0, helpers_1.captureEvent)(sockB, "connect");
                const done = Promise.all([
                    (0, helpers_1.captureEvent)(sockA, "end"),
                    sockA.bind(address),
                    sockB.connect(address),
                ]);
                if (proto !== "inproc") {
                    await connected;
                }
                sockA.close();
                sockB.close();
                await done;
                if (proto === "inproc") {
                    chai_1.assert.deepEqual(events, [{ type: "end" }]);
                }
                else {
                    chai_1.assert.deepInclude(events, { type: "bind", address });
                    chai_1.assert.deepInclude(events, { type: "accept", address });
                    chai_1.assert.deepInclude(events, { type: "close", address });
                    chai_1.assert.deepInclude(events, { type: "end" });
                }
            });
        });
        describe("when closed automatically", function () {
            it("should not be able to receive", async function () {
                const events = sockA.events;
                sockA.close();
                const { type } = await events.receive();
                chai_1.assert.equal(type, "end");
                try {
                    await events.receive();
                    chai_1.assert.ok(false);
                }
                catch (err) {
                    if (!(0, errors_1.isFullError)(err)) {
                        throw err;
                    }
                    chai_1.assert.equal(err.message, "Socket is closed");
                    chai_1.assert.equal(err.code, "EBADF");
                    chai_1.assert.typeOf(err.errno, "number");
                }
            });
            it("should be closed", async function () {
                const events = sockA.events;
                sockA.close();
                await events.receive();
                chai_1.assert.equal(events.closed, true);
            });
        });
    });
}
//# sourceMappingURL=socket-events-test.js.map