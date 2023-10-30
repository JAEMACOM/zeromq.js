"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
const errors_1 = require("../../src/errors");
for (const proto of (0, helpers_1.testProtos)("tcp", "ipc", "inproc")) {
    describe(`socket with ${proto} bind/unbind`, function () {
        let sock;
        beforeEach(function () {
            sock = new zmq.Dealer();
        });
        afterEach(function () {
            sock.close();
            global.gc?.();
        });
        describe("bind", function () {
            it("should resolve", async function () {
                await sock.bind((0, helpers_1.uniqAddress)(proto));
                chai_1.assert.ok(true);
            });
            it("should throw error if not bound to endpoint", async function () {
                const address = (0, helpers_1.uniqAddress)(proto);
                try {
                    await sock.unbind(address);
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
                    await sock.bind("foo-bar");
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
                    await sock.bind("foo://bar");
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
            it("should fail during other bind", async function () {
                let promise;
                try {
                    promise = sock.bind((0, helpers_1.uniqAddress)(proto));
                    await sock.bind((0, helpers_1.uniqAddress)(proto));
                    chai_1.assert.ok(false);
                }
                catch (err) {
                    if (!(0, errors_1.isFullError)(err)) {
                        throw err;
                    }
                    chai_1.assert.equal(err.message, "Socket is blocked by a bind or unbind operation");
                    chai_1.assert.equal(err.code, "EBUSY");
                    chai_1.assert.typeOf(err.errno, "number");
                }
                await promise;
            });
        });
        describe("unbind", function () {
            it("should unbind", async function () {
                const address = (0, helpers_1.uniqAddress)(proto);
                await sock.bind(address);
                await sock.unbind(address);
                chai_1.assert.ok(true);
            });
            it("should throw error for invalid uri", async function () {
                try {
                    await sock.unbind("foo-bar");
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
                    await sock.unbind("foo://bar");
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
            it("should fail during other unbind", async function () {
                let promise;
                const address = (0, helpers_1.uniqAddress)(proto);
                await sock.bind(address);
                try {
                    promise = sock.unbind(address);
                    await sock.unbind(address);
                    chai_1.assert.ok(false);
                }
                catch (err) {
                    if (!(0, errors_1.isFullError)(err)) {
                        throw err;
                    }
                    chai_1.assert.equal(err.message, "Socket is blocked by a bind or unbind operation");
                    chai_1.assert.equal(err.code, "EBUSY");
                    chai_1.assert.typeOf(err.errno, "number");
                }
                await promise;
            });
        });
    });
}
//# sourceMappingURL=socket-bind-unbind-test.js.map