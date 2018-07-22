import * as assert from "assert";
import { itsaTrap } from "./Trap";

describe("is it a trap", () => {

    it("is not a trap", () => {
        assert.strictEqual(itsaTrap({}), false);
    })
    it("is a trap", () => {
        assert.equal(itsaTrap({
            error: new Error("doom"),
            description: "DOOOM"
        }),
            true)
    })
})