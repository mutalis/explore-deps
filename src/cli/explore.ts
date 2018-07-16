#!/usr/bin/env node

import { buildRoom } from "../support/buildRoom";
import { output, outputDoom } from "./output";
import { timeToAct } from "./timeToAct";
import { itsaTrap } from "../support/Trap";

function explore(startingDir: string) {
    buildRoom(startingDir).then((room) => {
        if (itsaTrap(room)) {
            outputDoom("Ouch! " + room.details);
            return;
        }
        return timeToAct(room, []).then(() => {
            output("The end.");
        });
    });
}

explore(process.cwd());
