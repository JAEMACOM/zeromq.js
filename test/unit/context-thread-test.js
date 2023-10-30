"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
describe("context in thread", function () {
    this.slow(2000);
    this.timeout(5000);
    beforeEach(function () {
        /* Node.js worker support introduced in version 10.5. */
        if (semver.satisfies(process.versions.node, "< 10.5")) {
            this.skip();
        }
    });
    describe("with default context", function () {
        it("should be shared", async function () {
            try {
                zmq.context.ioThreads = 3;
                const val = await (0, helpers_1.createWorker)({}, async () => {
                    return zmq.context.ioThreads;
                });
                chai_1.assert.equal(val, 3);
            }
            finally {
                zmq.context.ioThreads = 1;
            }
        });
    });
});
//# sourceMappingURL=context-thread-test.js.map