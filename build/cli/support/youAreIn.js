"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jetty_1 = __importDefault(require("jetty"));
function youAreIn(appDir) {
    var jetty = new jetty_1.default(process.stdout);
    jetty.text("Hello from " + appDir);
    console.log("fuck you");
    // Clear the screen
    jetty.clear();
    // Draw a circle with fly colours
    var i = 0;
    setInterval(function () {
        i += 0.025;
        var x = Math.round(Math.cos(i) * 25 + 50), y = Math.round(Math.sin(i) * 13 + 20);
        jetty.rgb(Math.round(Math.random() * 215), Math.random() > 0.5).moveTo([y, x]).text(".");
    }, 5);
}
exports.youAreIn = youAreIn;
