"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");
const zmq = require("../../src");
const chai_1 = require("chai");
describe("zmq", function () {
    describe("exports", function () {
        it("should include functions and constructors", function () {
            const expected = [
                /* Utility functions. */
                "version",
                "capability",
                "curveKeyPair",
                /* The global/default context. */
                "context",
                /* Generic constructors. */
                "Context",
                "Socket",
                "Observer",
                "Proxy",
                /* Specific socket constructors. */
                "Pair",
                "Publisher",
                "Subscriber",
                "Request",
                "Reply",
                "Dealer",
                "Router",
                "Pull",
                "Push",
                "XPublisher",
                "XSubscriber",
                "Stream",
            ];
            /* ZMQ < 4.0.5 has no steerable proxy support. */
            if (semver.satisfies(zmq.version, "< 4.0.5")) {
                expected.splice(expected.indexOf("Proxy"), 1);
            }
            chai_1.assert.sameMembers(Object.keys(zmq), expected);
        });
    });
    describe("version", function () {
        it("should return version string", function () {
            if (process.env.ZMQ_VERSION) {
                chai_1.assert.equal(zmq.version, process.env.ZMQ_VERSION);
            }
            else {
                chai_1.assert.match(zmq.version, /^\d+\.\d+\.\d+$/);
            }
        });
    });
    describe("capability", function () {
        it("should return library capability booleans", function () {
            chai_1.assert.equal(Object.values(zmq.capability).every(c => typeof c === "boolean"), true);
        });
    });
    describe("curve keypair", function () {
        beforeEach(function () {
            if (!zmq.capability.curve) {
                this.skip();
            }
        });
        it("should return keypair", function () {
            const { publicKey, secretKey } = zmq.curveKeyPair();
            chai_1.assert.match(publicKey, /^[\x20-\x7F]{40}$/);
            chai_1.assert.match(secretKey, /^[\x20-\x7F]{40}$/);
        });
    });
});
//# sourceMappingURL=zmq-test.js.map