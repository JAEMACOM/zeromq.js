"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureEventsUntil = exports.captureEvent = exports.createProcess = exports.createWorker = exports.testProtos = exports.uniqAddress = void 0;
const path = require("path");
const semver = require("semver");
const child_process_1 = require("child_process");
const zmq = require("../../src");
console.log(`ZeroMQ version ${zmq.version}`);
if (semver.satisfies(zmq.version, ">= 4.2")) {
    /* Stop pending messages in test suite from preventing process exit. */
    zmq.context.blocky = false;
}
/* Windows cannot bind on a ports just above 1014; start higher to be safe. */
let seq = 5000;
function uniqAddress(proto) {
    const id = seq++;
    switch (proto) {
        case "ipc": {
            const sock = path.resolve(__dirname, `../../tmp/${proto}-${id}`);
            return `${proto}://${sock}`;
        }
        case "tcp":
        case "udp":
            return `${proto}://127.0.0.1:${id}`;
        default:
            return `${proto}://${proto}-${id}`;
    }
}
exports.uniqAddress = uniqAddress;
function testProtos(...requested) {
    const set = new Set(requested);
    /* Do not test with ipc if unsupported. */
    if (!zmq.capability.ipc) {
        set.delete("ipc");
    }
    /* Only test inproc with version 4.2+, earlier versions are unreliable. */
    if (semver.satisfies(zmq.version, "< 4.2")) {
        set.delete("inproc");
    }
    if (!set.size) {
        console.error("Warning: test protocol set is empty");
    }
    return [...set];
}
exports.testProtos = testProtos;
async function createWorker(data, fn) {
    const src = `
    const {parentPort, workerData} = require("worker_threads")
    const zmq = require(${JSON.stringify(path.resolve(__dirname, "../.."))})

    async function run() {
      const fn = ${fn.toString()}
      const msg = await fn(workerData)
      parentPort.postMessage(msg)
    }

    run()
  `;
    const { Worker } = await Promise.resolve().then(() => require("worker_threads"));
    return new Promise((resolve, reject) => {
        const worker = new Worker(src, {
            eval: true,
            workerData: data,
        });
        let message;
        worker.on("message", msg => {
            message = msg;
        });
        worker.on("exit", code => {
            if (code === 0) {
                resolve(message);
            }
            else {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}
exports.createWorker = createWorker;
function createProcess(fn) {
    const src = `
    const zmq = require(${JSON.stringify(path.resolve(__dirname, "../.."))})
    const fn = ${fn.toString()}
    fn()
  `;
    const child = (0, child_process_1.spawn)(process.argv[0], ["--expose_gc"]);
    child.stdin.write(src);
    child.stdin.end();
    let stdout = Buffer.alloc(0);
    let stderr = Buffer.alloc(0);
    child.stdout.on("data", (data) => {
        stdout = Buffer.concat([stdout, data]);
    });
    child.stderr.on("data", (data) => {
        stderr = Buffer.concat([stderr, data]);
    });
    return new Promise((resolve, reject) => {
        child.on("close", (code, signal) => {
            if (signal) {
                reject(new Error(`Child exited with ${signal}`));
            }
            else {
                resolve({ code, stdout, stderr });
            }
        });
        setTimeout(() => {
            resolve({ code: -1, stdout, stderr });
            child.kill();
        }, 750);
    });
}
exports.createProcess = createProcess;
function captureEvent(socket, type) {
    return new Promise(resolve => socket.events.on(type, resolve));
}
exports.captureEvent = captureEvent;
async function captureEventsUntil(socket, type) {
    const events = [];
    for await (const event of socket.events) {
        events.push(event);
        if (event.type === type) {
            break;
        }
    }
    return events;
}
exports.captureEventsUntil = captureEventsUntil;
//# sourceMappingURL=helpers.js.map