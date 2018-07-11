import * as fs from "fs";
import * as path from "path";
import chalk from "chalk";
import * as inquirer from "inquirer";
import * as _ from "lodash";

import { PackageJSON, DependencyMap } from "package-json";
import { outputCurrentState, output, outputDoom, debug } from "./output";
import { promisify } from "util";
import { Crawl as LocalCrawl, NodeModuleResolutionExposed, isModuleResolutionError } from "./SecretDungeonCrawl";

// want to: 
// - make it find roots of packages, because it fails when it goes into a lib
// - make it guess why it couldn't resolve a dev dependency
// - make it "check GPS" to tell you what dir it's in
// - make it report how many stairs you went up or down
// - make it report the difference in versions?

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const secretDungeonCrawlModuleContent = fs.readFileSync(LocalCrawl.filename, { encoding: "utf8" });

export async function youAreIn(appDir: string) {

    const circumstances = determineCircumstances(appDir);
    debug("Hello from " + appDir);

    if (circumstances === "not a package") {
        outputDoom(`You are in ${appDir}.\nIt is completely dark in here.\nWhat even is this place?? `);
    } else if (circumstances === "invalid package json") {
        outputDoom(`A rat bites your foot! The package.json is invalid in ${appDir}`);
    } else {
        outputCurrentState(`You are in "${circumstances.packageJson.name}". It appears to be version ${circumstances.packageJson.version}.`)
        return timeToAct({ ...circumstances, crawl: await injectSecretDungeonCrawl(appDir) });
    }
}

async function injectSecretDungeonCrawl(appDir: string): Promise<NodeModuleResolutionExposed> {
    // write the secret crawler to the directory of interest
    const destinationPath: string = path.join(appDir, path.basename(LocalCrawl.filename));
    debug("writing to: " + destinationPath);
    await writeFile(destinationPath, secretDungeonCrawlModuleContent, { encoding: "utf8" });

    // now load it as a module
    const relativePath = "./" + path.relative(__dirname, path.join(appDir, "SecretDungeonCrawl.js"));
    var sdc = require(relativePath);

    return sdc.Crawl;
}


async function timeToAct(p: PackageRoot & { crawl: NodeModuleResolutionExposed }): Promise<void> {
    const answers = await requestNextAction(p);
    debug(`You have chosen: ${answers.action}`)
    switch (answers.action) {
        case "exit":
            return;
        case "doors":
            output(`You have examined all the doors before you, and chosen: ${answers.door}`);
            const otherSide = findLibraryRoot(answers.door, p.crawl);
            if (itsaTrap(otherSide)) {
                outputDoom(chalk.red("It's a trap! ") + otherSide.details || otherSide.error.message)
                return youAreIn(p.appDir);
            }
            return youAreIn(otherSide);
    }
}

type Trap = {
    error: Error,
    details?: string
}

function itsaTrap(t: Trap | string): t is Trap {
    const maybe = t as Trap;
    return maybe.error !== undefined;
}

function findLibraryRoot(lib: string, crawl: NodeModuleResolutionExposed): string | Trap {
    let whereIsIt;
    try {
        whereIsIt = crawl.locateModule(lib);
    } catch (error) {
        const details = isModuleResolutionError(error) ?
            `${error.message}\nfrom ${error.filename}\nPaths searched: ${error.paths.join("\n")}` : undefined;
        return { error, details };
    }
    debug(`Resolved ${lib} to ${whereIsIt}`);
    const dir = path.dirname(whereIsIt);
    return dir;
}

type NextAction = "exit" | "doors";

type NextActionAnswers = { action: "exit" } | { action: "doors", door: string }

const ActionChoices: inquirer.objects.ChoiceOption[] = [
    {
        name: "Look for doors",
        value: "doors",
        key: "d"
    },
    {
        name: "Leave",
        value: "exit",
        key: "e",
    },
]

async function requestNextAction(p: PackageRoot): Promise<NextActionAnswers> {
    const question: inquirer.Question<NextActionAnswers> = {
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: ActionChoices
    };
    const response = await inquirer.prompt<NextActionAnswers>([question, chooseDoor(p)])
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