import * as fs from "fs";
import { PackageJSON } from "package-json";
import * as path from "path";
import { injectSecretDungeonCrawl } from "../secretDungeonCrawl/injectSecretDungeonCrawl";
import { NodeModuleResolutionExposed } from "../secretDungeonCrawl/SecretDungeonCrawl";
import { Trap, itsaTrap } from "./Trap";

export interface Room {
    crawl: NodeModuleResolutionExposed;
    packageJson: PackageJSON;
    appDir: string;
}

export async function buildRoom(appDir: string): Promise<Room | Trap> {
    let pjString = readPackageJson(appDir);
    if (itsaTrap(pjString)) {
        return pjString;
    }
    let pj = parsePackageJson(pjString);
    if (itsaTrap(pj)) {
        return pj;
    }
    const room: Room = {
        packageJson: pj,
        appDir,
        crawl: await injectSecretDungeonCrawl(appDir),
    };
    return room;
}

function readPackageJson(appDir: string): string | Trap {
    try {
        return fs.readFileSync(path.join(appDir, "package.json"), { encoding: "utf8" });
    } catch (error) {
        return {
            error,
            description: `It's too dark, I can't see anything! No package.json in ${appDir} `,
        };
    }
}

export function parsePackageJson(pjContent: string): PackageJSON | Trap {
    try {
        return JSON.parse(pjContent);
    } catch (error) {
        return {
            error,
            description: `A rat bites your foot! The package.json is invalid.`,
        };
    }
}
