import * as fs from "fs";
// tslint:disable-next-line:import-name
import _ from "lodash";
import * as path from "path";
import typescript from "typescript";
import { promisify } from "util";
import { isModuleResolutionError, NodeModuleResolutionExposed } from "../secretDungeonCrawl/SecretDungeonCrawl";
import { Trap } from "./Trap";

interface ModuleResolutionResult {
    kind: "node" | "ts";
    isResolved: boolean;
    resolvedFileName?: string;
    failedLookupLocations: string[];
}

export async function findLibraryRoot(lib: string,
    crawl: NodeModuleResolutionExposed): Promise<string | Trap> {

    const resolutionAttempts = [
        resolveWithNode(lib, crawl),
        resolveWithTS(lib, crawl),
    ];
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

function resolveWithTS(lib: string, crawl: NodeModuleResolutionExposed): ModuleResolutionResult {

    const compilerOptions = {}; //readTsConfig()
    const program = typescript.createProgram([crawl.filename], {});
    const checker = program.getTypeChecker();
    const ab = checker.getAmbientModules();
    console.log("JESS: " + ab.map(s => s.escapedName).sort().join("\n"));

    const tsResolution = typescript.resolveModuleName(lib, crawl.filename, {}, typescript.sys);
    return {
        kind: "ts",
        isResolved: tsResolution.resolvedModule != null, /* note: double vs triple equal */
        failedLookupLocations: (tsResolution as any).failedLookupLocations,
        resolvedFileName: _.get(tsResolution, "resolvedModule.resolvedFileName"),
    };
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
