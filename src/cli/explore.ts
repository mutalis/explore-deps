#!/usr/bin/env node

import { buildRoom } from "../support/buildRoom";
import { itsaTrap } from "../support/Trap";
import { output, outputDoom } from "./output";
import { timeToAct } from "./timeToAct";

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
