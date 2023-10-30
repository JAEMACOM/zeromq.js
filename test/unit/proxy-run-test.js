"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
const errors_1 = require("../../src/errors");
for (const proto of (0, helpers_1.testProtos)("tcp", "ipc", "inproc")) {
    describe(`proxy with ${proto} run`, function () {
        let proxy;
        beforeEach(async function () {
            /* ZMQ < 4.0.5 has no steerable proxy support. */
            if (semver.satisfies(zmq.version, "< 4.0.5")) {
                this.skip();
            }
            proxy = new zmq.Proxy(new zmq.Router(), new zmq.Dealer());
        });
        afterEach(function () {
            proxy.frontEnd.close();
            proxy.backEnd.close();
            global.gc?.();
        });
        it("should fail if front end is not bound or connected", async function () {
            await proxy.backEnd.bind((0, helpers_1.uniqAddress)(proto));
            try {
                await proxy.run();
                chai_1.assert.ok(false);
            }
            catch (err) {
                if (!(0, errors_1.isFullError)(err)) {
                    throw err;
                }
                chai_1.assert.equal(err.message, "Front-end socket must be bound or connected");
            }
        });
        it("should fail if front end is not open", async function () {
            await proxy.frontEnd.bind((0, helpers_1.uniqAddress)(proto));
            await proxy.backEnd.bind((0, helpers_1.uniqAddress)(proto));
            proxy.frontEnd.close();
            try {
                await proxy.run();
                chai_1.assert.ok(false);
            }
            catch (err) {
                if (!(0, errors_1.isFullError)(err)) {
                    throw err;
                }
                chai_1.assert.equal(err.message, "Front-end socket must be bound or connected");
            }
        });
        it("should fail if back end is not bound or connected", async function () {
            await proxy.frontEnd.bind((0, helpers_1.uniqAddress)(proto));
            try {
                await proxy.run();
                chai_1.assert.ok(false);
            }
            catch (err) {
                if (!(0, errors_1.isFullError)(err)) {
                    throw err;
                }
                chai_1.assert.equal(err.message, "Back-end socket must be bound or connected");
                chai_1.assert.equal(err.code, "EINVAL");
                chai_1.assert.typeOf(err.errno, "number");
            }
        });
        it("should fail if back end is not open", async function () {
            await proxy.frontEnd.bind((0, helpers_1.uniqAddress)(proto));
            await proxy.backEnd.bind((0, helpers_1.uniqAddress)(proto));
            proxy.backEnd.close();
            try {
                await proxy.run();
                chai_1.assert.ok(false);
            }
            catch (err) {
                if (!(0, errors_1.isFullError)(err)) {
                    throw err;
                }
                chai_1.assert.equal(err.message, "Back-end socket must be bound or connected");
                chai_1.assert.equal(err.code, "EINVAL");
                chai_1.assert.typeOf(err.errno, "number");
            }
        });
    });
}
//# sourceMappingURL=proxy-run-test.js.map