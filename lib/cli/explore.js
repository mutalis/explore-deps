#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const buildRoom_1 = require("../support/buildRoom");
const output_1 = require("./output");
const timeToAct_1 = require("./timeToAct");
const Trap_1 = require("../support/Trap");
function explore(startingDir) {
    buildRoom_1.buildRoom(startingDir).then((room) => {
        if (Trap_1.itsaTrap(room)) {
            output_1.outputDoom("Ouch! " + room.details);
            return;
        }
        return timeToAct_1.timeToAct(room, []).then(() => {
            output_1.output("The end.");
        });
    });
}
explore(process.cwd());
//# sourceMappingURL=explore.js.map