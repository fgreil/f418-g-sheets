import React, { useState, useEffect, useCallback } from 'react';
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
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from '@react-navigation/native';
import { loadConfig, getSheetData, appendToSheet } from '../utils/sheetHelper';

export default function MainScreen({ navigation }) {
  const [config, setConfig] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [formData, setFormData] = useState({});
  const [initialData, setInitialData] = useState({});
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const cfg = await loadConfig();
      setConfig(cfg);

      if (cfg?.currentSheet?.url && cfg?.currentSheet?.tab && cfg?.currentSheet?.headers) {
        const data = await getSheetData(
          cfg.currentSheet.url,
          cfg.currentSheet.tab
        );
        
        setHeaders(cfg.currentSheet.headers);
        setRowCount(data.rowCount);
        
        // Set initial form data from last row
        const initial = {};
        cfg.currentSheet.headers.forEach((header, index) => {
          initial[header] = data.lastRow?.[index] || '';
        });
        setFormData(initial);
        setInitialData(initial);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleInputChange = (header, value) => {
    const newData = { ...formData, [header]: value };
    setFormData(newData);
    
    // Check if any changes were made
    const changed = Object.keys(newData).some(
      key => newData[key] !== initialData[key]
    );
    setHasChanges(changed);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    
    try {
      const values = headers.map(header => formData[header]);
      await appendToSheet(
        config.currentSheet.url,
        config.currentSheet.tab,
        values
      );
      
      Alert.alert('Success', 'Data submitted successfully!');
      setHasChanges(false);
      
      // Reload to get new row count
      await loadData();
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError(error.message);
      Alert.alert('Error', 'Failed to submit data. You can copy the data manually.');
    }
    setSubmitting(false);
  };

  const handleCopyLine = async () => {
    const values = headers.map(header => formData[header]);
    const tsvLine = values.join('\t');
    await Clipboard.setStringAsync(tsvLine);
    Alert.alert('Copied', 'Data copied to clipboard');
    setSubmitError(null);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sheet Data Entry</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color="#1a1a1a" />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </View>
    );
  }

  if (!config?.currentSheet?.url || !config?.currentSheet?.tab || !config?.currentSheet?.headers) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sheet Data Entry</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color="#1a1a1a" />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.warningText}>
            No Google Sheet configured.
          </Text>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.linkText}>Go to Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sheet Data Entry</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.infoText}>
          Data from line {rowCount} shown as default
        </Text>

        {headers.map((header, index) => (
          <View key={index} style={styles.fieldContainer}>
            <Text style={styles.label}>{header}</Text>
            <TextInput
              style={styles.input}
              value={formData[header]}
              onChangeText={(value) => handleInputChange(header, value)}
              placeholder={`Enter ${header}`}
              placeholderTextColor="#9ca3af"
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitButton, !hasChanges && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!hasChanges || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>

        {submitError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{submitError}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyLine}
            >
              <Ionicons name="copy-outline" size={18} color="#fff" />
              <Text style={styles.copyButtonText}>Copy Line</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 40,
  },
  warningText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
  },
  linkButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  linkText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 24,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  errorContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 10,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 12,
  },
  copyButton: {
    flexDirection: 'row',
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
}); a
