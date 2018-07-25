import boxen from "boxen";
import chalk from "chalk";
import * as fs from "fs";
// tslint:disable-next-line:import-name
import _ from "lodash";

import { promisify } from "util";
import { allDependencies } from "../support/allDependencies";
import { buildRoom, Room } from "../support/buildRoom";
import { describeMove } from "../support/describeMove";
import { findLibraryRoot } from "../support/findLibraryRoot";
import { itsaTrap, Trap } from "../support/Trap";
import { greyish, output, outputCurrentState, outputDebug, outputDoom } from "./output";
import { NextAction, NextActionAnswers, NoDoor, requestNextAction, VictoryDoor } from "./requestNextAction";
import { compareDependencies } from "../support/compareDependencies";

type /* note 1: type alias */ ActionHappened = Promise<void>;

export async function timeToAct(room: Room, past: Room[]): ActionHappened {

    outputCurrentState(`You are in "${room.packageJson.name}".
It appears to be version ${room.packageJson.version}.`
        + describeVersionDifference(room, past));

    const answers: NextActionAnswers /* note 3: interesting union type */ =
        await requestNextAction(room, past); /* note 7: click in */
    const nextAction: NextAction /* note 2: union of string types */ =
        answers.action;
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
            await checkGPS(room);
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
    if (theyWanted === undefined) {
        return "";
    }

    const comparison = compareDependencies(room.packageJson.version,
        theyWanted.versionRequested,
        weGotHereFrom.packageJson.name,
        theyWanted.kind);
    switch (comparison.severity) {
        case "ok":
            return prefix + chalk.green(comparison.message);
        case "warning":
            return prefix + chalk.yellow(comparison.message)
        case "error":
            return prefix + chalk.red(comparison.message);
    }
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

    output(boxen(usefulMessage, {
        float: "center",
        borderColor: "magenta",
    }));
    return timeToAct(room, past);
}

async function checkGPS(room: Room): ActionHappened {
    const possibleDirs = room.crawl.resolvePaths("anything")
        .map(greyNonexistent);
    output("From here, it is possible to reach rooms within:\n" +
        possibleDirs.join("\n"));
    output(chalk.yellow("You are in " + room.appDir));
}

function greyNonexistent(d: string) {
    /* NOTE tslint: since I updated dirExists to be async, this is a bug
       It can be discovered with strict-boolean-expressions, bug ugh */
    if (dirExists(d)) {
        return d;
    } else {
        return greyish(d);
    }
}

async function dirExists(d: string): Promise<boolean> {
    try {
        const stat = await promisify(fs.stat)(d);
        return stat.isDirectory();
    } catch {
        return false;
    }
}

async function tryToTeleport(params: { room: Room, past: Room[], lib: string }): ActionHappened {
    const { room, past, lib } = params;

    output(`You want to go to: ${lib}`);
    const otherSide = await findLibraryRoot(lib, room);
    if (itsaTrap(otherSide)) {
        output(otherSide.details || otherSide.error.message);
        outputDoom(chalk.yellow(`Your teleport fails.\n${lib} is not reachable from ${room.packageJson.name}`));
        return timeToAct(room, past);
    }
    output(chalk.cyan("Magic! " + describeMove(room.appDir, otherSide)));
    const newRoom = await buildRoom(otherSide);
    if (itsaTrap(newRoom)) {
        return omg(newRoom, room, past);
    }
    return timeToAct(newRoom, [...past, room]);
}

async function goThroughDoor(room: Room, past: Room[], door: string) {
    if (door === VictoryDoor.value) {
        return win([...past, room]);
    }
    if (door === NoDoor.value) {
        return timeToAct(room, past);
    }

    output(`You have examined all the doors before you, and chosen: ${door}`);
    const otherSide = await findLibraryRoot(door, room);
    if (itsaTrap(otherSide)) {
        return omg(otherSide, room, past, guessAtReason(room, door));
    }
    output(chalk.yellow(describeMove(room.appDir, otherSide)));

    const newRoom = await buildRoom(otherSide);
    if (itsaTrap(newRoom)) {
        return omg(newRoom, room, past);
    }

    return timeToAct(newRoom, [room, ...past]);
}

function guessAtReason(room: Room, failedDoor: string): string | undefined {
    const dep = allDependencies(room.packageJson).find((d) => d.name === failedDoor);
    if (dep && dep.kind === "dev") {
        return `Fortunately, this is a dev dependency, so ${room.packageJson.name} only needs it at build time.`;
    }
    return;
}

async function omg(trap: Trap, room: Room, past: Room[], possibleReason?: string): ActionHappened {
    outputDebug(trap.error.stack as string);
    if (trap.details) {
        outputDebug("details: " + trap.details);
    }
    outputDoom(chalk.red(trap.description) + (possibleReason ? "\n" + possibleReason : ""));
    return timeToAct(room, past);
}

async function win(past: Room[]): ActionHappened {
    output(boxen("YOU WIN!", { borderColor: "greenBright", padding: 2, float: "center", borderStyle: "double" }));
    return;
}
