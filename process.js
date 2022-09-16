const cliProgress = require('cli-progress');

// create a new progress bar instance and use shades_classic theme
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

// start the progress bar with a total value of 200 and start value of 0
bar1.start(200, 0);

// update the current value in your application..
// bar1.update(100);

// stop the progress bar
const loader = setInterval(() => {

    if (bar1.getProgress() < 200) {
        process.stdout.write("\r");
        bar1.increment();
    } else {
        clearInterval(loader);
        bar1.stop();
    }
}, 100);

