import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';

const SETTINGS_KEY = '@FidelRead_Settings';
const HISTORY_STORAGE_KEY = '@FidelRead_History';

const SUPPORTED_LANGUAGES = [
  { code: 'amh', name: 'Amharic' },
  { code: 'eng', name: 'English' },
];

const SettingsScreen = () => {
  const [settings, setSettings] = useState({ ocrLanguage: 'amh' });
  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
      if (settingsJson) {
        setSettings(JSON.parse(settingsJson));
      }
    };
    loadSettings();
  }, []);

  const handleClearHistory = () => {
    Alert.alert(
      "Clear All History",
      "Are you sure you want to permanently delete all your scanned items?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
          await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
          Alert.alert("Success", "All scan history has been cleared.");
        }}
      ]
    );
  };

  const onSelectLanguage = async (languageCode) => {
    const newSettings = { ...settings, ocrLanguage: languageCode };
    setSettings(newSettings);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    setLanguageModalVisible(false);
  };

  const getLanguageName = (code) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>
      <ScrollView>
        <Text style={styles.sectionHeader}>Data Management</Text>
        <TouchableOpacity style={styles.row} onPress={handleClearHistory}>
          <Icon name="trash-outline" size={22} color="#FF3B30" style={styles.icon} />
          <Text style={[styles.rowText, { color: '#FF3B30' }]}>Clear All Scan History</Text>
        </TouchableOpacity>

        <Text style={styles.sectionHeader}>General</Text>
        <TouchableOpacity style={styles.row} onPress={() => setLanguageModalVisible(true)}>
          <Icon name="language-outline" size={22} color="#333" style={styles.icon} />
          <Text style={styles.rowText}>Default OCR Language</Text>
          <Text style={styles.rowValue}>{getLanguageName(settings.ocrLanguage)}</Text>
          <Icon name="chevron-forward-outline" size={22} color="#ccc" />
        </TouchableOpacity>

        <Text style={styles.sectionHeader}>About</Text>
        <View style={styles.row}>
            <Icon name="apps-outline" size={22} color="#333" style={styles.icon} />
            <Text style={styles.rowText}>App Version</Text>
            <Text style={styles.rowValue}>1.1.0</Text>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isLanguageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setLanguageModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Language</Text>
            <FlatList
              data={SUPPORTED_LANGUAGES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.languageRow} onPress={() => onSelectLanguage(item.code)}>
                  <Text style={styles.languageText}>{item.name}</Text>
                  {settings.ocrLanguage === item.code && (
                    <Icon name="checkmark-circle" size={24} color="#007AFF" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#ddd', backgroundColor: 'white' },
  title: { fontSize: 34, fontWeight: 'bold' },
  sectionHeader: { fontSize: 13, color: 'gray', marginTop: 30, marginLeft: 20, marginBottom: 10, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#c8c7cc' },
  icon: { marginRight: 15 },
  rowText: { fontSize: 17, flex: 1 },
  rowValue: { fontSize: 17, color: 'gray' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#f2f2f7', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '50%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  languageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#e5e5e5', backgroundColor: 'white', paddingHorizontal: 20 },
  languageText: { fontSize: 18 },
});

export default SettingsScreen;
