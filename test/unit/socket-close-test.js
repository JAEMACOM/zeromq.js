"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-var-requires */
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
const errors_1 = require("../../src/errors");
for (const proto of (0, helpers_1.testProtos)("tcp", "ipc", "inproc")) {
    describe(`socket with ${proto} close`, function () {
        let sock;
        beforeEach(function () {
            sock = new zmq.Dealer();
        });
        afterEach(function () {
            sock.close();
            global.gc?.();
        });
        describe("with explicit call", function () {
            it("should close socket", function () {
                chai_1.assert.equal(sock.closed, false);
                sock.close();
                chai_1.assert.equal(sock.closed, true);
            });
            it("should close socket and cancel send", async function () {
                chai_1.assert.equal(sock.closed, false);
                const promise = sock.send(Buffer.from("foo"));
                sock.close();
                chai_1.assert.equal(sock.closed, true);
                try {
                    await promise;
                }
                catch (err) {
                    if (!(0, errors_1.isFullError)(err)) {
                        throw err;
                    }
                    chai_1.assert.equal(err.message, "Operation was not possible or timed out");
                    chai_1.assert.equal(err.code, "EAGAIN");
                    chai_1.assert.typeOf(err.errno, "number");
                }
            });
            it("should close socket and cancel receive", async function () {
                chai_1.assert.equal(sock.closed, false);
                const promise = sock.receive();
                sock.close();
                chai_1.assert.equal(sock.closed, true);
                try {
                    await promise;
                }
                catch (err) {
                    if (!(0, errors_1.isFullError)(err)) {
                        throw err;
                    }
                    chai_1.assert.equal(err.message, "Operation was not possible or timed out");
                    chai_1.assert.equal(err.code, "EAGAIN");
                    chai_1.assert.typeOf(err.errno, "number");
                }
            });
            it("should close after successful bind", async function () {
                const promise = sock.bind((0, helpers_1.uniqAddress)(proto));
                sock.close();
                chai_1.assert.equal(sock.closed, false);
                await promise;
                chai_1.assert.equal(sock.closed, true);
            });
            it("should close after unsuccessful bind", async function () {
                const address = (0, helpers_1.uniqAddress)(proto);
                await sock.bind(address);
                const promise = sock.bind(address);
                sock.close();
                chai_1.assert.equal(sock.closed, false);
                try {
                    await promise;
                    chai_1.assert.ok(false);
                }
                catch (err) {
                    /* Ignore */
                }
                chai_1.assert.equal(sock.closed, true);
            });
            it("should close after successful unbind", async function () {
                const address = (0, helpers_1.uniqAddress)(proto);
                await sock.bind(address);
                const promise = sock.unbind(address);
                sock.close();
                chai_1.assert.equal(sock.closed, false);
                await promise;
                chai_1.assert.equal(sock.closed, true);
            });
            it("should close after unsuccessful unbind", async function () {
                const address = (0, helpers_1.uniqAddress)(proto);
                const promise = sock.unbind(address);
                sock.close();
                chai_1.assert.equal(sock.closed, false);
                try {
                    await promise;
                    chai_1.assert.ok(false);
                }
                catch (err) {
                    /* Ignore */
                }
                chai_1.assert.equal(sock.closed, true);
            });
            it("should release reference to context", async function () {
                if (process.env.SKIP_GC_TESTS) {
                    this.skip();
                }
                this.slow(200);
                const weak = require("weak-napi");
                let released = false;
                const task = async () => {
                    let context = new zmq.Context();
                    const socket = new zmq.Dealer({ context, linger: 0 });
                    weak(context, () => {
                        released = true;
                    });
                    context = undefined;
                    global.gc?.();
                    socket.connect((0, helpers_1.uniqAddress)(proto));
                    await socket.send(Buffer.from("foo"));
                    socket.close();
                };
                await task();
                global.gc?.();
                await new Promise(resolve => {
                    setTimeout(resolve, 5);
                });
                chai_1.assert.equal(released, true);
            });
        });
        describe("in gc finalizer", function () {
            it("should release reference to context", async function () {
                if (process.env.SKIP_GC_TESTS) {
                    this.skip();
                }
                if (process.env.SKIP_GC_FINALIZER_TESTS) {
                    this.skip();
                }
                this.slow(200);
                const weak = require("weak-napi");
                let released = false;
                const task = async () => {
                    let context = new zmq.Context();
                    new zmq.Dealer({ context, linger: 0 });
                    weak(context, () => {
                        released = true;
                    });
                    context = undefined;
                    global.gc?.();
                };
                await task();
                global.gc?.();
                await new Promise(resolve => {
                    setTimeout(resolve, 5);
                });
                chai_1.assert.equal(released, true);
            });
        });
    });
}
//# sourceMappingURL=socket-close-test.js.map