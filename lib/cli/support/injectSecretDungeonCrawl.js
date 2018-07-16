"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const SecretDungeonCrawl_1 = require("./SecretDungeonCrawl");
const secretDungeonCrawlModuleContent = fs.readFileSync(SecretDungeonCrawl_1.Crawl.filename, { encoding: "utf8" });
const writeFile = util_1.promisify(fs.writeFile);
async function injectSecretDungeonCrawl(appDir) {
    // write the secret crawler to the directory of interest
    const destinationPath = path.join(appDir, path.basename(SecretDungeonCrawl_1.Crawl.filename));
    // outputDebug("writing to: " + destinationPath);
    await writeFile(destinationPath, secretDungeonCrawlModuleContent, { encoding: "utf8" });
    // now load it as a module
    const relativePath = "./" + path.relative(__dirname, path.join(appDir, "SecretDungeonCrawl.js"));
    const sdc = require(relativePath);
    // now delete it
    await (util_1.promisify(fs.unlink))(destinationPath);
    return sdc.Crawl;
}
exports.injectSecretDungeonCrawl = injectSecretDungeonCrawl;
//# sourceMappingURL=injectSecretDungeonCrawl.js.map