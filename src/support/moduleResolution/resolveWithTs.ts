
import * as path from "path";
import typescript, { CompilerOptions, ParseConfigFileHost } from "typescript";
import { Room } from "../buildRoom";

// tslint:disable-next-line:import-name
import _ from "lodash";

export async function resolveWithTS(lib: string, room: Room): Promise<ModuleResolutionResult> {

    const realCompilerOptions = await readTsConfig(room.appDir); // readTsConfig()
    const compilerOptions = realCompilerOptions || {};
    // const program = typescript.createProgram([room.crawl.filename], compilerOptions);
    // const checker = program.getTypeChecker();
    // const ab = checker.getAmbientModules();
    // console.log("JESS: " + ab.map(s => s.escapedName).sort().join("\n"));

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

/**
 * You can't just JSON.parse a tsconfig.json, because it might have comments.
 *
 * @param libDir top-level directory of the project which might have a tsconfig
 */
async function readTsConfig(libDir: string): Promise<CompilerOptions | undefined> {

    // I have no idea how you're supposed to get one of these
    const host: ParseConfigFileHost =
        {
            onUnRecoverableConfigFileDiagnostic: () => { /* empty */ },
            ...typescript.sys,
        } as any as ParseConfigFileHost;

    const pcl = typescript.getParsedCommandLineOfConfigFile(
        path.join(libDir, "tsConfig.json"), {}, host);
    return pcl && pcl.options;

}
