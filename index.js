#!/usr/bin/env node
var fs = require('fs');
var moment = require('moment');

try {
    let dir = fs.readdirSync(".");
    let files = dir.filter( function(elem) {return elem.match(/.*\.(ics?)/ig);});
    console.log("files found: ", files);

    files.forEach(file => {
        var data = fs.readFileSync(file, "utf8");
        let count = 0;
        let index = data.indexOf("DTSTART;");
        let indexSummary = data.indexOf("SUMMARY:");
        var summary = "";
        var date = "";
        var dateArray = [];
        var event = new Object();

        while(index !== -1) {
            event = new Object();
            date = data.substring(index, index + 40).split(':')[1].substring(0, 8);
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

        var sorted = dateArray.sort(function(a, b){
            var c = new Date(a.date);
            var d  = new Date(b.date);
            return c - d;
        });
        console.log("upcoming events in " + file + ": ", sorted);
    });
} catch(e) {
    console.log("Error:", e.stack);
}