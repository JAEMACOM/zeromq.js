"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
const errors_1 = require("../../src/errors");
for (const proto of (0, helpers_1.testProtos)("tcp", "ipc", "inproc")) {
    describe(`socket with ${proto} connect/disconnect`, function () {
        let sock;
        beforeEach(function () {
            sock = new zmq.Dealer();
        });
        afterEach(function () {
            sock.close();
            global.gc?.();
        });
        describe("connect", function () {
            it("should throw error for invalid uri", async function () {
                try {
                    await sock.connect("foo-bar");
                    chai_1.assert.ok(false);
                }
                catch (err) {
                    if (!(0, errors_1.isFullError)(err)) {
                        throw err;
                    }
                    chai_1.assert.equal(err.message, "Invalid argument");
                    chai_1.assert.equal(err.code, "EINVAL");
                    chai_1.assert.typeOf(err.errno, "number");
                    chai_1.assert.equal(err.address, "foo-bar");
                }
            });
            it("should throw error for invalid protocol", async function () {
                try {
                    await sock.connect("foo://bar");
                    chai_1.assert.ok(false);
                }
                catch (err) {
                    if (!(0, errors_1.isFullError)(err)) {
                        throw err;
                    }
                    chai_1.assert.equal(err.message, "Protocol not supported");
                    chai_1.assert.equal(err.code, "EPROTONOSUPPORT");
                    chai_1.assert.typeOf(err.errno, "number");
                    chai_1.assert.equal(err.address, "foo://bar");
                }
            });
            if (semver.satisfies(zmq.version, ">= 4.1")) {
                it("should allow setting routing id on router", async function () {
                    sock = new zmq.Router({ mandatory: true, linger: 0 });
                    await sock.connect((0, helpers_1.uniqAddress)(proto), { routingId: "remoteId" });
                    await sock.send(["remoteId", "hi"]);
                });
            }
        });
        describe("disconnect", function () {
            it("should throw error if not connected to endpoint", async function () {
                const address = (0, helpers_1.uniqAddress)(proto);
                try {
                    await sock.disconnect(address);
                    chai_1.assert.ok(false);
                }
                catch (err) {
                    if (!(0, errors_1.isFullError)(err)) {
                        throw err;
                    }
                    chai_1.assert.equal(err.message, "No such endpoint");
                    chai_1.assert.equal(err.code, "ENOENT");
                    chai_1.assert.typeOf(err.errno, "number");
                    chai_1.assert.equal(err.address, address);
                }
            });
            it("should throw error for invalid uri", async function () {
                try {
                    await sock.disconnect("foo-bar");
                    chai_1.assert.ok(false);
                }
                catch (err) {
                    if (!(0, errors_1.isFullError)(err)) {
                        throw err;
                    }
                    chai_1.assert.equal(err.message, "Invalid argument");
                    chai_1.assert.equal(err.code, "EINVAL");
                    chai_1.assert.typeOf(err.errno, "number");
                    chai_1.assert.equal(err.address, "foo-bar");
                }
            });
            it("should throw error for invalid protocol", async function () {
                try {
                    await sock.disconnect("foo://bar");
                    chai_1.assert.ok(false);
                }
                catch (err) {
                    if (!(0, errors_1.isFullError)(err)) {
                        throw err;
                    }
                    chai_1.assert.equal(err.message, "Protocol not supported");
                    chai_1.assert.equal(err.code, "EPROTONOSUPPORT");
                    chai_1.assert.typeOf(err.errno, "number");
                    chai_1.assert.equal(err.address, "foo://bar");
                }
            });
        });
    });
}
//# sourceMappingURL=socket-connect-disconnect-test.js.map