import boxen from "boxen";
import chalk from "chalk";
import * as fs from "fs";
import * as inquirer from "inquirer";
import _ from "lodash";
import * as path from "path";

import { DependencyMap, PackageJSON } from "package-json";
import { promisify } from "util";
import { requestNextAction, Room } from "./choiceInRoom";
import { describeMove } from "./describeMove";
import { findLibraryRoot, itsaTrap } from "./findLibraryRoot";
import { injectSecretDungeonCrawl } from "./injectSecretDungeonCrawl";
import { output, outputCurrentState, outputDebug, outputDoom } from "./output";
import { Crawl as LocalCrawl, isModuleResolutionError, NodeModuleResolutionExposed } from "./SecretDungeonCrawl";

// want to:
// - add "look around"
// - make it report the difference in versions?
// - make it guess why it couldn't resolve a dev dependency
// - recognize links and remark on warp portal? (sounds hard)
// - make it tell the story of the resolution, based on the paths? (also hard)
// - if I delete the file after I load it, does it still work?

const readFile = promisify(fs.readFile);

export async function youAreIn(appDir: string, past: Room[]) {

    const circumstances = determineCircumstances(appDir);
    outputDebug("Hello from " + appDir);

    if (circumstances === "not a package") {
        outputDoom(`You are in ${appDir}.\nIt is completely dark in here.\nWhat even is this place?? `);
        return;
    } else if (circumstances === "invalid package json") {
        outputDoom(`A rat bites your foot! The package.json is invalid in ${appDir}`);
        return;
    } else {
        return timeToAct(
            { ...circumstances, crawl: await injectSecretDungeonCrawl(appDir) }, past);
    }
}

async function timeToAct(room: Room, past: Room[]): Promise<void> {
    outputCurrentState(`You are in "${room.packageJson.name}". It appears to be version ${room.packageJson.version}.`);

    const answers = await requestNextAction(room, past);
    outputDebug(`You have chosen: ${answers.action}`);
    switch (answers.action) {
        case "exit":
            return;
        case "back":
            return youAreIn((past.pop() as Room).appDir, past);
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

function tryToTeleport(room: Room, past: Room[], destination: string) {
    output(`You want to go to: ${destination}`);
    const otherSide = findLibraryRoot(destination, room.crawl);
    if (itsaTrap(otherSide)) {
        outputDoom(chalk.yellow("Your teleport fails."));
        outputDebug(otherSide.details || otherSide.error.message);
        return youAreIn(room.appDir, past);
    }
    output(chalk.cyan("Magic! " + describeMove(room.appDir, otherSide)));
    past.push(room);
    return youAreIn(otherSide, past);
}

function goThroughDoor(room: Room, past: Room[], door: string) {
    output(`You have examined all the doors before you, and chosen: ${door}`);
    const otherSide = findLibraryRoot(door, room.crawl);
    if (itsaTrap(otherSide)) {
        outputDoom(chalk.red("It's a trap! ") + otherSide.error.message);
        return youAreIn(room.appDir, past);
    }
    output(chalk.yellow(describeMove(room.appDir, otherSide)));
    past.push(room);
    return youAreIn(otherSide, past);
}

function determineCircumstances(appDir: string): Circumstances {
    const pjString = readPackageJson(appDir);
    if (!pjString) {
        return "not a package";
    }
    const pj = parsePackageJson(pjString);
    if (pj == null) {
        return "invalid package json";
    }
    return {
        packageJson: pj,
        appDir,
    };
}

type NotAPackage = "not a package";
type InvalidPackageDefinition = "invalid package json";

interface PackageRoot {
    packageJson: PackageJSON;
    appDir: string;
}

type Circumstances = NotAPackage | InvalidPackageDefinition | PackageRoot;

function readPackageJson(appDir: string): string | null {
    try {
        return fs.readFileSync(path.join(appDir, "package.json"), { encoding: "utf8" });
    } catch {
        return null;
    }
}

function parsePackageJson(pjContent: string): PackageJSON | null {
    try {
        return JSON.parse(pjContent);
    } catch {
        return null;
    }
}
