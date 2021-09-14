#!/usr/bin/env node
const fs = require("fs");
const moment = require("moment");
const axios = require("axios");
const commander = require("commander");
const { exit } = require("process");
const helpText = `Usage: next-calendar [options]\n
Options:
\t-d, --download <url>\tdownload ics from the provided url
\t-t, --token <token>\tpersonal access token to load ics from url requiring authentication\n
Examples:
\tLocal files:\t\t\tnext-calendar
\tLoad from url:\t\t\tnext-calendar -d "https://website.com/calendar.ics"
\tLoad from url with token:\tnext-calendar -d "https://website.com/calendar.ics" -t "123456"`;

try {
    const program = new commander.Command();
    program
        .option("-h, --help", "help text")
        .option("-d, --download <url>", "download url")
        .option("-t, --token <token>", "pass token");
    program.parse(process.argv);
    const options = program.opts();
    if (options.help) {
        console.log(helpText);
        exit(0);
    }
    if (options.download && options.token) {
        loadURL(options.download, options.token);
    } else if (options.download) {
        loadURL(options.download, "");
    }

    let dir = fs.readdirSync(".");
    let files = dir.filter(function (elem) {
        return elem.match(/.*\.(ics?)/gi);
    });
    console.log("local files found: ", files);

    files.forEach((file) => {
        let data = fs.readFileSync(file, "utf8");
        processFile(data, file);
    });
} catch (e) {
    console.log("error: ", e.stack);
}

async function loadURL(url, token) {
    let request = "";
    if (token) {
        request = {
            url: url,
            method: "GET",
            headers: {
                Authorization: "Bearer " + token,
            },
            responseType: "blob",
        };
    } else {
        request = {
            url: url,
            method: "GET",
            responseType: "blob",
        };
    }

    let downloadedEvents = "";
    await axios(request).then((res) => {
        downloadedEvents = processFile(res.data, "downloaded.ics");
    });
    return downloadedEvents;
}

function processFile(data, file) {
    let index = data.indexOf("DTSTART;");
    let indexSummary = data.indexOf("SUMMARY:");
    let summary = "";
    let date = "";
    let endDate = "";
    let indexEndDate = data.indexOf("DTEND;");
    let dateArray = [];
    let currentDateArray = [];
    let event = new Object();

    while (index !== -1) {
        event = new Object();
        date = data
            .substring(index, index + 40)
            .split(":")[1]
            .substring(0, 8);
        date = date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6);

        if (moment(date).isAfter()) {
            summary = data.substring(indexSummary + 8, indexSummary + 100);
            summary = summary.match(new RegExp("(.*)(\r|\n)"))[0];
            summary = summary.replace("\r", "");
            summary = summary.replace("\n", "");
            event.date = date;
            event.summary = summary;
            dateArray.push(event);
        } else {
            endDate = data
                .substring(indexEndDate, indexEndDate + 40)
                .split(":")[1]
                .substring(0, 8);
            endDate = endDate.slice(0, 4) + "-" + endDate.slice(4, 6) + "-" + endDate.slice(6);

            if (moment(endDate).isAfter()) {
                summary = data.substring(indexSummary + 8, indexSummary + 100);
                summary = summary.match(new RegExp("(.*)\r"))[0];
                summary = summary.replace("\r", "");
                event.startDate = date;
                event.endDate = endDate;
                event.summary = summary;
                currentDateArray.push(event);
            }
        }
        index = data.indexOf("DTSTART;", index + 1);
        indexSummary = data.indexOf("SUMMARY:", indexSummary + 1);
        indexEndDate = data.indexOf("DTEND;", indexEndDate + 1);
    }

    let sorted = dateArray.sort(function (a, b) {
        let c = new Date(a.date);
        let d = new Date(b.date);
        return c - d;
    });
    let currentSorted = currentDateArray.sort(function (a, b) {
        let c = new Date(a.date);
        let d = new Date(b.date);
        return c - d;
    });
    if (currentSorted[0]) {
        console.log("current events in \x1b[35m" + file + "\x1b[0m: ", currentSorted);
    }
    if (sorted[0]) {
        console.log("upcoming events in \x1b[35m" + file + "\x1b[0m: ", sorted);
        return "upcoming events in " + file + ": " + sorted;
    } else {
        console.log("no upcoming events in \x1b[35m" + file, "\x1b[0m");
        return "no upcoming events in " + file;
    }
}

module.exports = { loadURL, processFile };
