
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { Crawl as LocalCrawl, NodeModuleResolutionExposed } from "./SecretDungeonCrawl";

const secretDungeonCrawlModuleContent = fs.readFileSync(LocalCrawl.filename, { encoding: "utf8" });

const writeFile = promisify(fs.writeFile);

export async function injectSecretDungeonCrawl(appDir: string): Promise<NodeModuleResolutionExposed> {
    // write the secret crawler to the directory of interest
    const destinationPath: string = path.join(appDir, path.basename(LocalCrawl.filename));
    /* NOTE tslint: to see a bug that tslint can catch,
       remove this await.
       To see tslint catch it, add to tslint.rules "no-floating-promises" : true
       */
    await writeFile(destinationPath, secretDungeonCrawlModuleContent, { encoding: "utf8" });

    // now load it as a module
    const relativePath = "./" + path.relative(__dirname, path.join(appDir, "SecretDungeonCrawl.js"));
    const sdc = require(relativePath);
    // now delete it
    await (promisify(fs.unlink))(destinationPath);

    return sdc.Crawl;
}
