import * as fs from "fs";
import * as path from "path";
import { outputDebug } from "./output";
import { isModuleResolutionError, NodeModuleResolutionExposed } from "./SecretDungeonCrawl";

export interface Trap {
    error: Error;
    details?: string;
}

export function itsaTrap(t: Trap | string): t is Trap {
    const maybe = t as Trap;
    return maybe.error !== undefined;
}

export function findLibraryRoot(lib: string, crawl: NodeModuleResolutionExposed): string | Trap {
    let whereIsIt;
    try {
        whereIsIt = crawl.locateModule(lib);
    } catch (error) {
        const details = isModuleResolutionError(error) ?
            `${error.message}\nfrom ${error.filename}\nPaths searched: ${error.paths.join("\n")}` : undefined;
        return { error, details };
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
        };
    }
    return firstParentDirectoryWithAPackageJson(path.dirname(dir), origDir);
}

function isRoot(dir: string) {
    path.dirname(dir) === dir;
}
