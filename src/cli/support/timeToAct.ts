import boxen from "boxen";
import chalk from "chalk";
import * as fs from "fs";
import * as inquirer from "inquirer";
import _ from "lodash";
import * as path from "path";

import { promisify } from "util";
import { buildRoom, Room } from "./buildRoom";
import { requestNextAction } from "./requestNextAction";
import { describeMove } from "./describeMove";
import { findLibraryRoot } from "./findLibraryRoot";
import { output, outputCurrentState, outputDebug, outputDoom } from "./output";
import { itsaTrap, Trap } from "./Trap";

// want to:
// - make it report the difference in versions?
// - make it guess why it couldn't resolve a dev dependency
// - recognize links and remark on warp portal? (sounds hard)
// - make it tell the story of the resolution, based on the paths? (also hard)
// - if I delete the file after I load it, does it still work?

const readFile = promisify(fs.readFile);

type ActionHappened = Promise<void>;

export async function timeToAct(room: Room, past: Room[]): ActionHappened {

    outputCurrentState(`You are in "${room.packageJson.name}". It appears to be version ${room.packageJson.version}.`);

    const answers = await requestNextAction(room, past);
    outputDebug(`You have chosen: ${answers.action}`);
    switch (answers.action) {
        case "exit":
            return;
        case "back":
            return timeToAct((past.pop() as Room), past);
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

async function lookAround(room: Room, past: Room[]) {
    const pj = room.packageJson;
    const usefulMessage = `${pj.description}
author: ${JSON.stringify(pj.author)}
license: ${pj.license}
repo: ${_.get(pj, "repository.url")}`;
    output(boxen(usefulMessage, { float: "center", borderColor: "magenta" }));
    return timeToAct(room, past);
}

function checkGPS(room: Room) {
    output(chalk.yellow("You are in " + room.appDir));
    const possibleDirs = (room.crawl.resolvePaths("anything") || []).map(greyNonexistent);
    output("From here, it is possible to reach rooms within:\n" + possibleDirs.join("\n"));
}

function greyNonexistent(d: string) {
    if (dirExists(d)) {
        return d;
    } else {
        return chalk.gray(d);
    }
}

function dirExists(d: string): boolean {
    try {
        const stat = fs.statSync(d);
        return stat.isDirectory();
    } catch {
        return false;
    }
}

async function tryToTeleport(room: Room, past: Room[], destination: string): ActionHappened {
    output(`You want to go to: ${destination}`);
    const otherSide = findLibraryRoot(destination, room.crawl);
    if (itsaTrap(otherSide)) {
        outputDoom(chalk.yellow("Your teleport fails."));
        outputDebug(otherSide.details || otherSide.error.message);
        return timeToAct(room, past);
    }
    output(chalk.cyan("Magic! " + describeMove(room.appDir, otherSide)));
    const newRoom = await buildRoom(otherSide);
    if (itsaTrap(newRoom)) {
        return omg(newRoom, room, past);
    }
    past.push(room);
    return timeToAct(newRoom, past);
}

async function goThroughDoor(room: Room, past: Room[], door: string) {
    if (door === "VICTORY") {
        past.push(room);
        return win(past);
    }
    output(`You have examined all the doors before you, and chosen: ${door}`);
    const otherSide = findLibraryRoot(door, room.crawl);
    if (itsaTrap(otherSide)) {
        return omg(otherSide, room, past);
    }
    output(chalk.yellow(describeMove(room.appDir, otherSide)));
    const newRoom = await buildRoom(otherSide);
    if (itsaTrap(newRoom)) {
        return omg(newRoom, room, past);
    }
    past.push(room);
    return timeToAct(newRoom, past);
}

async function omg(trap: Trap, room: Room, past: Room[]): ActionHappened {
    outputDoom(chalk.red(trap.description));
    outputDebug(chalk.gray(trap.error.stack as string));
    return timeToAct(room, past);
}

async function win(past: Room[]): ActionHappened {
    output(boxen("YOU WIN!", { borderColor: "magenta", padding: 2 }));
    return;
}
