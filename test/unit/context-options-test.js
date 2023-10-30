"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zmq = require("../../src");
const chai_1 = require("chai");
describe("context options", function () {
    afterEach(function () {
        global.gc?.();
    });
    it("should set and get bool socket option", function () {
        const context = new zmq.Context();
        chai_1.assert.equal(context.ipv6, false);
        context.ipv6 = true;
        chai_1.assert.equal(context.ipv6, true);
    });
    it("should set and get int socket option", function () {
        const context = new zmq.Context();
        chai_1.assert.equal(context.ioThreads, 1);
        context.ioThreads = 75;
        chai_1.assert.equal(context.ioThreads, 75);
    });
    it("should throw for readonly option", function () {
        const context = new zmq.Context();
        chai_1.assert.throws(() => (context.maxSocketsLimit = 1), TypeError, "Cannot set property maxSocketsLimit of #<Context> which has only a getter");
    });
    it("should throw for unknown option", function () {
        const context = new zmq.Context();
        chai_1.assert.throws(() => (context.doesNotExist = 1), TypeError, "Cannot add property doesNotExist, object is not extensible");
    });
});
//# sourceMappingURL=context-options-test.js.map