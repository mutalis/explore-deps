import * as path from "path";

export function describeMove(fromDir: string, toDir: string): string {
    const destinationName = path.basename(toDir);
    const relativeForward = path.relative(fromDir, toDir);

    if (relativeForward.startsWith("node_modules")) { // child
        return `You descend into ${destinationName}.`;
    }

    const relativeBackward = path.relative(toDir, fromDir);
    const upSteps = relativeBackward.split("node_modules").length - 1;
    const downSteps = relativeForward.split("node_modules").length - 1;

    if (upSteps === 0 && downSteps === 0) { // sibling
        return `You step across into ${destinationName}.`;
    }

    const downwardDirs = relativeForward.replace(/\.\.\//g, "");
    if (downwardDirs.startsWith("node_modules")) { // this is unusual, a node_modules above us that we are not in
        const directoriesUp = relativeForward.split("../").length - 1;
        return `You climb ${describeQuantity(directoriesUp, "twisted stair")}, then descend into ${destinationName}.`;
    }

    if (upSteps > 0) { // dependency is higher in the same node_modules hierarchy
        return `You climb ${describeQuantity(upSteps, "flight")} of stairs and step into ${destinationName}.`;
    }

    // this is unexpected
    return `You slither into ${destinationName}`;
}

function describeQuantity(count: number, noun: string, pluralNoun: string = noun + "s") {
    switch (count) {
        case 0:
            return "no " + pluralNoun;
        case 1:
            return "one " + noun;
        default:
            return count + " " + pluralNoun;
    }
}
