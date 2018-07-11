
import * as fs from "fs";
import * as path from "path";
import { Question, prompt, objects } from "inquirer";

import { PackageJSON } from "package-json";

export async function youAreIn(appDir: string) {

    const circumstances = determineCircumstances(appDir);
    console.log("Hello from " + appDir);

    if (circumstances === "not a package") {
        output(`You are in ${appDir}. It is completely dark in here. What even is this place?? `);
    } else if (circumstances === "invalid package json") {
        output(`A rat bites your foot! The package.json is invalid in ${appDir}`);
    } else {
        output(`You are in "${circumstances.packageJson.name}". It appears to be version ${circumstances.packageJson.version}.`)
        return timeToAct(circumstances);
    }
}

async function timeToAct(p: PackageRoot): Promise<void> {
    const answers = await requestNextAction(p);
    output(`You have chosen: ${answers.action}`)
    switch (answers.action) {
        case "exit":
            return;
        case "doors":
            output(`You have examined all the doors before you, and chosen: ${answers.door}`);
            return youAreIn(p.appDir);
    }
}

type NextAction = "exit" | "doors";

type NextActionAnswers = { action: NextAction, door?: string }

const ActionChoices: objects.ChoiceOption[] = [
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
    const question: Question<NextActionAnswers> = {
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: ActionChoices
    };
    const response = await prompt<NextActionAnswers>([question, chooseDoor(p)])
    return response;
}

function chooseDoor(p: PackageRoot): Question<NextActionAnswers> {
    const listOfDependencies = Object.keys(p.packageJson.dependencies || {}).concat(Object.keys(p.packageJson.devDependencies || {})).sort()
    // console.log("The dependencies are: " + listOfDependencies.join(" & "))
    return {
        name: "door",
        type: "list",
        message: `There are ${listOfDependencies.length} doors. Choose one to enter: `,
        choices: listOfDependencies,
        when: (a) => a.action === "doors"
    }
}

function output(msg: string) {
    console.log(msg);
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
    appDir: string
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