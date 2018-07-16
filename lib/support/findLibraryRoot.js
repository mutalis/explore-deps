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
const SecretDungeonCrawl_1 = require("../secretDungeonCrawl/SecretDungeonCrawl");
function findLibraryRoot(lib, crawl) {
    let whereIsIt;
    try {
        whereIsIt = crawl.locateModule(lib);
    }
    catch (error) {
        const details = SecretDungeonCrawl_1.isModuleResolutionError(error) ?
            `${error.message}\nfrom ${error.filename}\nPaths searched: ${error.paths.join("\n")}` : undefined;
        return { error, description: ` CRASH! a yawning pit opens before you. There is no module '${lib}' `, details };
    }
    return firstParentDirectoryWithAPackageJson(path.dirname(whereIsIt));
}
exports.findLibraryRoot = findLibraryRoot;
function firstParentDirectoryWithAPackageJson(dir, origDir = dir) {
    try {
        const stat = fs.statSync(path.join(dir, "package.json"));
        if (stat.isFile()) {
            return dir;
        }
    }
    catch (e) {
        // fine, it doesn't exist
    }
    if (isRoot(dir)) {
        return {
            error: new Error("No package.json anywhere above " + origDir),
            description: `A staircase upward ends in the middle of dark air. Nothing useful is above ${origDir}`,
        };
    }
    return firstParentDirectoryWithAPackageJson(path.dirname(dir), origDir);
}
function isRoot(dir) {
    return path.dirname(dir) === dir;
}
//# sourceMappingURL=findLibraryRoot.js.map