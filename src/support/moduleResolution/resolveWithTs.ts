
import typescript from "typescript";
import { Room } from "../buildRoom";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

// tslint:disable-next-line:import-name
import _ from "lodash";



export async function resolveWithTS(lib: string, room: Room): Promise<ModuleResolutionResult> {

    const realCompilerOptions = await readTsConfig(room.appDir); //readTsConfig()
    const compilerOptions = realCompilerOptions || {};
    const program = typescript.createProgram([room.crawl.filename], compilerOptions);
    const checker = program.getTypeChecker();
    const ab = checker.getAmbientModules();
    console.log("JESS: " + ab.map(s => s.escapedName).sort().join("\n"));
    // I just had a brilliant idea.
    // I checked my luggage. I will have to wait 20 minutes for it to come out anyway.
    // I can get my $2 tasting at Vino Volo before I leave the terminal!!
    // (again, since I got it once in Denver already wahahahaha)
    // JESS that is brilliant! It makes checking luggage not painful! love ittttt
    // can you tell I have a g&t on the plane

    const tsResolution = typescript.resolveModuleName(lib,
        room.crawl.filename, // I think only the directory matters
        compilerOptions,
        typescript.sys);
    return {
        kind: "ts",
        isResolved: tsResolution.resolvedModule != null, /* note: double vs triple equal */
        failedLookupLocations: (tsResolution as any).failedLookupLocations,
        resolvedFileName: _.get(tsResolution, "resolvedModule.resolvedFileName"),
        usedTsConfig: !!realCompilerOptions,
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