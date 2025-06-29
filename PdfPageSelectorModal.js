import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Dimensions, Alert
} from 'react-native';
import { pdfToImage } from 'react-native-pdf-to-image';

const PdfPageSelectorModal = ({ visible, pdfUri, onPageSelect, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pagePreviews, setPagePreviews] = useState([]);

  useEffect(() => {
    if (visible && pdfUri) {
      generatePagePreviews(pdfUri);
    } else {
      setPagePreviews([]);
    }
  }, [visible, pdfUri]);

  const generatePagePreviews = async (uri) => {
    setIsLoading(true);
    try {
      const imagePaths = await pdfToImage(uri);
      const previews = imagePaths.map((path, index) => ({
        id: `${index}`,
        pageNumber: index,
        uri: `file://${path}`,
      }));
      setPagePreviews(previews);
    } catch (error) {
      console.error('Failed to generate PDF previews:', error);
      Alert.alert('Error', 'Could not process the selected PDF. It may be corrupted or password-protected.');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (pageNumber, previewUri) => {
    onPageSelect(pageNumber, previewUri);
    onClose();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleSelect(item.pageNumber, item.uri)}>
      <Image source={{ uri: item.uri }} style={styles.thumbnail} resizeMode="contain" />
      <Text style={styles.pageNumberText}>Page {item.pageNumber + 1}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Select a Page</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Generating Previews...</Text>
          </View>
        ) : (
          <FlatList
            data={pagePreviews}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd', backgroundColor: 'white' },
  title: { fontSize: 20, fontWeight: 'bold' },
  closeButton: { fontSize: 16, color: '#007AFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: 'gray' },
  grid: { padding: 5 },
  itemContainer: { flex: 1/2, margin: 5, alignItems: 'center', backgroundColor: 'white', borderRadius: 8, padding: 10, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  thumbnail: { width: Dimensions.get('window').width / 2 - 30, height: 150, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  pageNumberText: { fontSize: 14, fontWeight: '500' },
});

export default PdfPageSelectorModal;
