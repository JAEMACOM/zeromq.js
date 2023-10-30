"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
for (const proto of (0, helpers_1.testProtos)("tcp", "ipc", "inproc")) {
    describe(`socket with ${proto} curve send/receive`, function () {
        let sockA;
        let sockB;
        beforeEach(function () {
            if (!zmq.capability.curve) {
                this.skip();
            }
            const serverKeypair = zmq.curveKeyPair();
            const clientKeypair = zmq.curveKeyPair();
            sockA = new zmq.Pair({
                linger: 0,
                curveServer: true,
                curvePublicKey: serverKeypair.publicKey,
                curveSecretKey: serverKeypair.secretKey,
            });
            sockB = new zmq.Pair({
                linger: 0,
                curveServerKey: serverKeypair.publicKey,
                curvePublicKey: clientKeypair.publicKey,
                curveSecretKey: clientKeypair.secretKey,
            });
        });
        afterEach(function () {
            sockA.close();
            sockB.close();
            global.gc?.();
        });
        describe("when connected", function () {
            beforeEach(async function () {
                if (!zmq.capability.curve) {
                    this.skip();
                }
                const address = (0, helpers_1.uniqAddress)(proto);
                await sockB.bind(address);
                await sockA.connect(address);
            });
            it("should deliver single string message", async function () {
                const sent = "foo";
                await sockA.send(sent);
                const recv = await sockB.receive();
                chai_1.assert.deepEqual([sent], recv.map((buf) => buf.toString()));
            });
        });
    });
}
//# sourceMappingURL=socket-curve-send-receive-test.js.map