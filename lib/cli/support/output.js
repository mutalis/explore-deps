"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-console
const boxen_1 = __importDefault(require("boxen"));
const chalk_1 = __importDefault(require("chalk"));
function outputDebug(str) {
    console.log("  " + chalk_1.default.gray(str));
}
exports.outputDebug = outputDebug;
function outputCurrentState(str) {
    console.log(boxen_1.default(str, { padding: 1, float: "center" }));
}
exports.outputCurrentState = outputCurrentState;
function outputDoom(str) {
    console.log(boxen_1.default(str, { padding: 0, borderColor: "red", borderStyle: "double", float: "center" }));
}
exports.outputDoom = outputDoom;
function output(msg) {
    console.log(msg);
}
exports.output = output;
//# sourceMappingURL=output.js.map