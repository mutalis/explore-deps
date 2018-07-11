
import * as fs from "fs";
import * as path from "path";

import { PackageJSON } from "package-json";

export function youAreIn(appDir: string) {



    console.log("Hello from " + appDir);



}

function determineCircumstances(appDir: string): Circumstances {
    const pjString: string = readPackageJson(appDir)
    if (!pjString) {
        return "not a package";
    }
    const pj = parsePackageJson(pjString);
    if (!pj) {
        return "invalid package json";
    }
}

type NotAPackage = "not a package";
type InvalidPackageDefinition = "invalid package json";

type Circumstances = NotAPackage | InvalidPackageDefinition

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