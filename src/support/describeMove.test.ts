import * as assert from "assert";
import { describeMove } from "./describeMove";

describe("color text for moving to another directory", () => {

    it("calls a move into an adjacent lib 'step across' ", () => {
        const result = describeMove("/Users/jessitron/code/other/yargs/node_modules/chai",
            "/Users/jessitron/code/other/yargs/node_modules/ucui");
        assert.strictEqual(result, "You step across into ucui.");
    });

    it("calls a move down one 'descend'", () => {
        const result = describeMove("/Users/jessitron/code/other/yargs",
            "/Users/jessitron/code/other/yargs/node_modules/ucui");
        assert.strictEqual(result, "You descend into ucui.");
    });

    it("calls move into a global lib 'whoosh'"); // I don't even know how to install something globally except by hand

    it("calls a move up some random directories 'twisted stairs'", () => {
        const result = describeMove("/Users/jessitron/code/other/yargs",
            "/Users/jessitron/code/node_modules/@atomist/automation-client");
        assert.strictEqual(result, "You climb 2 twisted stairs, then descend into automation-client.");
    });

    it("calls a move up some node_module directories 'climb stairs and step'", () => {
        const result = describeMove("/Users/jessitron/code/other/yargs/node_modules/chai/node_modules/subchai",
            "/Users/jessitron/code/other/yargs/node_modules/ucui");
        assert.strictEqual(result, "You climb one flight of stairs and step into ucui.");
    });
});
