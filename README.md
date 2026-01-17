# f418-g-sheets
A simple (Expo) React Native app to add new lines to Google Sheets.

```
f418-g-sheets/
├── assets/
│   ├── icon.png              # App icon (1024x1024)
│   ├── splash.png            # Splash screen image
│   ├── adaptive-icon.png     # Android adaptive icon
│   └── favicon.png           # Web favicon
[...]
```

## Objective
As you know, in Google Sheets, I can get an "anyone with the link can edit" URL for a Google Sheet by clicking the Share button, going to "General access," changing the setting from "Restricted" to "Anyone with the link," and select the Editor role, then copying the link and sharing it. This is the point for what want to build a very simple React-Native Expo App for.

The **Main Screen** assumes that we configured a Google-Sheets-URL in the settings. If not, a blank screen (just with a title bar) with a light-gray warning in the center appears with a link which directly opens the Setting-Screen. If the URL is set (and so is the tab of the respective sheet), the main screen shows a scrollable area where we have a field per column, label and format for the field is as in the respective Google-Sheet-tab (if there is actually a table-object defined, it is the headings of the table, otherwise it is the first line as labels. The pre-filled values are taken from the last non-empty line of the table. Below is a submit-button which is grayed as long as the values are unchanged. On the very top of the scroll-area, we see in the same light-gray font the number n of lines which are currently found in the table, e.g. "Data from line n shown as default." or whatever you suggest. After hitting the submit button a confirmation or error messages appears, indicating whether the submit was successful. In case of unsuccesful submission, the button "copy line" appears, which copies all entries (separated by tab) into the Zwischenablage. Once that's done, the button is no longer shown.

The **Configuration Screen** can be opened by clicking on the gear-icon on the right of the title bar of the Main Screen. It shows an (initially empty) drop-down field, where the URL of the google sheets can be entered. During the use of the App, the list will expand. All URLs are saved in a app-configuration-text-file in YAML-style. After that drop-down field, there is a button "Fetch Available Tabs" which opens the URL of the google sheets and fetches all available tabs. If successful, it populates the next-drop-down menu with tab-names. Afterwards comes a button "Set Tab as default". The Tab name is then somehow marked and the default tab for the current sheet is persisted in the above mentioned text-file. Below, there is a button "(Re-)fetch headers." which looks for the table headers (if available, logic see above) inside the respective tab of the google sheet. If clicked, a confirmation message appears, asking the user whether (s)he really wants to continue (as this updates the main screen).

## Version history
See [changelog.md](changelog.md)

