import { PackageJSON } from "package-json";
import { NodeModuleResolutionExposed } from "./SecretDungeonCrawl";
import { Trap } from "./Trap";
export interface Room {
    crawl: NodeModuleResolutionExposed;
    packageJson: PackageJSON;
    appDir: string;
}
export declare function buildRoom(appDir: string): Promise<Room | Trap>;
