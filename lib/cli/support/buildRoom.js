"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const injectSecretDungeonCrawl_1 = require("./injectSecretDungeonCrawl");
async function buildRoom(appDir) {
    let pjString;
    try {
        pjString = readPackageJson(appDir);
    }
    catch (error) {
        return {
            error,
            description: `You try to go to ${appDir}.\nIt is completely dark in here.\nRun away!`,
        };
    }
    let pj;
    try {
        pj = parsePackageJson(pjString);
    }
    catch (error) {
        return {
            error,
            description: `A rat bites your foot!The package.json is invalid in ${appDir} `,
        };
    }
    const room = {
        packageJson: pj,
        appDir,
        crawl: await injectSecretDungeonCrawl_1.injectSecretDungeonCrawl(appDir),
    };
    return room;
}
exports.buildRoom = buildRoom;
function readPackageJson(appDir) {
    return fs.readFileSync(path.join(appDir, "package.json"), { encoding: "utf8" });
}
function parsePackageJson(pjContent) {
    return JSON.parse(pjContent);
}
//# sourceMappingURL=buildRoom.js.map