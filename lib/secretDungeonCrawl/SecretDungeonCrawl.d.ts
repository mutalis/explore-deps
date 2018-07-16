/**
 * I am here to expose your Node module resolution secrets.
 * This must not import anything unglobal
 */
export declare class ModuleResolutionError extends Error {
    cause: Error;
    paths: string[];
    filename: string;
    readonly kind: string;
    constructor(cause: Error, paths: string[], filename: string);
}
export declare function isModuleResolutionError(e: Error): e is ModuleResolutionError;
export interface NodeModuleResolutionExposed {
    filename: string;
    resolvePaths(resolveMe: string): string[] | null;
    locateModule(lib: string): string;
}
export declare const Crawl: NodeModuleResolutionExposed;
