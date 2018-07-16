"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const boxen_1 = __importDefault(require("boxen"));
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
const util_1 = require("util");
const buildRoom_1 = require("../support/buildRoom");
const describeMove_1 = require("../support/describeMove");
const findLibraryRoot_1 = require("../support/findLibraryRoot");
const output_1 = require("./output");
const requestNextAction_1 = require("./requestNextAction");
const Trap_1 = require("../support/Trap");
// want to:
// - make it report the version of the current dep in each past room
// - make it guess why it couldn't resolve a dev dependency
// - recognize links and remark on warp portal? (sounds hard)
const readFile = util_1.promisify(fs.readFile);
async function timeToAct(room, past) {
    output_1.outputCurrentState(`You are in "${room.packageJson.name}". It appears to be version ${room.packageJson.version}.`);
    const answers = await requestNextAction_1.requestNextAction(room, past);
    output_1.outputDebug(`You have chosen: ${answers.action}`);
    switch (answers.action) {
        case "exit":
            return;
        case "back":
            return timeToAct(past.pop(), past);
        case "teleport":
            return tryToTeleport(room, past, answers.destination);
        case "look":
            return lookAround(room, past);
        case "gps":
            checkGPS(room);
            return timeToAct(room, past);
        case "doors":
            return goThroughDoor(room, past, answers.door);
    }
}
exports.timeToAct = timeToAct;
async function lookAround(room, past) {
    const pj = room.packageJson;
    const usefulMessage = `${pj.description}
author: ${JSON.stringify(pj.author)}
license: ${pj.license}
repo: ${lodash_1.default.get(pj, "repository.url")}`;
    output_1.output(boxen_1.default(usefulMessage, { float: "center", borderColor: "magenta" }));
    return timeToAct(room, past);
}
function checkGPS(room) {
    output_1.output(chalk_1.default.yellow("You are in " + room.appDir));
    const possibleDirs = (room.crawl.resolvePaths("anything") || []).map(greyNonexistent);
    output_1.output("From here, it is possible to reach rooms within:\n" + possibleDirs.join("\n"));
}
function greyNonexistent(d) {
    if (dirExists(d)) {
        return d;
    }
    else {
        return chalk_1.default.gray(d);
    }
}
function dirExists(d) {
    try {
        const stat = fs.statSync(d);
        return stat.isDirectory();
    }
    catch (_a) {
        return false;
    }
}
async function tryToTeleport(room, past, destination) {
    output_1.output(`You want to go to: ${destination}`);
    const otherSide = findLibraryRoot_1.findLibraryRoot(destination, room.crawl);
    if (Trap_1.itsaTrap(otherSide)) {
        output_1.outputDoom(chalk_1.default.yellow("Your teleport fails."));
        output_1.outputDebug(otherSide.details || otherSide.error.message);
        return timeToAct(room, past);
    }
    output_1.output(chalk_1.default.cyan("Magic! " + describeMove_1.describeMove(room.appDir, otherSide)));
    const newRoom = await buildRoom_1.buildRoom(otherSide);
    if (Trap_1.itsaTrap(newRoom)) {
        return omg(newRoom, room, past);
    }
    past.push(room);
    return timeToAct(newRoom, past);
}
async function goThroughDoor(room, past, door) {
    if (door === "VICTORY") {
        past.push(room);
        return win(past);
    }
    output_1.output(`You have examined all the doors before you, and chosen: ${door}`);
    const otherSide = findLibraryRoot_1.findLibraryRoot(door, room.crawl);
    if (Trap_1.itsaTrap(otherSide)) {
        return omg(otherSide, room, past);
    }
    output_1.output(chalk_1.default.yellow(describeMove_1.describeMove(room.appDir, otherSide)));
    const newRoom = await buildRoom_1.buildRoom(otherSide);
    if (Trap_1.itsaTrap(newRoom)) {
        return omg(newRoom, room, past);
    }
    past.push(room);
    return timeToAct(newRoom, past);
}
async function omg(trap, room, past) {
    output_1.outputDebug(chalk_1.default.gray(trap.error.stack));
    output_1.outputDoom(chalk_1.default.red(trap.description));
    return timeToAct(room, past);
}
async function win(past) {
    output_1.output(boxen_1.default("YOU WIN!", { borderColor: "greenBright", padding: 2, float: "center", borderStyle: "double" }));
    return;
}
//# sourceMappingURL=timeToAct.js.map