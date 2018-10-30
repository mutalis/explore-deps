import { DependencyMap, PackageJSON } from "package-json";

/*
*package.json has three dependency sections
*/
export type DependencyKind = "dev" | "peer" | "full";
export interface SomeDependency {
    kind: DependencyKind;
    name: string;
    versionRequested: string;
}

export function allDependencies(pj: PackageJSON): SomeDependency[] {
    return describeDependencies(pj.dependencies, "full")
        .concat(describeDependencies(pj.devDependencies, "dev"))
        .concat(describeDependencies(pj.peerDependencies, "peer"));
}

function describeDependencies(depObject: DependencyMap | undefined, kind: DependencyKind): SomeDependency[] {
    if (depObject === undefined) {
        return [];
    }
    return Object.keys(depObject).sort().map((key) => ({
        kind,
        name: key,
        versionRequested: depObject[key],
    }));
}
