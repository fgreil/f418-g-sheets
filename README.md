# f418-g-sheets
A simple (Expo) React Native app to add new lines to Google Sheets.

## Project structure
```
f418-g-sheets/
├── assets/
│   ├── icon.png              # App icon (1024x1024)
│   ├── splash.png            # Splash screen image
│   ├── adaptive-icon.png     # Android adaptive icon
│   └── favicon.png           # Web favicon
├── utils/
│   └── sheetHelper.js        # Google Sheets integration helpers
├── screens/
│   ├── MainScreen.js         # Main screen with markdown carousel
│   └── SettingsScreen.js     # Configuration management
├── .gitignore                # Git ignore file
├── app.json                  # Expo configuration
├── App.js                    # Main app component with navigation
├── package.json              # Project dependencies and scripts
└── package-lock.json         # Locked dependency versions (will be generated)
```

## Objective
As you know, in Google Sheets, I can get an "anyone with the link can edit" URL for a Google Sheet by clicking the Share button, going to "General access," changing the setting from "Restricted" to "Anyone with the link," and select the Editor role, then copying the link and sharing it. This is the point for what want to build a very simple React-Native Expo App for.

The **Main Screen** assumes that we configured a Google-Sheets-URL in the settings. If not, a blank screen (just with a title bar) with a light-gray warning in the center appears with a link which directly opens the Setting-Screen. If the URL is set (and so is the tab of the respective sheet), the main screen shows a scrollable area where we have a field per column, label and format for the field is as in the respective Google-Sheet-tab (if there is actually a table-object defined, it is the headings of the table, otherwise it is the first line as labels. The pre-filled values are taken from the last non-empty line of the table. Below is a submit-button which is grayed as long as the values are unchanged. On the very top of the scroll-area, we see in the same light-gray font the number n of lines which are currently found in the table, e.g. "Data from line n shown as default." or whatever you suggest. After hitting the submit button a confirmation or error messages appears, indicating whether the submit was successful. In case of unsuccesful submission, the button "copy line" appears, which copies all entries (separated by tab) into the Zwischenablage. Once that's done, the button is no longer shown.

The **Configuration Screen** can be opened by clicking on the gear-icon on the right of the title bar of the Main Screen. It shows an (initially empty) drop-down field, where the URL of the google sheets can be entered. During the use of the App, the list will expand. All URLs are saved in a app-configuration-text-file in YAML-style. After that drop-down field, there is a button "Fetch Available Tabs" which opens the URL of the google sheets and fetches all available tabs. If successful, it populates the next-drop-down menu with tab-names. Afterwards comes a button "Set Tab as default". The Tab name is then somehow marked and the default tab for the current sheet is persisted in the above mentioned text-file. Below, there is a button "(Re-)fetch headers." which looks for the table headers (if available, logic see above) inside the respective tab of the google sheet. If clicked, a confirmation message appears, asking the user whether (s)he really wants to continue (as this updates the main screen).

## Same thing, different formulation

As proof of concept, we start with a clean, slim apple.com-like HTML page to work on any device which allows to access a (publically accessible) google-sheet. It should feature a hovering gear-icon on the top right which opens a properties overlay where the user can enter a new URL to the google sheet or select previously used one from a drop-down menu. Once a URL is chosen the button "Test connection" becomes active and does just that - testing whether the URL works. If it does, it fetches all available tabs of the google sheet. The user can then decide for one of them and click on "Save" to close the overlay. 

The main screen shows just a centered "No google sheet configured yet initially." If a URL for a sheet and a tab is choosen, it displays the name of the sheet and the tab as header. Below follows a brief statistics of how many lines are already in the (automatically detected) table.* If we look e.g. at https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?gid=0#gid=0  we should have the title "Example Spreadsheet - Class Data", and 30 rows. Below should be fields (labels defined by the table column headers, field format defined by the majority of the cells of the corresponding column) to create a new row for the table, pre-populated with the data from the very last existing row. 

Automatic table-detection works as follows: Either it is already formated as a table and we have already the column names. If not, we simply take all entries of the first row until we hit the first empty cell. 

## Version history
See [changelog.md](changelog.md)

