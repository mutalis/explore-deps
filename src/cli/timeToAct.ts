import boxen from "boxen";
import chalk from "chalk";
import * as fs from "fs";
import _ from "lodash";

import { allDependencies } from "../support/allDependencies";
import { buildRoom, Room } from "../support/buildRoom";
import { describeMove } from "../support/describeMove";
import { findLibraryRoot } from "../support/findLibraryRoot";
import { itsaTrap, Trap } from "../support/Trap";
import { greyish, output, outputCurrentState, outputDebug, outputDoom } from "./output";
import { NextAction, NextActionAnswers, requestNextAction } from "./requestNextAction";

// want to:
// - make it report the version of the current dep in each past room
// - make it guess why it couldn't resolve a dev dependency
// - recognize links and remark on warp portal? (sounds hard)

type /* note 1: type alias */ ActionHappened = Promise<void>;

export async function timeToAct(room: Room, past: Room[]): ActionHappened {

    outputCurrentState(`You are in "${room.packageJson.name}". It appears to be version ${room.packageJson.version}.`
        + describeVersionDifference(room, past));

    const answers: NextActionAnswers /* note 3: interesting union type */ =
        await requestNextAction(room, past); /* note 7: click in */
    const nextAction: NextAction /* note 2: union of string types */ = answers.action;
    outputDebug(`You have chosen: ${nextAction}`);
    switch (answers.action) { /* note 4: try changing this to nextActions */
        case "exit":
            return;
        case "back":
            return timeToAct((past.shift() as Room), past); /* note 5: change to array destructure */
        case "teleport":
            return tryToTeleport({ room, past, lib: answers.destination });
        case "look":
            return lookAround(room, past); /* note 6: object destructuring */
        case "gps":
            checkGPS(room);
            return timeToAct(room, past);
        case "doors":
            return goThroughDoor(room, past, answers.door);
    }
}

function describeVersionDifference(room: Room, past: Room[]): string {
    const prefix = "\n";
    if (past.length === 0) {
        return "";
    }
    const weGotHereFrom: Room = past[0];
    const theyWanted = allDependencies(weGotHereFrom.packageJson).find((d) => d.name === room.packageJson.name);
    const previousPackageName = weGotHereFrom.packageJson.name;
    if (theyWanted === undefined) {
        return "";
    }
    if (theyWanted.versionRequested === room.packageJson.version) {
        return prefix + `Just what ${previousPackageName} wanted.`;
    }
    // TODO: consult semver for whether this is satisfied
    return prefix + `${previousPackageName} wanted ${theyWanted.versionRequested}`;
}

export async function lookAround(room: Room, past: Room[]) {
    const { author, license, description, repository, main } =
        room.packageJson; /* note: change to nested destructure */
    const usefulMessage = `${description}
author: ${JSON.stringify(author)}
license: ${license}
repo: ${_.get(repository, "url")}
main: ${main || "index.ts"}`;
    /* notes:
     * stringify is dangerous
     * "or" as nil punning
     * _.get for nil safety
     */

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
        return greyish(d);
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

async function tryToTeleport(params: { room: Room, past: Room[], lib: string }): ActionHappened {
    const { room, past, lib } = params;

    output(`You want to go to: ${lib}`);
    const otherSide = findLibraryRoot(lib, room.crawl);
    if (itsaTrap(otherSide)) {
        output(otherSide.details || otherSide.error.message);
        outputDoom(chalk.yellow("Your teleport fails."));
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

    return timeToAct(newRoom, [room, ...past]);
}

async function omg(trap: Trap, room: Room, past: Room[]): ActionHappened {
    outputDebug(trap.error.stack as string);
    if (trap.details) {
        outputDebug("details: " + trap.details);
    }
    outputDoom(chalk.red(trap.description));
    return timeToAct(room, past);
}

async function win(past: Room[]): ActionHappened {
    output(boxen("YOU WIN!", { borderColor: "greenBright", padding: 2, float: "center", borderStyle: "double" }));
    return;
}
