#!/usr/bin/env ts-node

import { youAreIn } from "./support/youAreIn";

youAreIn(process.cwd(), []).then((x) => {

    console.log("The end.");

});
