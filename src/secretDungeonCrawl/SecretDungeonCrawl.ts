/**
 * I am here to expose your Node module resolution secrets.
 * This must not import anything unglobal
 */

export class ModuleResolutionError extends Error {
    public readonly kind = "ModuleResolutionError";
    constructor(public cause: Error, public paths: string[], public filename: string) {
        super(cause.message);
    }
}

export function isModuleResolutionError(e: Error): e is ModuleResolutionError {
    const maybe = e as ModuleResolutionError;
    return maybe.kind === "ModuleResolutionError";
}

export interface NodeModuleResolutionExposed {

    filename: string;

    resolvePaths(resolveMe: string): string[] | null;

    locateModule(lib: string): string;

}

export const Crawl: NodeModuleResolutionExposed = {
    resolvePaths(resolveMe: string) {
        return require.resolve.paths(resolveMe);
    },

    locateModule(lib: string) {
        // console.log("SDC: resolving " + lib + " in " + __filename)
        try {
            return require.resolve(lib);
        } catch (error) {
            throw new ModuleResolutionError(error, require.resolve.paths(lib) || [], __filename);
        }
    },

    filename: __filename,
};
