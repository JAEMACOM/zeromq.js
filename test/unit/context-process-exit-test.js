"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
describe("context process exit", function () {
    describe("with default context", function () {
        it("should occur when sockets are closed", async function () {
            this.slow(200);
            const { code } = await (0, helpers_1.createProcess)(() => {
                const socket1 = new zmq.Dealer();
                socket1.close();
                const socket2 = new zmq.Router();
                socket2.close();
            });
            chai_1.assert.equal(code, 0);
        });
        it("should occur when sockets are not closed", async function () {
            this.slow(200);
            const { code } = await (0, helpers_1.createProcess)(() => {
                const socket1 = new zmq.Dealer();
                const socket2 = new zmq.Router();
            });
            chai_1.assert.equal(code, 0);
        });
        it("should not occur when sockets are open and polling", async function () {
            this.slow(1000);
            const { code } = await (0, helpers_1.createProcess)(() => {
                const socket1 = new zmq.Dealer();
                socket1.connect("inproc://foo");
                socket1.receive();
            });
            chai_1.assert.equal(code, 1);
        });
        it("should produce warning when messages are queued with blocky", async function () {
            this.slow(2000);
            const { stderr } = await (0, helpers_1.createProcess)(() => {
                zmq.context.blocky = true;
                const socket1 = new zmq.Dealer({ linger: 1000 });
                socket1.connect("tcp://127.0.0.1:4567");
                socket1.send(null);
            });
            if (semver.satisfies(zmq.version, ">= 4.2")) {
                chai_1.assert.match(stderr.toString(), /\(node:\d+\) WARNING: Waiting for queued ZeroMQ messages to be delivered\. Set 'context\.blocky = false' to change this behaviour\.\r?\n/);
            }
            else {
                chai_1.assert.match(stderr.toString(), /\(node:\d+\) WARNING: Waiting for queued ZeroMQ messages to be delivered\.\r?\n/);
            }
        });
        it("should produce warning when messages are queued without blocky", async function () {
            this.slow(2000);
            const { stderr } = await (0, helpers_1.createProcess)(() => {
                zmq.context.blocky = false;
                const socket1 = new zmq.Dealer({ linger: 1000 });
                socket1.connect("tcp://127.0.0.1:4567");
                socket1.send(null);
            });
            chai_1.assert.match(stderr.toString(), /\(node:\d+\) WARNING: Waiting for queued ZeroMQ messages to be delivered\.\r?\n/);
        });
        it("should not produce warning when messages are queued for a short time", async function () {
            this.slow(1000);
            const { stderr } = await (0, helpers_1.createProcess)(() => {
                zmq.context.blocky = true;
                const socket1 = new zmq.Dealer({ linger: 50 });
                socket1.connect("tcp://127.0.0.1:4567");
                socket1.send(null);
            });
            chai_1.assert.equal(stderr.toString(), "");
        });
    });
    describe("with custom context", function () {
        it("should occur when sockets are closed", async function () {
            this.slow(200);
            const { code } = await (0, helpers_1.createProcess)(() => {
                const context = new zmq.Context();
                const socket1 = new zmq.Dealer({ context });
                socket1.close();
                const socket2 = new zmq.Router({ context });
                socket2.close();
            });
            chai_1.assert.equal(code, 0);
        });
        it("should occur when sockets are closed and context is gced", async function () {
            this.slow(200);
            const { code } = await (0, helpers_1.createProcess)(() => {
                function run() {
                    const context = new zmq.Context();
                    const socket1 = new zmq.Dealer({ context });
                    socket1.close();
                    const socket2 = new zmq.Router({ context });
                    socket2.close();
                }
                run();
                global.gc?.();
            });
            chai_1.assert.equal(code, 0);
        });
        it("should occur when sockets are not closed", async function () {
            this.slow(200);
            const { code } = await (0, helpers_1.createProcess)(() => {
                const context = new zmq.Context();
                const socket1 = new zmq.Dealer({ context });
                const socket2 = new zmq.Router({ context });
            });
            chai_1.assert.equal(code, 0);
        });
        it("should not occur when sockets are open and polling", async function () {
            this.slow(1000);
            const { code } = await (0, helpers_1.createProcess)(() => {
                const context = new zmq.Context();
                const socket1 = new zmq.Dealer({ context });
                socket1.connect("inproc://foo");
                socket1.receive();
            });
            chai_1.assert.equal(code, 1);
        });
    });
});
//# sourceMappingURL=context-process-exit-test.js.map