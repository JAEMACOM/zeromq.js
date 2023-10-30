"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zmq = require("../../src");
const chai_1 = require("chai");
const errors_1 = require("../../src/errors");
describe("socket construction", function () {
    afterEach(function () {
        global.gc?.();
    });
    describe("with constructor", function () {
        it("should throw if called as function", function () {
            chai_1.assert.throws(() => zmq.Socket(1, new zmq.Context()), TypeError, "Class constructors cannot be invoked without 'new'");
        });
        it("should throw with too few arguments", function () {
            chai_1.assert.throws(() => new zmq.Socket(), TypeError, "Socket type must be a number");
        });
        it("should throw with too many arguments", function () {
            chai_1.assert.throws(() => new zmq.Socket(1, new zmq.Context(), 2), TypeError, "Expected 2 arguments");
        });
        it("should throw with wrong options argument", function () {
            chai_1.assert.throws(() => new zmq.Socket(3, 1), TypeError, "Options must be an object");
        });
        it("should throw with wrong type argument", function () {
            chai_1.assert.throws(() => new zmq.Socket("foo", new zmq.Context()), TypeError, "Socket type must be a number");
        });
        it("should throw with wrong type id", function () {
            try {
                new zmq.Socket(37, new zmq.Context());
                chai_1.assert.ok(false);
            }
            catch (err) {
                if (!(0, errors_1.isFullError)(err)) {
                    throw err;
                }
                chai_1.assert.equal(err.message, "Invalid argument");
                chai_1.assert.equal(err.code, "EINVAL");
                chai_1.assert.typeOf(err.errno, "number");
            }
        });
        it("should throw with invalid context", function () {
            try {
                new zmq.Socket(1, { context: {} });
                chai_1.assert.ok(false);
            }
            catch (err) {
                if (!(0, errors_1.isFullError)(err)) {
                    throw err;
                }
                chai_1.assert.oneOf(err.message, [
                    "Invalid pointer passed as argument" /* before 8.7 */,
                    "Invalid argument" /* as of 8.7 */,
                ]);
            }
        });
        it("should create socket with default context", function () {
            class MySocket extends zmq.Socket {
                constructor() {
                    super(1);
                }
            }
            const sock1 = new MySocket();
            const sock2 = new MySocket();
            chai_1.assert.instanceOf(sock1, zmq.Socket);
            chai_1.assert.equal(sock1.context, sock2.context);
        });
        it("should create socket with given context", function () {
            class MySocket extends zmq.Socket {
                constructor(opts) {
                    super(1, opts);
                }
            }
            const context = new zmq.Context();
            const socket = new MySocket({ context });
            chai_1.assert.instanceOf(socket, zmq.Socket);
            chai_1.assert.equal(socket.context, context);
        });
    });
    describe("with child constructor", function () {
        it("should throw if called as function", function () {
            chai_1.assert.throws(() => zmq.Dealer(), TypeError, "Class constructor Dealer cannot be invoked without 'new'");
        });
        it("should create socket with default context", function () {
            const sock = new zmq.Dealer();
            chai_1.assert.instanceOf(sock, zmq.Dealer);
            chai_1.assert.equal(sock.context, zmq.context);
        });
        it("should create socket with given context", function () {
            const ctxt = new zmq.Context();
            const sock = new zmq.Dealer({ context: ctxt });
            chai_1.assert.instanceOf(sock, zmq.Socket);
            chai_1.assert.equal(sock.context, ctxt);
        });
        it("should set option", function () {
            const sock = new zmq.Dealer({ recoveryInterval: 5 });
            chai_1.assert.equal(sock.recoveryInterval, 5);
        });
        it("should throw with invalid option value", function () {
            chai_1.assert.throws(() => new zmq.Dealer({ recoveryInterval: "hello" }), TypeError, "Option value must be a number");
        });
        it("should throw with readonly option", function () {
            chai_1.assert.throws(() => new zmq.Dealer({ securityMechanism: 1 }), TypeError, "Cannot set property securityMechanism of #<Socket> which has only a getter");
        });
        it("should throw with unknown option", function () {
            chai_1.assert.throws(() => new zmq.Dealer({ doesNotExist: 1 }), TypeError, "Cannot add property doesNotExist, object is not extensible");
        });
        it("should throw with invalid type", function () {
            chai_1.assert.throws(() => new zmq.Socket(4591), Error, "Invalid argument");
        });
        if (!zmq.capability.draft) {
            it("should throw with draft type", function () {
                chai_1.assert.throws(() => new zmq.Socket(14), Error, "Invalid argument");
            });
        }
        it("should throw error on file descriptor limit", async function () {
            const context = new zmq.Context({ maxSockets: 10 });
            const sockets = [];
            const n = 10;
            try {
                for (let i = 0; i < n; i++) {
                    sockets.push(new zmq.Dealer({ context }));
                }
            }
            catch (err) {
                if (!(0, errors_1.isFullError)(err)) {
                    throw err;
                }
                chai_1.assert.equal(err.message, "Too many open file descriptors");
                chai_1.assert.equal(err.code, "EMFILE");
                chai_1.assert.typeOf(err.errno, "number");
            }
            finally {
                for (const socket of sockets) {
                    socket.close();
                }
            }
        });
    });
});
//# sourceMappingURL=socket-construction-test.js.map