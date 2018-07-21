
import typescript from "typescript";
import { Room } from "../buildRoom";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

// tslint:disable-next-line:import-name
import _ from "lodash";

export async function resolveWithTS(lib: string, room: Room): Promise<ModuleResolutionResult> {

    const compilerOptions = await readTsConfig(room.appDir) || {}; //readTsConfig()
    const program = typescript.createProgram([room.crawl.filename], compilerOptions);
    const checker = program.getTypeChecker();
    const ab = checker.getAmbientModules();
    console.log("JESS: " + ab.map(s => s.escapedName).sort().join("\n"));

    const tsResolution = typescript.resolveModuleName(lib,
        room.crawl.filename, // I think only the directory matters
        compilerOptions,
        typescript.sys);
    return {
        kind: "ts",
        isResolved: tsResolution.resolvedModule != null, /* note: double vs triple equal */
        failedLookupLocations: (tsResolution as any).failedLookupLocations,
        resolvedFileName: _.get(tsResolution, "resolvedModule.resolvedFileName"),
    };
}

interface TsConfig {
    compilerOptions: typescript.CompilerOptions
}

async function readTsConfig(libDir: string): Promise<TsConfig | undefined> {
    return promisify(fs.readFile)(path.join(libDir, "tsconfig.json"), { encoding: "utf8" })
        .then(
            content => JSON.parse(content)
            , (readError) => {
                return undefined;
            })
        .catch(parseError => {
            console.log("WARNING: invalid tsconfig.json in " + libDir + ": " + parseError.message);
            return undefined
        })
} 