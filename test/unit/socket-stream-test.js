"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zmq = require("../../src");
const chai_1 = require("chai");
const http_1 = require("http");
const helpers_1 = require("./helpers");
for (const proto of (0, helpers_1.testProtos)("tcp")) {
    describe(`socket with ${proto} stream`, function () {
        let stream;
        beforeEach(function () {
            stream = new zmq.Stream();
        });
        afterEach(function () {
            stream.close();
            global.gc?.();
        });
        describe("send/receive as server", function () {
            it("should deliver messages", async function () {
                const address = (0, helpers_1.uniqAddress)(proto);
                await stream.bind(address);
                const serve = async () => {
                    for await (const [id, msg] of stream) {
                        if (!msg.length) {
                            continue;
                        }
                        chai_1.assert.equal(msg.toString().split("\r\n")[0], "GET /foo HTTP/1.1");
                        await stream.send([
                            id,
                            "HTTP/1.0 200 OK\r\n" +
                                "Content-Type: text/plan\r\n" +
                                "\r\n" +
                                "Hello world!",
                        ]);
                        stream.close();
                    }
                };
                let body = "";
                const request = async () => {
                    return new Promise(resolve => {
                        (0, http_1.get)(`${address.replace("tcp:", "http:")}/foo`, res => {
                            res.on("data", buffer => {
                                body += buffer.toString();
                            });
                            res.on("end", resolve);
                        });
                    });
                };
                await Promise.all([request(), serve()]);
                chai_1.assert.equal(body, "Hello world!");
            });
        });
        describe("send/receive as client", function () {
            it("should deliver messages", async function () {
                const address = (0, helpers_1.uniqAddress)(proto);
                const port = parseInt(address.split(":").pop(), 10);
                const server = await new Promise(resolve => {
                    const http = (0, http_1.createServer)((_req, res) => {
                        res.writeHead(200, {
                            "Content-Type": "text/plain",
                            "Content-Length": 12,
                        });
                        res.end("Hello world!");
                    });
                    http.listen(port, () => resolve(http));
                });
                const routingId = "abcdef1234567890";
                stream.connect(address, { routingId });
                let body = "";
                const request = async () => {
                    await stream.send([
                        routingId,
                        "GET /foo HTTP/1.1\r\n" +
                            `Host: ${address.replace("tcp://", "")}\r\n\r\n`,
                    ]);
                    for await (const [id, data] of stream) {
                        chai_1.assert.equal(id.toString(), routingId);
                        if (data.length) {
                            body += data;
                            break;
                        }
                    }
                    stream.close();
                    server.close();
                };
                await Promise.all([request()]);
                chai_1.assert.equal(body.split("\r\n\r\n").pop(), "Hello world!");
            });
        });
    });
}
//# sourceMappingURL=socket-stream-test.js.map