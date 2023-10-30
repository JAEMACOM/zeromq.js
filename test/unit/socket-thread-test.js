"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
for (const proto of (0, helpers_1.testProtos)("tcp", "ipc", "inproc")) {
    describe(`socket with ${proto} in thread`, function () {
        this.slow(2000);
        this.timeout(5000);
        beforeEach(function () {
            /* Node.js worker support introduced in version 10.5. */
            if (semver.satisfies(process.versions.node, "< 10.5")) {
                this.skip();
            }
        });
        describe("when connected within thread", function () {
            it("should deliver messages", async function () {
                const data = { address: (0, helpers_1.uniqAddress)(proto) };
                const recv = await (0, helpers_1.createWorker)(data, async ({ address }) => {
                    const sockA = new zmq.Pair({ linger: 0 });
                    const sockB = new zmq.Pair({ linger: 0 });
                    await sockB.bind(address);
                    await sockA.connect(address);
                    await sockA.send(["foo", "bar"]);
                    return sockB.receive();
                });
                chai_1.assert.deepEqual(["foo", "bar"], recv.map(buf => Buffer.from(buf).toString()));
            });
        });
        describe("when connected to thread", function () {
            it("should deliver messages", async function () {
                const address = (0, helpers_1.uniqAddress)(proto);
                const sockA = new zmq.Pair({ linger: 0 });
                await sockA.bind(address);
                sockA.send(["foo", "bar"]);
                await (0, helpers_1.createWorker)({ address }, async ({ address }) => {
                    const sockB = new zmq.Pair({ linger: 0 });
                    await sockB.connect(address);
                    for await (const msg of sockB) {
                        await sockB.send(msg);
                        return;
                    }
                });
                const recv = await sockA.receive();
                sockA.close();
                chai_1.assert.deepEqual(["foo", "bar"], recv.map(buf => buf.toString()));
            });
        });
        describe("when connected between threads", function () {
            it("should deliver messages", async function () {
                const address = (0, helpers_1.uniqAddress)(proto);
                const worker1 = (0, helpers_1.createWorker)({ address }, async ({ address }) => {
                    const sockA = new zmq.Pair({ linger: 0 });
                    await sockA.bind(address);
                    await sockA.send(["foo", "bar"]);
                    return sockA.receive();
                });
                const worker2 = (0, helpers_1.createWorker)({ address }, async ({ address }) => {
                    const sockB = new zmq.Pair({ linger: 0 });
                    await sockB.connect(address);
                    for await (const msg of sockB) {
                        await sockB.send(msg);
                        return;
                    }
                });
                const [recv] = await Promise.all([worker1, worker2]);
                chai_1.assert.deepEqual(["foo", "bar"], recv.map(buf => Buffer.from(buf).toString()));
            });
        });
    });
}
//# sourceMappingURL=socket-thread-test.js.map