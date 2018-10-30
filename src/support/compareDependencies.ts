import * as semver from "semver";

export interface DependencyComparison {
    severity: "ok" | "warning" | "error";
    message: string;
}

export function compareDependencies(theyGot: string,
                                    theyWanted: string,
                                    requestingPackageName: string,
                                    requestedDependencyKind: "peer" | "dev" | "full"): DependencyComparison {

    if (theyWanted === theyGot) {
        return {
            severity: "ok",
            message: `Just what ${requestingPackageName} wanted.`,
        };
    }

    const specialCase = semverMightScrewThisUp(theyGot, theyWanted, requestingPackageName);
    if (specialCase) {
        return specialCase;
    }

    if (semver.satisfies(theyGot, theyWanted)) {
        return {
            severity: "ok",
            message: `${requestingPackageName} wanted ${theyWanted}`,
        };
    } else {
        let comment = "";
        if (requestedDependencyKind === "dev") {
            comment = "\n(it's a dev dependency, won't impact runtime)";
        } else if (requestedDependencyKind === "peer") {
            comment = "\nPeer dependencies are so tricky.";
        }
        return {
            severity: "error",
            message: `But ${requestingPackageName} wanted ${theyWanted}` +
                comment,
        };
    }
}

function semverMightScrewThisUp(actualVersion: string,
                                requestedVersion: string,
                                requestingPackageName: string): DependencyComparison | undefined {

    if (!requestedVersion.includes("-")) {
        return undefined;
    }
    // semver just DOES NOT work with specific version requests.
    if (actualVersion === requestedVersion) {
        return undefined; // great
    }
    if (afterTheDash(actualVersion) === afterTheDash(requestedVersion)) {
        return {
            severity: "warning",
            message: `${requestingPackageName} wanted ${
                requestedVersion}. Looks OK in this case, but watch out: semver does NOT work well for snapshots`,
        };
    }
    return {
        severity: "error",
        message: `${requestingPackageName} wanted ${requestedVersion}. Semver does NOT work well for snapshots`,
    };

}

function afterTheDash(version: string) {
    return version.substr(version.indexOf("-") + 1);
}
