import * as fs from "fs";
import { PackageJSON } from "package-json";
import * as path from "path";
import { injectSecretDungeonCrawl } from "./injectSecretDungeonCrawl";
import { NodeModuleResolutionExposed } from "./SecretDungeonCrawl";
import { Trap } from "./Trap";

export interface Room {
    crawl: NodeModuleResolutionExposed;
    packageJson: PackageJSON;
    appDir: string;
}

export async function buildRoom(appDir: string): Promise<Room | Trap> {
    let pjString;
    try {
        pjString = readPackageJson(appDir);
    } catch (error) {
        return {
            error,
            description: `You try to go to ${appDir}.\nIt is completely dark in here.\nRun away!`,
        };
    }
    let pj;
    try {
        pj = parsePackageJson(pjString);
    } catch (error) {
        return {
            error,
            description: `A rat bites your foot!The package.json is invalid in ${appDir} `,
        };
    }
    const room: Room = {
        packageJson: pj,
        appDir,
        crawl: await injectSecretDungeonCrawl(appDir),
    };
    return room;
}

function readPackageJson(appDir: string): string {
    return fs.readFileSync(path.join(appDir, "package.json"), { encoding: "utf8" });
}

function parsePackageJson(pjContent: string): PackageJSON {
    return JSON.parse(pjContent);
}
