# Quick Start Guide

Get your Google Sheets data entry app running in 15 minutes!

## Choose Your Path

### 🚀 **Path 1: Apps Script (Recommended - Easiest)**
**Best for:** Personal use, small teams, quick setup
**Time:** 15 minutes
**Difficulty:** ⭐ Easy

1. ✅ Install dependencies: `npm install`
2. ✅ Create Google Apps Script backend (see APPS_SCRIPT_SETUP.md)
3. ✅ Update `utils/sheetHelper.js` with your Apps Script URL and API key
4. ✅ Run the app: `npm start`
5. ✅ Configure your first sheet in Settings

### 🔐 **Path 2: Google Sheets API**
**Best for:** Production apps, many users, advanced features
**Time:** 1-2 hours
**Difficulty:** ⭐⭐⭐ Advanced

1. ✅ Install dependencies: `npm install`
2. ✅ Follow GOOGLE_API_SETUP.md for full OAuth setup
3. ✅ Replace `utils/sheetHelper.js` with API version
4. ✅ Test authentication flow
5. ✅ Deploy to app stores

## 5-Minute Demo (No Backend Required)

Want to see the UI without setting up a backend? You can!

1. **Install and run:**
   ```bash
   npm install
   npm start
   ```

2. **Open the app** (press `i` for iOS, `a` for Android in Expo)

3. **Click the gear icon** to see the Settings screen

4. **Enter any URL** to see the UI flow (it won't actually connect, but you'll see how it works)

The UI is fully functional even without a backend connection!

## Step-by-Step: Apps Script Method

### Part 1: Set Up Google Sheet (3 minutes)

1. **Create a Google Sheet** with data like this:
   ```
   Name        | Email              | Phone          | Notes
   -----------|--------------------|-----------------|---------
   John Doe   | john@example.com   | 555-0100       | Sample
   Jane Smith | jane@example.com   | 555-0101       | Test
   ```

2. **Share the sheet:**
   - Click "Share"
   - Change to "Anyone with the link"
   - Set permission to "Editor"
   - Copy the URL

### Part 2: Create Apps Script Backend (5 minutes)

1. **In your Google Sheet:**
   - Go to Extensions → Apps Script
   - Delete any existing code
   - Copy the code from `APPS_SCRIPT_SETUP.md` (the big JavaScript block)
   - **Change the API_KEY** to something unique (e.g., "myapp123secret")
   - Save (Ctrl+S or Cmd+S)

2. **Deploy:**
   - Click Deploy → New deployment
   - Click gear icon → Select "Web app"
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click "Deploy"
   - **Copy the Web App URL** (looks like `https://script.google.com/...`)
   - Authorize when prompted

### Part 3: Configure the Mobile App (5 minutes)

1. **Install dependencies:**
   ```bash
   cd google-sheets-app
   npm install
   ```

2. **Update `utils/sheetHelper.js`:**
   - Line 6: Replace `YOUR_APPS_SCRIPT_URL_HERE` with your Web App URL
   - Line 9: Replace `your-secret-api-key-here-change-this` with your API key from Part 2

3. **Start the app:**
   ```bash
   npm start
   ```

4. **In the app:**
   - Press `i` for iOS simulator or `a` for Android emulator
   - Or scan the QR code with Expo Go app on your phone

### Part 4: Connect Your Sheet (2 minutes)

1. **Click the gear icon** (Settings)
2. **Paste your Google Sheets URL** (from Part 1, Step 2)
3. Click "**Add URL**" if it's a new URL
4. Click "**Fetch Available Tabs**"
5. **Select your tab** from the dropdown
6. Click "**Set Tab as Default**"
7. Click "**(Re-)Fetch Headers**" → Confirm
8. **Go back** to the main screen

### Part 5: Test It! (1 minute)

1. You should see your form with fields matching your sheet headers
2. The default values should be from the last row
3. **Change some values**
4. Click "**Submit**"
5. Check your Google Sheet - new row should appear!

## Troubleshooting

### "Invalid API key" error
- Make sure the API key in Apps Script matches `utils/sheetHelper.js` exactly
- Check for extra spaces or quotes

### "Failed to fetch tabs" error
- Verify you copied the full Apps Script URL
- Check the deployment is active (not paused)
- Ensure permissions were granted

### Nothing happens when clicking Submit
- Open the browser console (F12) for error messages
- Check network tab for failed requests
- Verify the Apps Script is deployed correctly

### Can't see my sheet in the app
- Make sure you clicked "Fetch Available Tabs"
- Verify the sheet URL is correct (should contain `/spreadsheets/d/`)
- Check that you selected and saved the default tab

## Next Steps

Once you have it working:

1. **Customize the fields** - Change your sheet headers to match your needs
2. **Add validation** - Modify MainScreen.js to validate inputs
3. **Style it** - Update the styles to match your brand
4. **Add features** - See PROJECT_OVERVIEW.md for ideas
5. **Deploy** - Build with `expo build` for app stores

## Common Customizations

### Change the app name
Edit `app.json`:
```json
{
  "expo": {
    "name": "My Custom App",
    "slug": "my-custom-app"
  }
}
```

### Change colors
Edit the `StyleSheet` objects in `MainScreen.js` and `SettingsScreen.js`:
- Primary color: `#2563eb` (blue)
- Background: `#f9fafb` (light gray)
- Text: `#1a1a1a` (dark)

### Add a field type
In `MainScreen.js`, modify the `TextInput` component:
```jsx
// For numbers
<TextInput
  keyboardType="numeric"
  // ...
/>

// For email
<TextInput
  keyboardType="email-address"
  autoCapitalize="none"
  // ...
/>

// For phone
<TextInput
  keyboardType="phone-pad"
  // ...
/>
```

## Getting Help

- Check `PROJECT_OVERVIEW.md` for architecture details
- See `APPS_SCRIPT_SETUP.md` for backend troubleshooting
- Review `GOOGLE_API_SETUP.md` for production OAuth setup

## What You've Built

Congratulations! You now have:

✅ A mobile app that can add rows to Google Sheets
✅ A settings screen for managing multiple sheets
✅ Automatic header detection
✅ Error handling with fallback options
✅ Clean, professional UI
✅ Cross-platform support (iOS & Android)

## Share Your Success

Made something cool? Consider:
- Taking screenshots of your customizations
- Sharing your use case
- Contributing improvements back
- Helping others get started

Happy data collecting! 📊📱
