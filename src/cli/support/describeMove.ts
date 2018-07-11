import * as path from "path";

export function describeMove(fromDir: string, toDir: string): string {
    const relativeForward = path.relative(fromDir, toDir);
    const relativeBackward = path.relative(toDir, fromDir);
    const upSteps = relativeBackward.split("node_modules").length - 1;
    const downSteps = relativeForward.split("node_modules").length - 1;
    if (upSteps > 0) {
        return `up ${upSteps} stairs and down ${downSteps}.`
    } else if (downSteps > 0) {
        return `down ${downSteps} stair.` // should always be 1.
    } else {
        return `right through.`;
    }
}
