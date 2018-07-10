
import Jetty from "jetty";

export function youAreIn(appDir: string) {

    var jetty = new Jetty(process.stdout)

    jetty.text("Hello from " + appDir);

    console.log("fuck you")

    // Clear the screen
    jetty.clear();

    // Draw a circle with fly colours
    var i = 0;
    setInterval(function () {
        i += 0.025;

        var x = Math.round(Math.cos(i) * 25 + 50),
            y = Math.round(Math.sin(i) * 13 + 20);

        jetty.rgb(
            Math.round(Math.random() * 215),
            Math.random() > 0.5
        ).moveTo([y, x]).text(".");
    }, 5);
}