// tslint:disable:no-console
import chalk from "chalk";
import boxen from "boxen";

const Greyish = "#999999";
export const greyish = chalk.hex(Greyish);

export function outputDebug(str: string) {
    console.log("  " + chalk.italic(greyish(str)));
}

export function outputCurrentState(str: string, boxenOptions: boxen.BoxOptions = {}) {
    console.log(boxen(str, { padding: 1, float: "center", ...boxenOptions }));
}

export function outputDoom(str: string) {
    console.log(boxen(str, {
        padding: 0,
        borderColor: "red",
        borderStyle: "double",
        float: "center"
    }));
}

export function output(msg: string) {
    console.log(msg);
}
