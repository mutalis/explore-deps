import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import * as inquirer from "inquirer";
import _ from "lodash";

import { PackageJSON, DependencyMap } from "package-json";
import { outputCurrentState, output, outputDoom, outputDebug } from "./output";
import { promisify } from "util";
import { Crawl as LocalCrawl, NodeModuleResolutionExposed, isModuleResolutionError } from "./SecretDungeonCrawl";
import { injectSecretDungeonCrawl } from "./injectSecretDungeonCrawl";
import { describeMove } from "./describeMove";
import { findLibraryRoot, itsaTrap } from "./findLibraryRoot";

// want to: 
// - make it find roots of packages, because it fails when it goes into a lib
// - make it guess why it couldn't resolve a dev dependency
// - make it "check GPS" to tell you what dir it's in
// - make it report the difference in versions?
// - recognize links and remark on warp portal? (sounds hard)
// - make it tell the story of the resolution, based on the paths? (also hard)

const readFile = promisify(fs.readFile);

type Room = PackageRoot & { crawl: NodeModuleResolutionExposed };

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
    outputCurrentState(`You are in "${room.packageJson.name}". It appears to be version ${room.packageJson.version}.`)

    const answers = await requestNextAction(room, past);
    outputDebug(`You have chosen: ${answers.action}`)
    switch (answers.action) {
        case "exit":
            return;
        case "back":
            return youAreIn((past.pop() as Room).appDir, past);
        case "teleport":
            return tryToTeleport(room, past, answers.destination);
        case "doors":
            output(`You have examined all the doors before you, and chosen: ${answers.door}`);
            const otherSide = findLibraryRoot(answers.door, room.crawl);
            if (itsaTrap(otherSide)) {
                outputDoom(chalk.red("It's a trap! ") + otherSide.details || otherSide.error.message);
                return youAreIn(room.appDir, past);
            }
            output(describeMove(room.appDir, otherSide));
            past.push(room);
            return youAreIn(otherSide, past);
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
    output("Magic! " + describeMove(room.appDir, otherSide));
    past.push(room);
    return youAreIn(otherSide, past);
}

function goThroughDoor(room: Room, past: Room[], destination: string) {
    output(`You have examined all the doors before you, and chosen: ${destination}`);
    const otherSide = findLibraryRoot(destination, room.crawl);
    if (itsaTrap(otherSide)) {
        outputDoom(chalk.red("It's a trap! ") + otherSide.details || otherSide.error.message);
        return youAreIn(room.appDir, past);
    }
    output("You go " + describeMove(room.appDir, otherSide));
    past.push(room);
    return youAreIn(otherSide, past);
}


type NextAction = "exit" | "doors" | "back" | "teleport";

type NextActionAnswers = { action: "exit" | "back" } |
{
    action: "doors", door: string
} |
{
    action: "teleport",
    destination: string,
}

const AlwaysChoices: inquirer.objects.ChoiceOption[] = [
    {
        name: "Look for doors",
        value: "doors",
        key: "d"
    },
    {
        name: "Teleport",
        value: "teleport",
        key: "t",
    },
    {
        name: "Leave",
        value: "exit",
        key: "e",
    },
]

function actionChoices(past: Room[]) {
    if (past.length > 0) {
        const goBack: inquirer.objects.ChoiceOption = {
            name: "Go back to " + past[past.length - 1].packageJson.name,
            value: "back",
            key: "b",
        };
        return AlwaysChoices.concat([goBack]);
    } else {
        return AlwaysChoices;
    }
}

async function requestNextAction(p: PackageRoot, past: Room[]): Promise<NextActionAnswers> {
    const question: inquirer.Question<NextActionAnswers> = {
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: actionChoices(past)
    };
    const response = await inquirer.prompt<NextActionAnswers>([question, chooseDoor(p), chooseTeleport()])
    return response;
}

function choicesFromDependencyObject(optionalDeps: DependencyMap | undefined,
    colorFn: (txt: string) => string): inquirer.objects.ChoiceOption[] {
    const deps = optionalDeps || {};
    return Object.keys(deps).map(d => ({
        value: d,
        name: colorFn(d + ":" + deps[d])
    }));
}

function chooseDoor(p: PackageRoot): inquirer.Question<NextActionAnswers> {
    const allDependencies = choicesFromDependencyObject(p.packageJson.dependencies, chalk.white)
        .concat(choicesFromDependencyObject(p.packageJson.devDependencies, chalk.grey))
        .concat(choicesFromDependencyObject(p.packageJson.peerDependencies, chalk.magenta));
    const listOfDependencies = _.sortBy(
        allDependencies,
        ct => ct.value as string)
    //  debug("The dependencies are: " + listOfDependencies.join(" & "))
    return {
        name: "door",
        type: "list",
        message: `There are ${listOfDependencies.length} doors. Choose one to enter: `,
        choices: listOfDependencies.concat([new inquirer.Separator()]),
        when: (a) => a.action === "doors",
    }
}

function chooseTeleport(): inquirer.Question<NextActionAnswers> {
    return {
        name: "destination",
        type: "input",
        message: `Enter a library to teleport to: `,
        when: (a) => a.action === "teleport",
    }
}

function determineCircumstances(appDir: string): Circumstances {
    const pjString: string | undefined = readPackageJson(appDir)
    if (!pjString) {
        return "not a package";
    }
    const pj = parsePackageJson(pjString);
    if (!pj) {
        return "invalid package json";
    }
    return {
        packageJson: pj,
        appDir
    }
}

type NotAPackage = "not a package";
type InvalidPackageDefinition = "invalid package json";

type PackageRoot = {
    packageJson: PackageJSON;
    appDir: string;
}

type Circumstances = NotAPackage | InvalidPackageDefinition | PackageRoot

function readPackageJson(appDir: string): string | undefined {
    try {
        return fs.readFileSync(path.join(appDir, "package.json"), { encoding: "utf8" })
    } catch {
        return;
    }
}

function parsePackageJson(pjContent: string): PackageJSON | undefined {
    try {
        return JSON.parse(pjContent);
    } catch {
        return;
    }
}