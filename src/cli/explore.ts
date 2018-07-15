#!/usr/bin/env ts-node

import { buildRoom } from "./support/buildRoom";
import { output, outputDoom } from "./support/output";
import { itsaTrap } from "./support/Trap";
import { timeToAct } from "./support/youAreIn";

buildRoom(process.cwd()).then((room) => {
    if (itsaTrap(room)) {
        outputDoom("Ouch! " + room.details);
        return;
    }
    return timeToAct(room, []).then(() => {
        output("The end.");
    });
});
