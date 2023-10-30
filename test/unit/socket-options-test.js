"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
describe("socket options", function () {
    let warningListeners;
    beforeEach(function () {
        warningListeners = process.listeners("warning");
    });
    afterEach(function () {
        process.removeAllListeners("warning");
        for (const listener of warningListeners) {
            process.on("warning", listener);
        }
        global.gc?.();
    });
    it("should set and get bool socket option", function () {
        const sock = new zmq.Dealer();
        chai_1.assert.equal(sock.immediate, false);
        sock.immediate = true;
        chai_1.assert.equal(sock.immediate, true);
    });
    it("should set and get int32 socket option", function () {
        const sock = new zmq.Dealer();
        chai_1.assert.equal(sock.backlog, 100);
        sock.backlog = 75;
        chai_1.assert.equal(sock.backlog, 75);
    });
    it("should set and get int64 socket option", function () {
        const sock = new zmq.Dealer();
        chai_1.assert.equal(sock.maxMessageSize, -1);
        sock.maxMessageSize = 0xffffffff;
        chai_1.assert.equal(sock.maxMessageSize, 0xffffffff);
    });
    it("should set and get string socket option", function () {
        const sock = new zmq.Dealer();
        chai_1.assert.equal(sock.routingId, null);
        sock.routingId = "åbçdéfghïjk";
        chai_1.assert.equal(sock.routingId, "åbçdéfghïjk");
    });
    it("should set and get string socket option as buffer", function () {
        const sock = new zmq.Dealer();
        chai_1.assert.equal(sock.routingId, null);
        sock.routingId = Buffer.from("åbçdéfghïjk");
        chai_1.assert.equal(sock.routingId, "åbçdéfghïjk");
    });
    it("should set and get string socket option to undefined", function () {
        if (semver.satisfies(zmq.version, "> 4.2.3")) {
            /* As of ZMQ 4.2.4, zap domain can no longer be reset to null. */
            const sock = new zmq.Dealer();
            chai_1.assert.equal(sock.socksProxy, undefined);
            sock.socksProxy = Buffer.from("foo");
            chai_1.assert.equal(sock.socksProxy, "foo");
            sock.socksProxy = null;
            chai_1.assert.equal(sock.socksProxy, undefined);
        }
        else {
            /* Older ZMQ versions did not allow socks proxy to be reset to null. */
            const sock = new zmq.Dealer();
            chai_1.assert.equal(sock.zapDomain, undefined);
            sock.zapDomain = Buffer.from("foo");
            chai_1.assert.equal(sock.zapDomain, "foo");
            sock.zapDomain = null;
            chai_1.assert.equal(sock.zapDomain, undefined);
        }
    });
    it("should set and get bool socket option", function () {
        const sock = new zmq.Dealer();
        chai_1.assert.equal(sock.getBoolOption(39), false);
        sock.setBoolOption(39, true);
        chai_1.assert.equal(sock.getBoolOption(39), true);
    });
    it("should set and get int32 socket option", function () {
        const sock = new zmq.Dealer();
        chai_1.assert.equal(sock.getInt32Option(19), 100);
        sock.setInt32Option(19, 75);
        chai_1.assert.equal(sock.getInt32Option(19), 75);
    });
    it("should set and get int64 socket option", function () {
        const sock = new zmq.Dealer();
        chai_1.assert.equal(sock.getInt64Option(22), -1);
        sock.setInt64Option(22, 0xffffffffffff);
        chai_1.assert.equal(sock.getInt64Option(22), 0xffffffffffff);
    });
    it("should set and get uint64 socket option", function () {
        process.removeAllListeners("warning");
        const sock = new zmq.Dealer();
        chai_1.assert.equal(sock.getUint64Option(4), 0);
        sock.setUint64Option(4, 0xffffffffffffffff);
        chai_1.assert.equal(sock.getUint64Option(4), 0xffffffffffffffff);
    });
    it("should set and get string socket option", function () {
        const sock = new zmq.Dealer();
        chai_1.assert.equal(sock.getStringOption(5), null);
        sock.setStringOption(5, "åbçdéfghïjk");
        chai_1.assert.equal(sock.getStringOption(5), "åbçdéfghïjk");
    });
    it("should set and get string socket option as buffer", function () {
        const sock = new zmq.Dealer();
        chai_1.assert.equal(sock.getStringOption(5), null);
        sock.setStringOption(5, Buffer.from("åbçdéfghïjk"));
        chai_1.assert.equal(sock.getStringOption(5), "åbçdéfghïjk");
    });
    it("should set and get string socket option to null", function () {
        if (semver.satisfies(zmq.version, "> 4.2.3")) {
            /* As of ZMQ 4.2.4, zap domain can no longer be reset to null. */
            const sock = new zmq.Dealer();
            chai_1.assert.equal(sock.getStringOption(68), null);
            sock.setStringOption(68, Buffer.from("åbçdéfghïjk"));
            chai_1.assert.equal(sock.getStringOption(68), Buffer.from("åbçdéfghïjk"));
            sock.setStringOption(68, null);
            chai_1.assert.equal(sock.getStringOption(68), null);
        }
        else {
            /* Older ZMQ versions did not allow socks proxy to be reset to null. */
            const sock = new zmq.Dealer();
            chai_1.assert.equal(sock.getStringOption(55), null);
            sock.setStringOption(55, Buffer.from("åbçdéfghïjk"));
            chai_1.assert.equal(sock.getStringOption(55), Buffer.from("åbçdéfghïjk"));
            sock.setStringOption(55, null);
            chai_1.assert.equal(sock.getStringOption(55), null);
        }
    });
    it("should throw for readonly option", function () {
        const sock = new zmq.Dealer();
        chai_1.assert.throws(() => (sock.securityMechanism = 1), TypeError, "Cannot set property securityMechanism of #<Socket> which has only a getter");
    });
    it("should throw for unknown option", function () {
        const sock = new zmq.Dealer();
        chai_1.assert.throws(() => (sock.doesNotExist = 1), TypeError, "Cannot add property doesNotExist, object is not extensible");
    });
    it("should get mechanism", function () {
        const sock = new zmq.Dealer();
        chai_1.assert.equal(sock.securityMechanism, null);
        sock.plainServer = true;
        chai_1.assert.equal(sock.securityMechanism, "plain");
    });
    describe("warnings", function () {
        beforeEach(function () {
            /* ZMQ < 4.2 fails with assertion errors with inproc.
               See: https://github.com/zeromq/libzmq/pull/2123/files */
            if (semver.satisfies(zmq.version, "< 4.2")) {
                this.skip();
            }
            warningListeners = process.listeners("warning");
        });
        afterEach(function () {
            process.removeAllListeners("warning");
            for (const listener of warningListeners) {
                process.on("warning", listener);
            }
        });
        it("should be emitted for set after connect", async function () {
            const warnings = [];
            process.removeAllListeners("warning");
            process.on("warning", warning => warnings.push(warning));
            const sock = new zmq.Dealer();
            sock.connect((0, helpers_1.uniqAddress)("inproc"));
            sock.routingId = "asdf";
            await new Promise(process.nextTick);
            chai_1.assert.deepEqual(warnings.map(w => w.message), ["Socket option will not take effect until next connect/bind."]);
            sock.close();
        });
        it("should be emitted for set during bind", async function () {
            const warnings = [];
            process.removeAllListeners("warning");
            process.on("warning", warning => warnings.push(warning));
            const sock = new zmq.Dealer();
            const promise = sock.bind((0, helpers_1.uniqAddress)("inproc"));
            sock.routingId = "asdf";
            await new Promise(process.nextTick);
            chai_1.assert.deepEqual(warnings.map(w => w.message), ["Socket option will not take effect until next connect/bind."]);
            await promise;
            sock.close();
        });
        it("should be emitted for set after bind", async function () {
            const warnings = [];
            process.removeAllListeners("warning");
            process.on("warning", warning => warnings.push(warning));
            const sock = new zmq.Dealer();
            await sock.bind((0, helpers_1.uniqAddress)("inproc"));
            sock.routingId = "asdf";
            await new Promise(process.nextTick);
            chai_1.assert.deepEqual(warnings.map(w => w.message), ["Socket option will not take effect until next connect/bind."]);
            sock.close();
        });
        it("should be emitted when setting large uint64 socket option", async function () {
            const warnings = [];
            process.removeAllListeners("warning");
            process.on("warning", warning => warnings.push(warning));
            const sock = new zmq.Dealer();
            sock.setUint64Option(4, 0xfffffff7fab7fb);
            chai_1.assert.equal(sock.getUint64Option(4), 0xfffffff7fab7fb);
            await new Promise(process.nextTick);
            chai_1.assert.deepEqual(warnings.map(w => w.message), [
                "Value is larger than Number.MAX_SAFE_INTEGER and " +
                    "may have been rounded inaccurately.",
            ]);
        });
    });
});
//# sourceMappingURL=socket-options-test.js.map