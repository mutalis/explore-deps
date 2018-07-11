import chalk from "chalk";
import boxen from "boxen";

export function debug(str: string) {
    console.log("  " + chalk.gray(str));
}

export function outputCurrentState(str: string) {
    console.log(boxen(str, { padding: 1, float: "center" }))
}

export function outputDoom(str: string) {
    console.log(boxen(str, { padding: 0, borderColor: "red", borderStyle: "double" }))
}

export function output(msg: string) {
    console.log(msg);
}