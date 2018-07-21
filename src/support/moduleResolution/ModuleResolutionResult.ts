
interface ModuleResolutionResult {
    kind: "node" | "ts";
    isResolved: boolean;
    resolvedFileName?: string;
    failedLookupLocations: string[];
}