"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
describe("socket process exit", function () {
    /* Reported: https://github.com/nodejs/node-addon-api/issues/591 */
    it.skip("should occur cleanly when sending in exit hook", async function () {
        this.slow(200);
        const { code } = await (0, helpers_1.createProcess)(async () => {
            const sockA = new zmq.Pair();
            const sockB = new zmq.Pair();
            await sockA.bind("inproc://test-1");
            sockB.connect("inproc://test-1");
            process.on("exit", () => {
                console.log("hook");
                sockB.receive();
                sockA.send("foo");
            });
        });
        chai_1.assert.equal(code, 0);
    });
    it("should occur cleanly when sending on unbound socket", async function () {
        this.slow(200);
        const { code } = await (0, helpers_1.createProcess)(async () => {
            const sock = new zmq.Publisher();
            await sock.send("test");
        });
        chai_1.assert.equal(code, 0);
    });
    it("should not occur when sending and blocked on unbound socket", async function () {
        this.slow(1000);
        const { code } = await (0, helpers_1.createProcess)(async () => {
            const sock = new zmq.Dealer();
            await sock.send("test");
        });
        chai_1.assert.equal(code, -1);
    });
    it("should occur cleanly on socket close when reading events", async function () {
        this.slow(200);
        const { code } = await (0, helpers_1.createProcess)(() => {
            const sock = new zmq.Dealer();
            async function readEvents() {
                const events = [];
                for await (const event of sock.events) {
                    events.push(event);
                }
            }
            readEvents();
            sock.close();
        });
        chai_1.assert.equal(code, 0);
    });
    it("should not occur while reading events", async function () {
        this.slow(1000);
        const { code } = await (0, helpers_1.createProcess)(async () => {
            const sock = new zmq.Dealer();
            const events = [];
            for await (const event of sock.events) {
                events.push(event);
            }
        });
        chai_1.assert.equal(code, -1);
    });
});
//# sourceMappingURL=socket-process-exit-test.js.map