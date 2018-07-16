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
const chalk_1 = __importDefault(require("chalk"));
const inquirer = __importStar(require("inquirer"));
const inquirer_autocomplete_prompt_1 = __importDefault(require("inquirer-autocomplete-prompt"));
const _ = __importStar(require("lodash"));
inquirer.registerPrompt("autocomplete", inquirer_autocomplete_prompt_1.default);
const ExitChoice = {
    name: "Leave",
    value: "exit",
    key: "e",
};
const LookForDoorsChoice = {
    name: `Look for ${chalk_1.default.bold("d")}oors`,
    value: "doors",
    key: "d",
};
const TeleportChoice = {
    name: "Teleport",
    value: "teleport",
    key: "t",
};
const LookAround = {
    name: "Look around",
    value: "look",
    key: "l",
};
const CheckGPS = {
    name: "Check GPS",
    value: "gps",
    key: "g",
};
function actionChoices(past) {
    if (past.length > 0) {
        const goBack = {
            name: "Go back to " + past[past.length - 1].packageJson.name,
            value: "back",
            key: "b",
        };
        return [LookForDoorsChoice, LookAround, CheckGPS, goBack, TeleportChoice, ExitChoice];
    }
    else {
        return [LookForDoorsChoice, LookAround, CheckGPS, TeleportChoice, ExitChoice];
    }
}
async function requestNextAction(p, past) {
    const question = {
        name: "action",
        type: "autocomplete",
        message: "What would you like to do?",
        source: autocompleteByNameOrKey(actionChoices(past)),
    };
    const response = await inquirer.prompt([question, chooseDoor(p), chooseTeleport()]);
    return response;
}
exports.requestNextAction = requestNextAction;
function autocompleteByNameOrKey(choices) {
    return async (answersSoFar, input) => choices
        .filter((c) => input == null ||
        c.key === input ||
        c.name.toLowerCase().startsWith(input.toLowerCase()))
        .map(boldKey);
}
function choicesFromDependencyObject(optionalDeps, colorFn) {
    const deps = optionalDeps || {};
    return Object.keys(deps).map((d) => ({
        value: d,
        name: colorFn(d + ":" + deps[d]),
    }));
}
function chooseDoor(p) {
    const allDependencies = choicesFromDependencyObject(p.packageJson.dependencies, chalk_1.default.white)
        .concat(choicesFromDependencyObject(p.packageJson.devDependencies, chalk_1.default.grey))
        .concat(choicesFromDependencyObject(p.packageJson.peerDependencies, chalk_1.default.magenta));
    const listOfDependencies = _.sortBy(allDependencies, (ct) => ct.value);
    //  debug("The dependencies are: " + listOfDependencies.join(" & "))
    const choices = listOfDependencies.length === 0 ?
        [{ name: "Go toward it", value: "VICTORY" }] :
        listOfDependencies.concat([new inquirer.Separator()]);
    const message = listOfDependencies.length === 0 ?
        `You see light ahead...` :
        `There are ${listOfDependencies.length} doors. Choose one to enter: `;
    return {
        name: "door",
        type: "list",
        message,
        choices,
        when: (a) => a.action === "doors",
    };
}
function chooseTeleport() {
    return {
        name: "destination",
        type: "input",
        message: `Enter a library to teleport to: `,
        when: (a) => a.action === "teleport",
    };
}
function boldFirstOccurrence(str, letter) {
    const i = str.toLowerCase().indexOf(letter.toLowerCase());
    if (i < 0) {
        return str;
    }
    return str.slice(0, i) + chalk_1.default.bold(str[i]) + str.slice(i + 1);
}
function boldKey(c) {
    return Object.assign({}, c, { name: boldFirstOccurrence(c.name, c.key) });
}
//# sourceMappingURL=requestNextAction.js.map