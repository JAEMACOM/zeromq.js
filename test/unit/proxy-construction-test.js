"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");
const zmq = require("../../src");
const chai_1 = require("chai");
const errors_1 = require("../../src/errors");
describe("proxy construction", function () {
    beforeEach(function () {
        /* ZMQ < 4.0.5 has no steerable proxy support. */
        if (semver.satisfies(zmq.version, "< 4.0.5")) {
            this.skip();
        }
    });
    afterEach(function () {
        global.gc?.();
    });
    describe("with constructor", function () {
        it("should throw if called as function", function () {
            chai_1.assert.throws(() => zmq.Proxy(), TypeError, "Class constructors cannot be invoked without 'new'");
        });
        it("should throw with too few arguments", function () {
            chai_1.assert.throws(() => new zmq.Proxy(), TypeError, "Front-end must be a socket object");
        });
        it("should throw with too many arguments", function () {
            chai_1.assert.throws(() => new zmq.Proxy(new zmq.Dealer(), new zmq.Dealer(), new zmq.Dealer()), TypeError, "Expected 2 arguments");
        });
        it("should throw with invalid socket", function () {
            try {
                new zmq.Proxy({}, {});
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
    });
});
//# sourceMappingURL=proxy-construction-test.js.map