#!/usr/bin/env ts-node

import { buildRoom } from "./support/buildRoom";
import { output, outputDoom } from "./support/output";
import { timeToAct } from "./support/timeToAct";
import { itsaTrap } from "./support/Trap";

buildRoom(process.cwd()).then((room) => {
    if (itsaTrap(room)) {
        outputDoom("Ouch! " + room.details);
        return;
    }
    return timeToAct(room, []).then(() => {
        output("The end.");
    });
});
