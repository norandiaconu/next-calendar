#!/usr/bin/env node
const fs = require("fs");
const moment = require("moment");

try {
    let dir = fs.readdirSync(".");
    let files = dir.filter(function (elem) {
        return elem.match(/.*\.(ics?)/gi);
    });
    console.log("files found: ", files);

    files.forEach((file) => {
        let data = fs.readFileSync(file, "utf8");
        processFile(data, file);
    });
} catch (e) {
    console.log("error: ", e.stack);
}

function processFile(data, file) {
    let count = 0;
    let index = data.indexOf("DTSTART;");
    let indexSummary = data.indexOf("SUMMARY:");
    let summary = "";
    let date = "";
    let dateArray = [];
    let event = new Object();

    while (index !== -1) {
        event = new Object();
        date = data
            .substring(index, index + 40)
            .split(":")[1]
            .substring(0, 8);
        date = date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6);
        summary = data.substring(indexSummary + 8, indexSummary + 100);
        index = data.indexOf("DTSTART;", index + 1);
        indexSummary = data.indexOf("SUMMARY:", indexSummary + 1);

        summary = summary.match(new RegExp("(.*)\r"))[0];
        summary = summary.replace("\r", "");

        if (moment(date).isAfter()) {
            event.date = date;
            event.summary = summary;
            dateArray.push(event);
        }
        count++;
    }

    let sorted = dateArray.sort(function (a, b) {
        let c = new Date(a.date);
        let d = new Date(b.date);
        return c - d;
    });
    if (sorted[0]) {
        console.log("upcoming events in " + file + ": ", sorted);
        return "upcoming events in " + file + ": " + sorted;
    } else {
        console.log("there are no upcoming events in " + file);
        return "there are no upcoming events in " + file;
    }
}

module.exports = { processFile };
