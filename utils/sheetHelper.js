import AsyncStorage from '@react-native-async-storage/async-storage';

const CONFIG_KEY = '@google_sheets_config';

// ==========================================
// CONFIGURATION - UPDATE THESE VALUES
// ==========================================

// Your Apps Script Web App URL (from Step 2 of APPS_SCRIPT_SETUP.md)
// Example: 'https://script.google.com/macros/s/AKfycbx.../exec'
const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';

// Your API key (must match the one in your Apps Script)
// Change this to something unique and secure
const API_KEY = 'your-secret-api-key-here-change-this';

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Number of retry attempts for failed requests
const MAX_RETRIES = 3;

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Extract spreadsheet ID from Google Sheets URL
const extractSpreadsheetId = (url) => {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

// Get the Apps Script URL (can be customized for multiple scripts)
const getAppsScriptUrl = (url) => {
  return APPS_SCRIPT_URL;
};

// Create a fetch request with timeout
const fetchWithTimeout = async (url, options = {}, timeout = REQUEST_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
};

// Retry logic for failed requests
const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetchWithTimeout(url, options);
      return response;
    } catch (error) {
      const isLastAttempt = i === retries - 1;
      
      // Don't retry on certain errors
      if (error.message.includes('Invalid API key') || 
          error.message.includes('Sheet not found')) {
        throw error;
      }
      
      if (isLastAttempt) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, i), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// ==========================================
// CONFIGURATION MANAGEMENT
// ==========================================

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
    throw new Error('Failed to save configuration');
  }
};

// Clear all configuration
export const clearConfig = async () => {
  try {
    await AsyncStorage.removeItem(CONFIG_KEY);
  } catch (error) {
    console.error('Error clearing config:', error);
    throw new Error('Failed to clear configuration');
  }
};

// ==========================================
// GOOGLE SHEETS API FUNCTIONS
// ==========================================

// Fetch available tabs from a Google Sheet
export const fetchSheetTabs = async (url) => {
  const spreadsheetId = extractSpreadsheetId(url);
  if (!spreadsheetId) {
    throw new Error('Invalid Google Sheets URL. Please check the URL format.');
  }

  try {
    const appsScriptUrl = getAppsScriptUrl(url);
    
    if (!appsScriptUrl || appsScriptUrl === 'YOUR_APPS_SCRIPT_URL_HERE') {
      throw new Error('Apps Script URL not configured. Please update sheetHelper.js');
    }
    
    const requestUrl = `${appsScriptUrl}?action=getTabs&apiKey=${encodeURIComponent(API_KEY)}`;
    
    const response = await fetchWithRetry(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Apps Script not found. Please check the deployment URL.');
      }
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      if (data.error === 'Invalid API key') {
        throw new Error('Invalid API key. Please check your configuration.');
      }
      throw new Error(data.error);
    }
    
    if (!data.tabs || !Array.isArray(data.tabs)) {
      throw new Error('Invalid response format from server');
    }
    
    if (data.tabs.length === 0) {
      throw new Error('No tabs found in the spreadsheet');
    }
    
    return data.tabs;
  } catch (error) {
    console.error('Error fetching tabs:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('Network request failed')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    if (error.message.includes('timed out')) {
      throw new Error('Request timed out. Please try again.');
    }
    
    throw error;
  }
};

// Fetch headers from a specific tab
export const fetchHeaders = async (url, tabName) => {
  const spreadsheetId = extractSpreadsheetId(url);
  if (!spreadsheetId) {
    throw new Error('Invalid Google Sheets URL');
  }

  if (!tabName) {
    throw new Error('Tab name is required');
  }

  try {
    const appsScriptUrl = getAppsScriptUrl(url);
    
    if (!appsScriptUrl || appsScriptUrl === 'YOUR_APPS_SCRIPT_URL_HERE') {
      throw new Error('Apps Script URL not configured');
    }
    
    const requestUrl = `${appsScriptUrl}?action=getHeaders&tab=${encodeURIComponent(tabName)}&apiKey=${encodeURIComponent(API_KEY)}`;
    
    const response = await fetchWithRetry(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      if (data.error === 'Sheet not found') {
        throw new Error(`Tab "${tabName}" not found in the spreadsheet`);
      }
      throw new Error(data.error);
    }
    
    if (!data.headers || !Array.isArray(data.headers)) {
      throw new Error('Invalid response format');
    }
    
    if (data.headers.length === 0) {
      throw new Error('No headers found. Make sure the first row contains column names.');
    }
    
    return data.headers;
  } catch (error) {
    console.error('Error fetching headers:', error);
    
    if (error.message.includes('Network request failed')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw error;
  }
};

// Get sheet data (row count and last row)
export const getSheetData = async (url, tabName) => {
  const spreadsheetId = extractSpreadsheetId(url);
  if (!spreadsheetId) {
    throw new Error('Invalid Google Sheets URL');
  }

  if (!tabName) {
    throw new Error('Tab name is required');
  }

  try {
    const appsScriptUrl = getAppsScriptUrl(url);
    
    if (!appsScriptUrl || appsScriptUrl === 'YOUR_APPS_SCRIPT_URL_HERE') {
      throw new Error('Apps Script URL not configured');
    }
    
    const requestUrl = `${appsScriptUrl}?action=getData&tab=${encodeURIComponent(tabName)}&apiKey=${encodeURIComponent(API_KEY)}`;
    
    const response = await fetchWithRetry(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('Error from server:', data.error);
      // Return default values instead of throwing for getData
      return {
        rowCount: 0,
        lastRow: [],
      };
    }
    
    return {
      rowCount: data.rowCount || 0,
      lastRow: data.lastRow || [],
    };
  } catch (error) {
    console.error('Error getting sheet data:', error);
    // Return default values instead of throwing
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

  if (!tabName) {
    throw new Error('Tab name is required');
  }

  if (!values || !Array.isArray(values)) {
    throw new Error('Values must be an array');
  }

  if (values.length === 0) {
    throw new Error('Values array cannot be empty');
  }

  try {
    const appsScriptUrl = getAppsScriptUrl(url);
    
    if (!appsScriptUrl || appsScriptUrl === 'YOUR_APPS_SCRIPT_URL_HERE') {
      throw new Error('Apps Script URL not configured');
    }
    
    const response = await fetchWithRetry(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        action: 'appendRow',
        tab: tabName,
        values: values,
        apiKey: API_KEY,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      if (data.error === 'Invalid API key') {
        throw new Error('Invalid API key. Please check your configuration.');
      }
      if (data.error === 'Sheet not found') {
        throw new Error(`Tab "${tabName}" not found in the spreadsheet`);
      }
      throw new Error(data.error);
    }
    
    if (!data.success) {
      throw new Error('Append operation failed');
    }
    
    return true;
  } catch (error) {
    console.error('Error appending to sheet:', error);
    
    if (error.message.includes('Network request failed')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    if (error.message.includes('timed out')) {
      throw new Error('Request timed out. The data may have been saved. Please check the sheet.');
    }
    
    throw error;
  }
};

// ==========================================
// VALIDATION & TESTING FUNCTIONS
// ==========================================

// Validate that Apps Script URL is configured
export const validateConfiguration = () => {
  const errors = [];
  
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
    errors.push('Apps Script URL not configured');
  }
  
  if (!API_KEY || API_KEY === 'your-secret-api-key-here-change-this') {
    errors.push('API Key not configured');
  }
  
  if (!APPS_SCRIPT_URL.startsWith('https://script.google.com/')) {
    errors.push('Apps Script URL format is invalid');
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '));
  }
  
  return true;
};

// Test connection to Apps Script
export const testConnection = async () => {
  try {
    validateConfiguration();
    
    const response = await fetchWithTimeout(
      `${APPS_SCRIPT_URL}?action=getTabs&apiKey=${encodeURIComponent(API_KEY)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      },
      10000 // 10 second timeout for test
    );
    
    if (!response.ok) {
      return {
        success: false,
        message: `Server returned status ${response.status}`,
      };
    }
    
    const data = await response.json();
    
    if (data.error) {
      if (data.error === 'Invalid API key') {
        return {
          success: false,
          message: 'API key mismatch. Check that API_KEY matches your Apps Script.',
        };
      }
      return {
        success: false,
        message: data.error,
      };
    }
    
    return {
      success: true,
      message: 'Connection successful!',
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

// Get configuration status
export const getConfigStatus = () => {
  return {
    appsScriptConfigured: APPS_SCRIPT_URL !== 'YOUR_APPS_SCRIPT_URL_HERE',
    apiKeyConfigured: API_KEY !== 'your-secret-api-key-here-change-this',
    appsScriptUrl: APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE' ? 'Not configured' : APPS_SCRIPT_URL,
  };
};
