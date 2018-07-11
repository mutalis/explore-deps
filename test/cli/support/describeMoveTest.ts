import { describeMove } from "../../../src/cli/support/describeMove";
import * as assert from "assert";

describe("color text for moving to another directory", () => {

    it("move into an adjacent lib", () => {
        const result = describeMove("/Users/jessitron/code/other/yargs/node_modules/chai",
            "/Users/jessitron/code/other/yargs/node_modules/ucui");
        assert.strictEqual(result, "You step across into ucui.")
    });


    it("move down one", () => {
        const result = describeMove("/Users/jessitron/code/other/yargs",
            "/Users/jessitron/code/other/yargs/node_modules/ucui");
        assert.strictEqual(result, "You descend into ucui.")
    })

    it("move into a global lib") // how does this work? it doesn't look in the places that my libs go

    it("move up some random directories", () => {
        const result = describeMove("/Users/jessitron/code/other/yargs",
            "/Users/jessitron/code/node_modules/@atomist/automation-client");
        assert.strictEqual(result, "You climb 2 twisted stairs, then descend into automation-client.")
    })

    it("move up some node_module directories", () => {
        const result = describeMove("/Users/jessitron/code/other/yargs/node_modules/chai/node_modules/subchai",
            "/Users/jessitron/code/other/yargs/node_modules/ucui");
        assert.strictEqual(result, "You climb one flight of stairs and step into ucui.")
    });
});
