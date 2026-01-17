import AsyncStorage from '@react-native-async-storage/async-storage';

const CONFIG_KEY = '@google_sheets_config';

// Extract spreadsheet ID from Google Sheets URL
const extractSpreadsheetId = (url) => {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

// Load configuration from AsyncStorage
export const loadConfig = async () => {
  try {
    const data = await AsyncStorage.getItem(CONFIG_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return {
      sheets: {},
      currentSheet: null,
    };
  } catch (error) {
    console.error('Error loading config:', error);
    return {
      sheets: {},
      currentSheet: null,
    };
  }
};

// Save configuration to AsyncStorage
export const saveConfig = async (config) => {
  try {
    await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving config:', error);
  }
};

// Fetch available tabs from a Google Sheet
export const fetchSheetTabs = async (url) => {
  const spreadsheetId = extractSpreadsheetId(url);
  if (!spreadsheetId) {
    throw new Error('Invalid Google Sheets URL');
  }

  try {
    // Use the Google Sheets API via public CSV export to get tab names
    // When a sheet is public with "anyone with link can edit", we can access it via API
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title&key=AIzaSyDummy`;
    
    // For this implementation, we'll use a workaround since we don't have API key
    // We'll try to fetch the sheet and parse available tabs from the HTML
    // In production, you should use proper Google Sheets API with OAuth
    
    // Simpler approach: try to access the sheet URL and extract tab info
    // This is a limitation - for full functionality, proper Google Sheets API integration is needed
    
    // For now, we'll return a mock implementation that the user needs to manually select
    // In a real app, you'd integrate with Google Sheets API properly
    
    // Attempt to fetch sheet metadata (this requires proper API setup)
    // For demo purposes, we'll use a simplified approach
    
    const response = await fetch(url);
    const html = await response.text();
    
    // Try to extract sheet names from the HTML
    const tabMatches = html.match(/"sheets":\[(.*?)\]/);
    const tabs = [];
    
    if (tabMatches) {
      // This is a very simplified parser - real implementation needs proper API
      const sheetsData = tabMatches[1];
      const titleMatches = sheetsData.matchAll(/"title":"(.*?)"/g);
      for (const match of titleMatches) {
        tabs.push(match[1]);
      }
    }
    
    // If we couldn't extract tabs, provide a fallback
    if (tabs.length === 0) {
      // Try alternative: the first sheet is usually accessible via /export?format=csv
      // We'll return "Sheet1" as default
      tabs.push('Sheet1');
    }
    
    return tabs;
  } catch (error) {
    console.error('Error fetching tabs:', error);
    // Return default tab if we can't fetch
    return ['Sheet1'];
  }
};

// Fetch headers from a specific tab
export const fetchHeaders = async (url, tabName) => {
  const spreadsheetId = extractSpreadsheetId(url);
  if (!spreadsheetId) {
    throw new Error('Invalid Google Sheets URL');
  }

  try {
    // Construct CSV export URL for the specific sheet
    const gid = 0; // In production, you'd need to map tab names to GIDs
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
    
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    
    // Parse first line to get headers
    const lines = csvText.split('\n');
    if (lines.length === 0) {
      throw new Error('Empty sheet');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    return headers.filter(h => h.length > 0);
  } catch (error) {
    console.error('Error fetching headers:', error);
    throw error;
  }
};

// Get sheet data (row count and last row)
export const getSheetData = async (url, tabName) => {
  const spreadsheetId = extractSpreadsheetId(url);
  if (!spreadsheetId) {
    throw new Error('Invalid Google Sheets URL');
  }

  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
    
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    
    const lines = csvText.trim().split('\n');
    const rowCount = lines.length - 1; // Exclude header
    
    let lastRow = [];
    if (lines.length > 1) {
      const lastLine = lines[lines.length - 1];
      lastRow = lastLine.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
    }
    
    return {
      rowCount,
      lastRow,
    };
  } catch (error) {
    console.error('Error getting sheet data:', error);
    return {
      rowCount: 0,
      lastRow: [],
    };
  }
};

// Append data to sheet
export const appendToSheet = async (url, tabName, values) => {
  const spreadsheetId = extractSpreadsheetId(url);
  if (!spreadsheetId) {
    throw new Error('Invalid Google Sheets URL');
  }

  try {
    // This requires Google Sheets API with proper authentication
    // For a public "anyone with link can edit" sheet, you need to use Apps Script or API
    
    // Here's what you'd do in production:
    // 1. Set up Google Sheets API credentials
    // 2. Use OAuth for user authentication
    // 3. Call the append API: 
    //    POST https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}:append
    
    // For this demo, we'll throw an error with instructions
    // In production, implement proper API integration
    
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${tabName}!A:Z:append?valueInputOption=USER_ENTERED`;
    
    // This would require proper authentication token
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${accessToken}`, // Need OAuth token
      },
      body: JSON.stringify({
        values: [values],
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to append data to sheet. Please ensure the sheet has proper permissions and you have set up API authentication.');
    }
    
    return true;
  } catch (error) {
    console.error('Error appending to sheet:', error);
    throw error;
  }
};
