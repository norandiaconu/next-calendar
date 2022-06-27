const { loadURL, main, processFile } = require("../index");

const sorted = [{ date: "2099-01-01", summary: "Test" }];
describe("NextCalendar", () => {
    it("should return future calendar events", () => {
        const data =
            "DTSTART;TZID=Etc/UTC:20990101T163000\rDTEND;TZID=Etc/UTC:20990101T210000\rSUMMARY:Test\rCATEGORIES:Test\rskipSubCalendarTimezone:true";
        expect(processFile(data, "test.ics")).toEqual("upcoming events in test.ics: " + sorted);
    });

    it("should not return an event", () => {
        expect(processFile("", "test.ics")).toEqual("no upcoming events in test.ics");
    });

    it("should return one result", async () => {
        const url = "https://raw.githubusercontent.com/norandiaconu/next-calendar/main/__tests__/oneResult.ics";
        expect(await loadURL(url, "")).toEqual("upcoming events in downloaded.ics: " + sorted);
    });

    it("should find no local files", () => {
        const logSpy = jest.spyOn(console, "log");
        main();
        expect(logSpy).toHaveBeenCalledWith("local files found: ", []);
    });
});
