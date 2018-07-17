/**
 * I am here to expose your Node module resolution secrets.
 * This must not import anything unglobal
 */
// tslint:disable:max-classes-per-file

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

export class NodeModuleResolutionExposed {

    public filename: string;

    constructor(filename: string, private localRequire: NodeRequire) {
        this.filename = filename;
    }

    public resolvePaths(resolveMe: string): string[] {
        return this.localRequire.resolve.paths(resolveMe) || [];
    }

    public locateModule(lib: string): string {
        // console.log("SDC: resolving " + lib + " in " + __filename)
        try {
            return this.localRequire.resolve(lib);
        } catch (error) {
            throw new ModuleResolutionError(error, this.localRequire.resolve.paths(lib) || [], __filename);
        }
    }

}

export const Crawl = new NodeModuleResolutionExposed(__filename, require);
