import * as fs from "fs";
import * as path from "path";
import { outputDebug } from "./output";
import { isModuleResolutionError, NodeModuleResolutionExposed } from "./SecretDungeonCrawl";
import { Trap } from "./Trap";

export function findLibraryRoot(lib: string, crawl: NodeModuleResolutionExposed): string | Trap {
    let whereIsIt;
    try {
        whereIsIt = crawl.locateModule(lib);
    } catch (error) {
        const details = isModuleResolutionError(error) ?
            `${error.message}\nfrom ${error.filename}\nPaths searched: ${error.paths.join("\n")}` : undefined;
        return { error, description: `CRASH! a yawning pit opens before you. There is no module ${lib}`, details };
    }
    outputDebug(`Resolved ${lib} to ${whereIsIt}`);
    return firstParentDirectoryWithAPackageJson(path.dirname(whereIsIt));
}

function firstParentDirectoryWithAPackageJson(dir: string, origDir: string = dir): string | Trap {
    try {
        const stat = fs.statSync(path.join(dir, "package.json"));
        if (stat.isFile()) {
            return dir;
        }
    } catch (e) {
        // fine, it doesn't exist
    }
    if (isRoot(dir)) {
        return {
            error: new Error("No package.json anywhere above " + origDir),
            description: `A staircase upward ends in the middle of dark air. Nothing useful is above ${origDir}`
        };
    }
    return firstParentDirectoryWithAPackageJson(path.dirname(dir), origDir);
}

function isRoot(dir: string) {
    return path.dirname(dir) === dir;
}
