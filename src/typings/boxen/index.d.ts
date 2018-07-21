/**
 * Types for the "boxen" module
 * 
 * this is not complete
 */

/**
 * Put a box around a string!
 * 
 * @param message what do you have to say?
 * @param options formatting options. The default is a simple white box, no padding, on the left.
 */
declare function boxen(message: string, options?: boxen.BoxOptions): string;

export = boxen;

declare namespace boxen {

    /* 
     * One of the boxes defined in cli-boxes (these are copied from there)
    */
    export type BuiltInBox = "classic" |
        "double" |
        "double-single" |
        "round" |
        "single" |
        "single-double"

    export interface CustomBox {
        topLeft: string;
        topRight: string;
        bottomRight: string;
        bottomLeft: string;
        vertical: string;
        horizontal: string;
    }

    export type BorderStyle = BuiltInBox | CustomBox

    export interface BoxOptions {
        borderStyle?: BorderStyle;
        padding?: number;
        borderColor?: BorderColor;
        float?: "left" | "center" | "right";
    }

    /* 
     * one of the colors defined in chalk 
     * (copied from the types in chalk)
     * */
    export type BorderColor =
        "inverse" |
        "black" |
        "red" |
        "green" |
        "yellow" |
        "blue" |
        "magenta" |
        "cyan" |
        "white" |
        "gray" |
        "grey" |
        "blackBright" |
        "redBright" |
        "greenBright" |
        "yellowBright" |
        "blueBright" |
        "magentaBright" |
        "cyanBright" |
        "whiteBright" |
        "bgBlack" |
        "bgRed" |
        "bgGreen" |
        "bgYellow" |
        "bgBlue" |
        "bgMagenta" |
        "bgCyan" |
        "bgWhite" |
        "bgBlackBright" |
        "bgRedBright" |
        "bgGreenBright" |
        "bgYellowBright" |
        "bgBlueBright" |
        "bgMagentaBright" |
        "bgCyanBright" |
        "bgWhiteBright";


}