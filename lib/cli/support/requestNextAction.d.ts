import { Room } from "./buildRoom";
export declare type NextActionAnswers = {
    action: "exit" | "back" | "gps" | "look";
} | {
    action: "doors";
    door: string;
} | {
    action: "teleport";
    destination: string;
};
export declare function requestNextAction(p: Room, past: Room[]): Promise<NextActionAnswers>;
