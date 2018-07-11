import { NodeModuleResolutionExposed, isModuleResolutionError } from "./SecretDungeonCrawl";
import { outputDebug } from "./output";
import * as path from "path";

export type Trap = {
    error: Error,
    details?: string
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
    const dir = path.dirname(whereIsIt);
    return dir;
}