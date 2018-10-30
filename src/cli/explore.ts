#!/usr/bin/env node

import { buildRoom } from "../support/buildRoom";
import { itsaTrap } from "../support/Trap";
import { output, outputCurrentState, outputDebug, outputDoom } from "./output";
import { timeToAct } from "./timeToAct";

async function explore(startingDir: string) {
    const room = await buildRoom(startingDir);
    if (itsaTrap(room)) {
        outputDoom("Ouch! " + room.details);
        return;
    }

    outputCurrentState(
        `Welcome to the dungeon of ${room.packageJson.name} and its dependencies.
Node works with dependencies on the local filesystem (usually put there by npm).
These dependency paths can be winding. Good luck finding an exit to this dungeon.`,
        { borderStyle: "double" });

    await timeToAct(room, []);
    output("Thank you for visiting.");
}

explore(process.cwd()).catch((err) => {
    outputDoom("Unhandled exception: " + err.message);
    outputDebug(err.stack);
});
