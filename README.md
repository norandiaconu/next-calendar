# next-calendar

Display current/future calendar events for iCal files in root of directory where this is installed.
A URL can be passed in to load an online ics file and display the current/future events for that as well.

## Installation

`npm install next-calendar`

## Usage

* #### Local Files
    * Copy all iCal(.ics) files to the directory where the package has been installed.
    * Run `next-calendar` and current/future events in those calendars will be displayed in the cli.
* #### Online File
    * `next-calendar -d "https://website.com/calendar.ics"`
* #### Online File with Authentication
    * `next-calendar -d "https://website.com/calendar.ics" -t "123456"`

## Options

* `-d, --download <url>` download ics from the provided url
* `-t, --token <token>` personal access token to load ics from url requiring authentication