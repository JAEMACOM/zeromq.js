"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const child_process_1 = require("child_process");
const fs_extra_1 = require("fs-extra");
const which = require("which");
const chai_1 = require("chai");
const tsVersions = [
    // the oldest supported version
    { version: "3.7.x", minTarget: "es3" },
    // 4.x
    { version: "4.x", minTarget: "es3" },
];
// use ./typings-test.ts for tsc test, but change the import location for zmq
// to be used from `test/typings-compatibility/ts-x.x.x/typings-test.ts`:
const zmqImportLoc = "../../../";
const srcFile = path.resolve(__dirname, "typings-test.ts");
const srcStr = (0, fs_extra_1.readFile)(srcFile, "utf8").then(content => {
    // replace import statement `import * as zmq from ...`:
    return content.replace(/^(\s*import\s+\*\s+as\s+zmq\s+from\s+)(.*)$/m, `$1"${zmqImportLoc}"`);
});
const tscTestBasePath = path.resolve(__dirname, "..", "typings-compatibility");
const templateSrcPath = path.resolve(tscTestBasePath, "template");
function addLibs(libs, targetList) {
    if (!targetList) {
        targetList = libs;
    }
    else {
        libs.forEach(l => {
            if (!targetList.find(e => e.toLowerCase() === l.toLowerCase())) {
                targetList.push(l);
            }
        });
    }
    return targetList;
}
async function run(cmd, cwd, errorAsString) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(cmd, { cwd }, (error, stdout, stderr) => {
            if (error) {
                resolve(errorAsString ? `${stdout}\n${stderr}` : error);
            }
            else {
                resolve(undefined);
            }
        });
    });
}
function getItLabelDetails(tsVer) {
    const lbl = `v${tsVer.version} for (minimal) compile target ${JSON.stringify(tsVer.minTarget)}`;
    if (!tsVer.requiredLibs || tsVer.requiredLibs.length === 0) {
        return lbl;
    }
    return `${lbl}, and required compile lib: ${JSON.stringify(tsVer.requiredLibs)}`;
}
describe("compatibility of typings for typescript versions", async function () {
    let execCmd;
    before(async function () {
        this.timeout(10000);
        if (/^true$/.test(process.env.EXCLUDE_TYPINGS_COMPAT_TESTS)) {
            this.skip();
        }
        execCmd = await getPackageManager();
    });
    for (const tsVer of tsVersions) {
        // must increase timeout for allowing `npm install`'ing the version of
        // the typescript package to complete
        this.timeout(30000);
        const tscTargetPath = path.resolve(tscTestBasePath, `ts-${tsVer.version}`);
        it(`it should compile successfully with typescript version ${tsVer.version
        // eslint-disable-next-line no-loop-func
        }, tsc ${getItLabelDetails(tsVer)}`, async function () {
            await prepareTestPackage(tscTargetPath, tsVer, execCmd);
            const cmd = ["npm", "pnpm"].includes(execCmd) ? `${execCmd} run` : execCmd;
            const errMsg = (await run(`${cmd} test`, tscTargetPath, true));
            chai_1.assert.isUndefined(errMsg, errMsg);
        });
        afterEach(async () => {
            await (0, fs_extra_1.remove)(tscTargetPath);
        });
    }
});
async function prepareTestPackage(tscTargetPath, tsVer, execCmd) {
    await (0, fs_extra_1.emptyDir)(tscTargetPath);
    await Promise.all([
        (async () => {
            const tsConfig = await (0, fs_extra_1.readJson)(path.resolve(templateSrcPath, "tsconfig.json"));
            tsConfig.compilerOptions.target = tsVer.minTarget;
            if (tsVer.requiredLibs) {
                tsConfig.compilerOptions.lib = addLibs(tsVer.requiredLibs, tsConfig.compilerOptions.lib);
            }
            return (0, fs_extra_1.writeJson)(path.resolve(tscTargetPath, "tsconfig.json"), tsConfig);
        })(),
        (async () => {
            const pkgJson = await (0, fs_extra_1.readJson)(path.resolve(templateSrcPath, "package.json"));
            pkgJson.name = `test-typings-ts-${tsVer.version}`;
            pkgJson.devDependencies.typescript = `${tsVer.version}`;
            return (0, fs_extra_1.writeJson)(path.resolve(tscTargetPath, "package.json"), pkgJson);
        })(),
        (async () => {
            const content = await srcStr;
            return (0, fs_extra_1.writeFile)(path.resolve(tscTargetPath, "typings-test.ts"), content, "utf8");
        })(),
    ]);
    await run(`${execCmd} install`, tscTargetPath, false);
}
/// detect package manager (pnpm, npm, yarn) for installing typescript versions
async function getPackageManager() {
    const packageManagers = ["pnpm", "yarn", "npm"];
    const versionResults = await Promise.all(packageManagers.map(pm => which(pm)));
    const packageManagerIndex = versionResults.findIndex(versionResult => typeof versionResult === "string");
    if (packageManagerIndex === -1) {
        throw new Error("Cannot run typings compatibility test, because pnpm, npm, and yarn are not available.");
    }
    return packageManagers[packageManagerIndex];
}
//# sourceMappingURL=typings-compatibility-test.js.map