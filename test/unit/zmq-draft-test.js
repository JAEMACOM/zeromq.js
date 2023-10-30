"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zmq = require("../../src");
const draft = require("../../src/draft");
const chai_1 = require("chai");
if (zmq.capability.draft) {
    describe("zmq draft", function () {
        describe("exports", function () {
            it("should include functions and constructors", function () {
                const expected = [
                    /* Specific socket constructors. */
                    "Server",
                    "Client",
                    "Radio",
                    "Dish",
                    "Gather",
                    "Scatter",
                    "Datagram",
                ];
                chai_1.assert.sameMembers(Object.keys(draft), expected);
            });
        });
    });
}
else {
    if (process.env.ZMQ_DRAFT === "true") {
        throw new Error("Draft API requested but not available at runtime.");
    }
}
//# sourceMappingURL=zmq-draft-test.js.map