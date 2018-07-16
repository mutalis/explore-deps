import chalk from "chalk";
import * as inquirer from "inquirer";
import * as _ from "lodash";
import { DependencyMap } from "package-json";
import { Room } from "./buildRoom";
import { outputDebug } from "./output";

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

type NextAction = "exit" | "doors" | "back" | "teleport" | "gps" | "look";

export type NextActionAnswers = { action: "exit" | "back" | "gps" | "look" } |
{
    action: "doors", door: string,
} |
{
    action: "teleport",
    destination: string,
};

interface ChoiceInRoom extends inquirer.objects.ChoiceOption {
    value: NextAction;
    name: string; // not optional
    key: string; // not optional
}

const ExitChoice: ChoiceInRoom = {
    name: "Leave",
    value: "exit",
    key: "e",
};

const LookForDoorsChoice: ChoiceInRoom = {
    name: `Look for ${chalk.bold("d")}oors`,
    value: "doors",
    key: "d",
};

const TeleportChoice: ChoiceInRoom = {
    name: "Teleport",
    value: "teleport",
    key: "t",
};

const LookAround: ChoiceInRoom = {
    name: "Look around",
    value: "look",
    key: "l",
};

const CheckGPS: ChoiceInRoom = {
    name: "Check GPS",
    value: "gps",
    key: "g",
};

function actionChoices(past: Room[]): ChoiceInRoom[] {
    if (past.length > 0) {
        const goBack: ChoiceInRoom = {
            name: "Go back to " + past[past.length - 1].packageJson.name,
            value: "back",
            key: "b",
        };
        return [LookForDoorsChoice, LookAround, CheckGPS, goBack, TeleportChoice, ExitChoice];
    } else {
        return [LookForDoorsChoice, LookAround, CheckGPS, TeleportChoice, ExitChoice];
    }
}

export async function requestNextAction(p: Room, past: Room[]): Promise<NextActionAnswers> {
    const question: inquirer.Question<NextActionAnswers> = {
        name: "action",
        type: "autocomplete",
        message: "What would you like to do?",
        source: autocompleteByNameOrKey(actionChoices(past)),
    } as any;
    const response = await inquirer.prompt<NextActionAnswers>([question, chooseDoor(p), chooseTeleport()]);
    return response;
}

function autocompleteByNameOrKey(choices: ChoiceInRoom[]): (answers: any, input: string) => Promise<inquirer.objects.ChoiceOption[]> {
    return async (answersSoFar: Partial<NextActionAnswers>, input: string) =>
        choices
            .filter(c =>
                input == null ||
                c.key === input ||
                c.name.toLowerCase().startsWith(input.toLowerCase()))
            .map(boldKey)
}

function choicesFromDependencyObject(optionalDeps: DependencyMap | undefined,
    colorFn: (txt: string) => string): inquirer.objects.ChoiceOption[] {
    const deps = optionalDeps || {};
    return Object.keys(deps).map((d) => ({
        value: d,
        name: colorFn(d + ":" + deps[d]),
    }));
}

function chooseDoor(p: Room): inquirer.Question<NextActionAnswers> {
    const allDependencies = choicesFromDependencyObject(p.packageJson.dependencies, chalk.white)
        .concat(choicesFromDependencyObject(p.packageJson.devDependencies, chalk.grey))
        .concat(choicesFromDependencyObject(p.packageJson.peerDependencies, chalk.magenta));
    const listOfDependencies = _.sortBy(
        allDependencies,
        (ct) => ct.value as string);
    //  debug("The dependencies are: " + listOfDependencies.join(" & "))
    const choices = listOfDependencies.length === 0 ?
        [{ name: "You see light ahead...", value: "VICTORY" }] :
        listOfDependencies.concat([new inquirer.Separator()]);
    return {
        name: "door",
        type: "list",
        message: `There are ${listOfDependencies.length} doors. Choose one to enter: `,
        choices,
        when: (a) => a.action === "doors",
    };
}

function chooseTeleport(): inquirer.Question<NextActionAnswers> {
    return {
        name: "destination",
        type: "input",
        message: `Enter a library to teleport to: `,
        when: (a) => a.action === "teleport",
    };
}

function boldFirstOccurrence(str: string, letter: string): string {
    const i = str.toLowerCase().indexOf(letter.toLowerCase());
    if (i < 0) {
        return str;
    }
    return str.slice(0, i) + chalk.bold(str[i]) + str.slice(i + 1);
}

function boldKey(c: ChoiceInRoom): ChoiceInRoom {
    return {
        ...c,
        name: boldFirstOccurrence(c.name, c.key),
    }
}