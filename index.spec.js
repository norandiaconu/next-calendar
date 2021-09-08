const { processFile } = require("./index");

describe("processFile result function", () => {
    test("it should return future calendar events", () => {
        const data =
            "DTSTART;TZID=Etc/UTC:20990101T163000\rDTEND;TZID=Etc/UTC:20990101T210000\rSUMMARY:Test\rCATEGORIES:Test\rskipSubCalendarTimezone:true";
        const sorted = [{ date: "2099-01-01", summary: "Test" }];
        expect(processFile(data, "test.ics")).toEqual("upcoming events in test.ics: " + sorted);
    });
});

describe("processFile no file function", () => {
    test("it should not return an event", () => {
        expect(processFile("", "test.ics")).toEqual("there are no upcoming events in test.ics");
    });
});
