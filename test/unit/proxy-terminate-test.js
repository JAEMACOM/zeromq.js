"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
const errors_1 = require("../../src/errors");
for (const proto of (0, helpers_1.testProtos)("tcp", "ipc", "inproc")) {
    describe(`proxy with ${proto} terminate`, function () {
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
        it("should throw if called after termination", async function () {
            await proxy.frontEnd.bind((0, helpers_1.uniqAddress)(proto));
            await proxy.backEnd.bind((0, helpers_1.uniqAddress)(proto));
            setTimeout(() => proxy.terminate(), 50);
            await proxy.run();
            try {
                await proxy.terminate();
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
    });
}
//# sourceMappingURL=proxy-terminate-test.js.map