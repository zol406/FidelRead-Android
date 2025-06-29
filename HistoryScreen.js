import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Alert, ActivityIndicator, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const HISTORY_STORAGE_KEY = '@FidelRead_History';

const HistoryScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [masterHistory, setMasterHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {
        setIsLoading(true);
        try {
          const jsonValue = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
          const historyItems = jsonValue != null ? JSON.parse(jsonValue) : [];
          const sortedHistory = historyItems.sort((a, b) => new Date(b.id) - new Date(a.id));
          setMasterHistory(sortedHistory);
          // Reset search query on focus
          setSearchQuery(''); 
          setFilteredHistory(sortedHistory);
        } catch (e) {
          console.error('Failed to load history.', e);
          Alert.alert('Error', 'Could not load scan history.');
        } finally {
          setIsLoading(false);
        }
      };
      loadHistory();
    }, [])
  );

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredHistory(masterHistory);
    } else {
      const filteredData = masterHistory.filter(item => {
        return item.text.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredHistory(filteredData);
    }
  }, [searchQuery, masterHistory]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('HistoryDetail', { item })}
    >
      <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemText} numberOfLines={3}>{item.text}</Text>
        <Text style={styles.itemDate}>{new Date(item.id).toLocaleString()}</Text>
      </View>
      <Icon name="chevron-forward-outline" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
        <Icon name={masterHistory.length === 0 ? "time-outline" : "search-outline"} size={80} color="#ccc" />
        <Text style={styles.emptyText}>
            {masterHistory.length === 0 ? 'No History Found' : 'No Results Found'}
        </Text>
        <Text style={styles.emptySubText}>
            {masterHistory.length === 0 ? 'Your saved scans will appear here.' : `No scans match "${searchQuery}"`}
        </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#8e8e93" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search scans..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8e8e93"
          clearButtonMode="while-editing"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" />
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmptyComponent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  searchContainer: {
    backgroundColor: 'white', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1,
    borderBottomColor: '#ddd', flexDirection: 'row', alignItems: 'center'
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1, backgroundColor: '#efeff4', borderRadius: 10, padding: 10, fontSize: 16
  },
  list: { paddingBottom: 20 },
  itemContainer: { flexDirection: 'row', backgroundColor: 'white', padding: 15, marginVertical: 8, marginHorizontal: 10, borderRadius: 10, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 15, backgroundColor: '#eee' },
  itemTextContainer: { flex: 1, justifyContent: 'center' },
  itemText: { fontSize: 16, color: '#333' },
  itemDate: { fontSize: 12, color: 'gray', marginTop: 5 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#aaa', marginTop: 20 },
  emptySubText: { fontSize: 16, color: '#ccc', marginTop: 10, textAlign: 'center', paddingHorizontal: 20 },
});

export default HistoryScreen;
