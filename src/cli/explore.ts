#!/usr/bin/env node

import { buildRoom } from "../support/buildRoom";
import { itsaTrap } from "../support/Trap";
import { output, outputDoom, outputDebug } from "./output";
import { timeToAct } from "./timeToAct";

async function explore(startingDir: string) {
    const room = await buildRoom(startingDir);
    if (itsaTrap(room)) {
        outputDoom("Ouch! " + room.details);
        return;
    }
    await timeToAct(room, []);
    output("The end.");
}

explore(process.cwd()).catch(err => {
    outputDoom("Unhandled exception: " + err.message);
    outputDebug(err.stack);
});
