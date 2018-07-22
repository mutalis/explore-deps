import * as fs from "fs";
// tslint:disable-next-line:import-name
import _ from "lodash";
import * as path from "path";
import { promisify } from "util";
import { isModuleResolutionError, NodeModuleResolutionExposed } from "../secretDungeonCrawl/SecretDungeonCrawl";
import { Trap } from "./Trap";
import { Room } from "./buildRoom";
import { resolveWithTS } from "./moduleResolution/resolveWithTs";

export async function findLibraryRoot(lib: string,
    room: Room): Promise<string | Trap> {

    const resolutionAttempts = [
        resolveWithNode(lib, room.crawl),
        await resolveWithTS(lib, room),
    ];
    console.log("Resolution results: " + JSON.stringify(resolutionAttempts));
    const resolved = resolutionAttempts.find((ra) => ra.isResolved);

    if (!resolved) {
        const allPaths = _.flatMap(resolutionAttempts, (ra) => ra.failedLookupLocations); /* note: lodash again */
        const error = new Error(`Module ${lib} could not be resolved`);
        const details = `Paths searched: ${allPaths.join("\n")}`;
        const description = ` CRASH! a yawning pit opens before you. There is no module '${lib}' `;
        return { error, description, details };
    }
    return firstParentDirectoryWithAPackageJson(path.dirname(resolved.resolvedFileName as string));
}

function resolveWithNode(lib: string, crawl: NodeModuleResolutionExposed): ModuleResolutionResult {
    try {
        const whereIsIt = crawl.locateModule(lib);
        return {
            kind: "node",
            isResolved: true,
            failedLookupLocations: [],
            resolvedFileName: whereIsIt,
        };
    } catch (error) {
        return {
            kind: "node",
            isResolved: false,
            failedLookupLocations: isModuleResolutionError(error) ? error.paths : [],
        };
    }
}

async function firstParentDirectoryWithAPackageJson(dir: string,
    origDir: string = dir): Promise<string | Trap> {
    try {
        const stat = await promisify(fs.stat)(path.join(dir, "package.json"));
        if (stat.isFile()) {
            return dir;
        }
    } catch (e) {
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

function isRoot(dir: string) {
    return path.dirname(dir) === dir;
}
