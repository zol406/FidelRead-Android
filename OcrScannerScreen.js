import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import DocumentPicker from 'react-native-document-picker';
import { pdfToImage } from 'react-native-pdf-to-image';
import TesseractOcr from 'react-native-tesseract-ocr';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import PdfPageSelectorModal from './PdfPageSelectorModal';

const HISTORY_STORAGE_KEY = '@FidelRead_History';
const SETTINGS_KEY = '@FidelRead_Settings';
const TESSERACT_CONFIG = {};
const TTS_FUNCTION_URL = 'YOUR_GOOGLE_CLOUD_FUNCTION_URL_HERE'; // This is the placeholder

const OcrScannerScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [sound, setSound] = useState(null);
  const [ocrLanguage, setOcrLanguage] = useState('amh');
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  const [selectedPdfUri, setSelectedPdfUri] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
        if (settingsJson) {
          const loadedSettings = JSON.parse(settingsJson);
          setOcrLanguage(loadedSettings.ocrLanguage || 'amh');
        }
      };
      loadSettings();
    }, [])
  );

  useEffect(() => {
    return () => { if (sound) sound.release(); };
  }, [sound]);

  const resetState = () => {
    setImageUri(null);
    setExtractedText('');
    if (sound) sound.stop();
  };

  const selectFromGalleryWithCrop = () => {
    resetState();
    ImagePicker.openPicker({
      cropping: true,
      mediaType: 'photo',
    }).then(image => {
      const imagePath = Platform.OS === 'android' ? image.path : image.sourceURL;
      setImageUri(imagePath);
      runOcrOnImage(imagePath);
    }).catch(error => {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log(error);
        alert('Could not select image.');
      }
    });
  };

  const openCameraWithCrop = () => {
    resetState();
    ImagePicker.openCamera({
      cropping: true,
      mediaType: 'photo',
    }).then(image => {
      const imagePath = Platform.OS === 'android' ? image.path : image.sourceURL;
      setImageUri(imagePath);
      runOcrOnImage(imagePath);
    }).catch(error => {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log(error);
        alert('Could not open camera.');
      }
    });
  };

  const selectFile = async () => {
    resetState();
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
      });

      const fileUri = res.uri;
      const fileType = res.type;

      if (fileType === 'application/pdf') {
        setSelectedPdfUri(fileUri);
        setIsPdfModalVisible(true);
      } else if (fileType.startsWith('image/')) {
        ImagePicker.openCropper({ path: fileUri, cropping: true }).then(image => {
          const imagePath = Platform.OS === 'android' ? image.path : image.sourceURL;
          setImageUri(imagePath);
          runOcrOnImage(imagePath);
        });
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('File Picker Error:', err);
        alert('An error occurred while picking the file.');
      }
    }
  };

  const handlePageSelected = (pageNumber, previewUri) => {
    setImageUri(previewUri);
    runOcrOnPdfPage(selectedPdfUri, pageNumber, previewUri);
  };
  
  const runOcrOnPdfPage = async (pdfUri, pageNumber, previewUri) => {
    setLoadingMessage('Extracting text from PDF...');
    setIsLoading(true);
    setExtractedText('');
    try {
      const imagePaths = await pdfToImage(pdfUri, { page: pageNumber });
      const imagePath = `file://${imagePaths[0]}`;
      
      const recognizedText = await TesseractOcr.recognize(imagePath, ocrLanguage, TESSERACT_CONFIG);
      const resultText = recognizedText || 'No text found on this page.';
      setExtractedText(resultText);

      if (recognizedText) {
        saveHistoryItem({ text: resultText, imageUri: previewUri });
      }
    } catch (err) {
      console.error(err);
      setExtractedText('Error extracting text from PDF page.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const runOcrOnImage = async (path) => {
    setLoadingMessage('Extracting text...');
    setIsLoading(true);
    setExtractedText('');
    try {
      const formattedPath = Platform.OS === 'android' ? path : path.replace('file://', '');
      const recognizedText = await TesseractOcr.recognize(formattedPath, ocrLanguage, TESSERACT_CONFIG);
      const resultText = recognizedText || 'No text found.';
      setExtractedText(resultText);
      if (recognizedText) {
        saveHistoryItem({ text: resultText, imageUri: path });
      }
    } catch (err) {
      console.error(err);
      setExtractedText('Error extracting text. The image may be too complex.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const saveHistoryItem = async (newItemData) => {
    try {
      const newHistoryItem = {
        id: new Date().toISOString(),
        ...newItemData
      };
      const existingHistoryJson = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      const existingHistory = existingHistoryJson ? JSON.parse(existingHistoryJson) : [];
      const updatedHistory = [...existingHistory, newHistoryItem];
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (e) {
      console.error('Failed to save history item.', e);
    }
  };
  
  const handleReadAloud = async () => {
    // This function would be here, handling the TTS call
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>FidelRead</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={selectFromGalleryWithCrop}>
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={openCameraWithCrop}>
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={selectFile}>
          <Text style={styles.buttonText}>Files</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentArea}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>{loadingMessage}</Text>
          </View>
        ) : (
          <>
            {imageUri && <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />}
            <ScrollView style={styles.textResultContainer}>
              <Text selectable style={styles.extractedText}>{extractedText || 'Pick a source to begin.'}</Text>
            </ScrollView>
          </>
        )}
      </View>
      
      <PdfPageSelectorModal
        visible={isPdfModalVisible}
        pdfUri={selectedPdfUri}
        onPageSelect={handlePageSelected}
        onClose={() => setIsPdfModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5', alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', marginVertical: 20, color: '#1c1e21' },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-around', width: '95%', marginBottom: 20 },
    button: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, flex: 1, marginHorizontal: 5, alignItems: 'center' },
    buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
    contentArea: { flex: 1, width: '95%', justifyContent: 'center', alignItems: 'center' },
    loadingContainer: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 15, fontSize: 16, color: '#65676b' },
    image: { width: '100%', height: 250, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
    textResultContainer: { flex: 1, width: '100%', backgroundColor: 'white', borderRadius: 5, padding: 15, borderWidth: 1, borderColor: '#ccc' },
    extractedText: { fontSize: 18, color: '#1c1e21', lineHeight: 28 },
});

export default OcrScannerScreen;
