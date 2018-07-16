"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const describeMove_1 = require("./describeMove");
describe("color text for moving to another directory", () => {
    it("calls a move into an adjacent lib 'step across' ", () => {
        const result = describeMove_1.describeMove("/Users/jessitron/code/other/yargs/node_modules/chai", "/Users/jessitron/code/other/yargs/node_modules/ucui");
        assert.strictEqual(result, "You step across into ucui.");
    });
    it("calls a move down one 'descend'", () => {
        const result = describeMove_1.describeMove("/Users/jessitron/code/other/yargs", "/Users/jessitron/code/other/yargs/node_modules/ucui");
        assert.strictEqual(result, "You descend into ucui.");
    });
    it("calls move into a global lib 'whoosh'"); // I don't even know how to install something globally except by hand
    it("calls a move up some random directories 'twisted stairs'", () => {
        const result = describeMove_1.describeMove("/Users/jessitron/code/other/yargs", "/Users/jessitron/code/node_modules/@atomist/automation-client");
        assert.strictEqual(result, "You climb 2 twisted stairs, then descend into automation-client.");
    });
    it("calls a move up some node_module directories 'climb stairs and step'", () => {
        const result = describeMove_1.describeMove("/Users/jessitron/code/other/yargs/node_modules/chai/node_modules/subchai", "/Users/jessitron/code/other/yargs/node_modules/ucui");
        assert.strictEqual(result, "You climb one flight of stairs and step into ucui.");
    });
});
//# sourceMappingURL=describeMove.test.js.map