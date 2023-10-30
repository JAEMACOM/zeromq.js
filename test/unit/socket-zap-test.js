"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const semver = require("semver");
const zmq = require("../../src");
const chai_1 = require("chai");
const helpers_1 = require("./helpers");
for (const proto of (0, helpers_1.testProtos)("tcp", "ipc")) {
    describe(`socket with ${proto} zap`, function () {
        let sockA;
        let sockB;
        let handler;
        beforeEach(function () {
            sockA = new zmq.Pair();
            sockB = new zmq.Pair();
        });
        afterEach(function () {
            if (handler) {
                handler.stop();
            }
            sockA.close();
            sockB.close();
            global.gc?.();
        });
        describe("with plain mechanism", function () {
            it("should deliver message", async function () {
                handler = new ValidatingZapHandler({
                    domain: "test",
                    mechanism: "PLAIN",
                    credentials: ["user", "pass"],
                });
                sockA.plainServer = true;
                sockA.zapDomain = "test";
                sockB.plainUsername = "user";
                sockB.plainPassword = "pass";
                chai_1.assert.equal(sockA.securityMechanism, "plain");
                chai_1.assert.equal(sockB.securityMechanism, "plain");
                const address = (0, helpers_1.uniqAddress)(proto);
                await sockA.bind(address);
                await sockB.connect(address);
                const sent = "foo";
                await sockA.send(sent);
                const recv = await sockB.receive();
                chai_1.assert.deepEqual([sent], recv.map((buf) => buf.toString()));
            });
            it("should report authentication error", async function () {
                /* ZMQ < 4.3.0 does not have these event details. */
                if (semver.satisfies(zmq.version, "< 4.3.0")) {
                    this.skip();
                }
                handler = new ValidatingZapHandler({
                    domain: "test",
                    mechanism: "PLAIN",
                    credentials: ["user", "pass"],
                });
                sockA.plainServer = true;
                sockA.zapDomain = "test";
                sockB.plainUsername = "user";
                sockB.plainPassword = "BAD PASS";
                const address = (0, helpers_1.uniqAddress)(proto);
                const [eventA, eventB] = await Promise.all([
                    (0, helpers_1.captureEvent)(sockA, "handshake:error:auth"),
                    (0, helpers_1.captureEvent)(sockB, "handshake:error:auth"),
                    sockA.bind(address),
                    sockB.connect(address),
                ]);
                chai_1.assert.equal(eventA.type, "handshake:error:auth");
                chai_1.assert.equal(eventB.type, "handshake:error:auth");
                chai_1.assert.equal(eventA.address, address);
                chai_1.assert.equal(eventB.address, address);
                chai_1.assert.instanceOf(eventA.error, Error);
                chai_1.assert.instanceOf(eventB.error, Error);
                chai_1.assert.equal(eventA.error.message, "Authentication failure");
                chai_1.assert.equal(eventB.error.message, "Authentication failure");
                chai_1.assert.equal(eventA.error.status, 400);
                chai_1.assert.equal(eventB.error.status, 400);
            });
            it("should report protocol version error", async function () {
                /* ZMQ < 4.3.0 does not have these event details. */
                if (semver.satisfies(zmq.version, "< 4.3.0")) {
                    this.skip();
                }
                handler = new CustomZapHandler(([path, delim, version, id, ...rest]) => {
                    return [path, delim, "9.9", id, "200", "OK", null, null];
                });
                sockA.plainServer = true;
                sockA.zapDomain = "test";
                sockB.plainUsername = "user";
                const address = (0, helpers_1.uniqAddress)(proto);
                const [eventA] = await Promise.all([
                    (0, helpers_1.captureEvent)(sockA, "handshake:error:protocol"),
                    sockA.bind(address),
                    sockB.connect(address),
                ]);
                chai_1.assert.equal(eventA.type, "handshake:error:protocol");
                chai_1.assert.equal(eventA.address, address);
                chai_1.assert.instanceOf(eventA.error, Error);
                chai_1.assert.equal(eventA.error.message, "ZAP protocol error");
                chai_1.assert.equal(eventA.error.code, "ERR_ZAP_BAD_VERSION");
            });
            it("should report protocol format error", async function () {
                /* ZMQ < 4.3.0 does not have these event details. */
                if (semver.satisfies(zmq.version, "< 4.3.0")) {
                    this.skip();
                }
                handler = new CustomZapHandler(([path, delim, ...rest]) => {
                    return [path, delim, null, null];
                });
                sockA.plainServer = true;
                sockA.zapDomain = "test";
                sockB.plainUsername = "user";
                const address = (0, helpers_1.uniqAddress)(proto);
                const [eventA] = await Promise.all([
                    (0, helpers_1.captureEvent)(sockA, "handshake:error:protocol"),
                    sockA.bind(address),
                    sockB.connect(address),
                ]);
                chai_1.assert.equal(eventA.type, "handshake:error:protocol");
                chai_1.assert.equal(eventA.address, address);
                chai_1.assert.instanceOf(eventA.error, Error);
                chai_1.assert.equal(eventA.error.message, "ZAP protocol error");
                chai_1.assert.equal(eventA.error.code, "ERR_ZAP_MALFORMED_REPLY");
            });
            it("should report mechanism mismatch error", async function () {
                /* ZMQ < 4.3.0 does not have these event details. */
                if (semver.satisfies(zmq.version, "< 4.3.0")) {
                    this.skip();
                }
                this.slow(250);
                sockA.plainServer = true;
                sockB.curveServer = true;
                const address = (0, helpers_1.uniqAddress)(proto);
                const [eventA, eventB] = await Promise.all([
                    (0, helpers_1.captureEvent)(sockA, "handshake:error:protocol"),
                    (0, helpers_1.captureEvent)(sockB, "handshake:error:protocol"),
                    sockA.bind(address),
                    sockB.connect(address),
                ]);
                chai_1.assert.equal(eventA.type, "handshake:error:protocol");
                chai_1.assert.equal(eventB.type, "handshake:error:protocol");
                chai_1.assert.equal(eventA.address, address);
                chai_1.assert.equal(eventB.address, address);
                chai_1.assert.instanceOf(eventA.error, Error);
                chai_1.assert.instanceOf(eventB.error, Error);
                chai_1.assert.equal(eventA.error.message, "ZMTP protocol error");
                chai_1.assert.equal(eventB.error.message, "ZMTP protocol error");
                chai_1.assert.equal(eventA.error.code, "ERR_ZMTP_MECHANISM_MISMATCH");
                chai_1.assert.equal(eventB.error.code, "ERR_ZMTP_MECHANISM_MISMATCH");
            });
        });
    });
}
class ZapHandler {
    constructor() {
        this.socket = new zmq.Router();
    }
    async run() {
        await this.socket.bind("inproc://zeromq.zap.01");
        /* See https://rfc.zeromq.org/spec:27/ZAP/ */
        for await (const msg of this.socket) {
            await this.socket.send(this.handle(msg));
        }
    }
    stop() {
        this.socket.close();
    }
}
class ValidatingZapHandler extends ZapHandler {
    constructor(details) {
        super();
        this.details = details;
        this.run();
    }
    handle(request) {
        const [path, delimiter, version, id, domain, address, identity, mechanism, ...credentials] = request;
        let status = ["200", "OK"];
        if (mechanism.toString() === "NULL" && credentials.length !== 0) {
            status = ["300", "Expected no credentials"];
        }
        else if (mechanism.toString() === "PLAIN" && credentials.length !== 2) {
            status = ["300", "Expected 2 credentials"];
        }
        else if (mechanism.toString() === "CURVE" && credentials.length !== 1) {
            status = ["300", "Expected 1 credential"];
        }
        else if (domain.toString() !== this.details.domain) {
            status = ["400", "Unknown domain"];
        }
        else {
            for (const [i, credential] of credentials.entries()) {
                if (this.details.credentials[i] !== credential.toString()) {
                    status = ["400", "Bad credentials"];
                    break;
                }
            }
        }
        return [path, delimiter, version, id, ...status, null, null];
    }
}
class CustomZapHandler extends ZapHandler {
    constructor(handler) {
        super();
        this.handle = handler;
        this.run();
    }
}
//# sourceMappingURL=socket-zap-test.js.map