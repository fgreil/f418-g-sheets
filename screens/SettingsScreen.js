import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { loadConfig, saveConfig, fetchSheetTabs, fetchHeaders } from '../utils/sheetHelper';

export default function SettingsScreen({ navigation }) {
  const [config, setConfig] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [tabs, setTabs] = useState([]);
  const [selectedTab, setSelectedTab] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchingTabs, setFetchingTabs] = useState(false);
  const [fetchingHeaders, setFetchingHeaders] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const cfg = await loadConfig();
    setConfig(cfg);
    
    if (cfg?.currentSheet?.url) {
      setSelectedUrl(cfg.currentSheet.url);
      setNewUrl(cfg.currentSheet.url);
    }
    
    if (cfg?.currentSheet?.tab) {
      setSelectedTab(cfg.currentSheet.tab);
    }
    
    setLoading(false);
  };

  const handleUrlChange = (text) => {
    setNewUrl(text);
    if (config?.sheets?.[text]) {
      setSelectedUrl(text);
      setSelectedTab(config.sheets[text].defaultTab || '');
      setTabs(config.sheets[text].tabs || []);
    } else {
      setTabs([]);
      setSelectedTab('');
    }
  };

  const handleAddUrl = () => {
    if (newUrl && !config?.sheets?.[newUrl]) {
      const updatedConfig = {
        ...config,
        sheets: {
          ...config?.sheets,
          [newUrl]: {
            tabs: [],
            defaultTab: null,
            headers: null,
          },
        },
      };
      setConfig(updatedConfig);
      saveConfig(updatedConfig);
      setSelectedUrl(newUrl);
    }
  };

  const handleFetchTabs = async () => {
    if (!selectedUrl) {
      Alert.alert('Error', 'Please enter a Google Sheets URL');
      return;
    }

    setFetchingTabs(true);
    try {
      const fetchedTabs = await fetchSheetTabs(selectedUrl);
      
      const updatedConfig = {
        ...config,
        sheets: {
          ...config?.sheets,
          [selectedUrl]: {
            ...config?.sheets?.[selectedUrl],
            tabs: fetchedTabs,
          },
        },
      };
      
      setConfig(updatedConfig);
      await saveConfig(updatedConfig);
      setTabs(fetchedTabs);
      
      Alert.alert('Success', `Found ${fetchedTabs.length} tab(s)`);
    } catch (error) {
      console.error('Error fetching tabs:', error);
      Alert.alert('Error', 'Failed to fetch tabs. Please check the URL and permissions.');
    }
    setFetchingTabs(false);
  };

  const handleSetDefaultTab = async () => {
    if (!selectedTab) {
      Alert.alert('Error', 'Please select a tab');
      return;
    }

    const updatedConfig = {
      ...config,
      sheets: {
        ...config?.sheets,
        [selectedUrl]: {
          ...config?.sheets?.[selectedUrl],
          defaultTab: selectedTab,
        },
      },
      currentSheet: {
        url: selectedUrl,
        tab: selectedTab,
        headers: config?.sheets?.[selectedUrl]?.headers || null,
      },
    };

    setConfig(updatedConfig);
    await saveConfig(updatedConfig);
    Alert.alert('Success', `Tab "${selectedTab}" set as default`);
  };

  const handleFetchHeaders = async () => {
    if (!selectedUrl || !selectedTab) {
      Alert.alert('Error', 'Please select a URL and tab first');
      return;
    }

    Alert.alert(
      'Confirm',
      'This will update the main screen with new headers. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            setFetchingHeaders(true);
            try {
              const headers = await fetchHeaders(selectedUrl, selectedTab);
              
              const updatedConfig = {
                ...config,
                sheets: {
                  ...config?.sheets,
                  [selectedUrl]: {
                    ...config?.sheets?.[selectedUrl],
                    headers: headers,
                  },
                },
                currentSheet: {
                  url: selectedUrl,
                  tab: selectedTab,
                  headers: headers,
                },
              };

              setConfig(updatedConfig);
              await saveConfig(updatedConfig);
              
              Alert.alert('Success', `Fetched ${headers.length} header(s)`);
            } catch (error) {
              console.error('Error fetching headers:', error);
              Alert.alert('Error', 'Failed to fetch headers from the sheet.');
            }
            setFetchingHeaders(false);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </View>
    );
  }

  const urlList = config?.sheets ? Object.keys(config.sheets) : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Google Sheets URL</Text>
          
          {urlList.length > 0 ? (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedUrl}
                onValueChange={(value) => {
                  if (value === '__new__') {
                    setSelectedUrl('');
                    setNewUrl('');
                    setTabs([]);
                    setSelectedTab('');
                  } else {
                    setSelectedUrl(value);
                    setNewUrl(value);
                    setTabs(config.sheets[value]?.tabs || []);
                    setSelectedTab(config.sheets[value]?.defaultTab || '');
                  }
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select a sheet..." value="" />
                {urlList.map((url) => (
                  <Picker.Item 
                    key={url} 
                    label={url.substring(0, 50) + (url.length > 50 ? '...' : '')} 
                    value={url} 
                  />
                ))}
                <Picker.Item label="+ Add new URL" value="__new__" />
              </Picker>
            </View>
          ) : null}

          <TextInput
            style={styles.input}
            value={newUrl}
            onChangeText={handleUrlChange}
            placeholder="Paste Google Sheets URL here"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {newUrl && !urlList.includes(newUrl) && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleAddUrl}
            >
              <Text style={styles.secondaryButtonText}>Add URL</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleFetchTabs}
            disabled={!selectedUrl || fetchingTabs}
          >
            {fetchingTabs ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Fetch Available Tabs</Text>
            )}
          </TouchableOpacity>
        </View>

        {tabs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Tab</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedTab}
                onValueChange={setSelectedTab}
                style={styles.picker}
              >
                <Picker.Item label="Select a tab..." value="" />
                {tabs.map((tab) => (
                  <Picker.Item key={tab} label={tab} value={tab} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSetDefaultTab}
              disabled={!selectedTab}
            >
              <Text style={styles.primaryButtonText}>Set Tab as Default</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedTab && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleFetchHeaders}
              disabled={fetchingHeaders}
            >
              {fetchingHeaders ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>(Re-)Fetch Headers</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {config?.currentSheet?.headers && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Headers</Text>
            <View style={styles.headersList}>
              {config.currentSheet.headers.map((header, index) => (
                <View key={index} style={styles.headerItem}>
                  <Text style={styles.headerText}>{header}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  headersList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  headerItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerText: {
    fontSize: 15,
    color: '#374151',
  },
});
