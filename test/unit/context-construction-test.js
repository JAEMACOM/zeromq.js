"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zmq = require("../../src");
const chai_1 = require("chai");
describe("context construction", function () {
    afterEach(function () {
        global.gc?.();
    });
    it("should throw if called as function", function () {
        chai_1.assert.throws(() => zmq.Context(), TypeError, "Class constructors cannot be invoked without 'new'");
    });
    it("should throw with wrong options argument", function () {
        chai_1.assert.throws(() => new zmq.Context(1), TypeError, "Options must be an object");
    });
    it("should throw with too many arguments", function () {
        chai_1.assert.throws(() => new zmq.Context({}, 2), TypeError, "Expected 1 argument");
    });
    it("should set option", function () {
        const context = new zmq.Context({ ioThreads: 5 });
        chai_1.assert.equal(context.ioThreads, 5);
    });
    it("should throw with invalid option value", function () {
        chai_1.assert.throws(() => new zmq.Context({ ioThreads: "hello" }), TypeError, "Option value must be a number");
    });
    it("should throw with readonly option", function () {
        chai_1.assert.throws(() => new zmq.Context({ maxSocketsLimit: 1 }), TypeError, "Cannot set property maxSocketsLimit of #<Context> which has only a getter");
    });
    it("should throw with unknown option", function () {
        chai_1.assert.throws(() => new zmq.Context({ doesNotExist: 1 }), TypeError, "Cannot add property doesNotExist, object is not extensible");
    });
});
//# sourceMappingURL=context-construction-test.js.map