
import * as fs from "fs";
import * as path from "path";

import { PackageJSON } from "package-json";

export function youAreIn(appDir: string) {

    const circumstances = determineCircumstances(appDir);
    console.log("Hello from " + appDir);

    if (circumstances === "not a package") {
        output(`You are in ${appDir}. It is completely dark in here. What even is this place?? `);
    } else if (circumstances === "invalid package json") {
        output(`A rat bites your foot! The package.json is invalid in ${appDir}`);
    } else {
        output(`You are in "${circumstances.packageJson.name}". It appears to be version ${circumstances.packageJson.version}.`)
    }
}

function output(msg: string) {
    console.log(msg);
}

function determineCircumstances(appDir: string): Circumstances {
    const pjString: string | undefined = readPackageJson(appDir)
    if (!pjString) {
        return "not a package";
    }
    const pj = parsePackageJson(pjString);
    if (!pj) {
        return "invalid package json";
    }
    return {
        packageJson: pj,
    }
}

type NotAPackage = "not a package";
type InvalidPackageDefinition = "invalid package json";

type PackageRoot = {
    packageJson: PackageJSON
}

type Circumstances = NotAPackage | InvalidPackageDefinition | PackageRoot

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