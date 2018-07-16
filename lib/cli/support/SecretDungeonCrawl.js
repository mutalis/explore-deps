"use strict";
/**
 * I am here to expose your Node module resolution secrets.
 * This must not import anything unglobal
 */
Object.defineProperty(exports, "__esModule", { value: true });
class ModuleResolutionError extends Error {
    constructor(cause, paths, filename) {
        super(cause.message);
        this.cause = cause;
        this.paths = paths;
        this.filename = filename;
        this.kind = "ModuleResolutionError";
    }
}
exports.ModuleResolutionError = ModuleResolutionError;
function isModuleResolutionError(e) {
    const maybe = e;
    return maybe.kind === "ModuleResolutionError";
}
exports.isModuleResolutionError = isModuleResolutionError;
exports.Crawl = {
    resolvePaths(resolveMe) {
        return require.resolve.paths(resolveMe);
    },
    locateModule(lib) {
        // console.log("SDC: resolving " + lib + " in " + __filename)
        try {
            return require.resolve(lib);
        }
        catch (error) {
            throw new ModuleResolutionError(error, require.resolve.paths(lib) || [], __filename);
        }
    },
    filename: __filename,
};
//# sourceMappingURL=SecretDungeonCrawl.js.map