/**
 * I am here to expose your Node module resolution secrets.
 * This must not import anything unglobal
 */

export interface ModuleResolutionTrap {
    error: Error;
    paths: string[];
    filename: string;
}

export interface NodeModuleResolutionExposed {
    resolvePaths(resolveMe: string): string[] | null;

    locateModule(lib: string): string | ModuleResolutionTrap;

    filename: string;
}

export const Crawl: NodeModuleResolutionExposed = {
    resolvePaths(resolveMe: string) {
        return require.resolve.paths(resolveMe);
    },

    locateModule(lib: string) {
        console.log("SDC: resolving " + lib + " in " + __filename)
        try {
            return require.resolve(lib);
        } catch (error) {
            return {
                error,
                paths: require.resolve.paths(lib) || [],
                filename: __filename,
            }
        }
    },

    filename: __filename,
}
