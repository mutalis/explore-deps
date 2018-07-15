#!/usr/bin/env ts-node

import { output } from "./support/output";
import { youAreIn } from "./support/youAreIn";

youAreIn(process.cwd(), []).then((x) => {

    output("The end.");

});
