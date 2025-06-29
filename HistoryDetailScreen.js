import React, { useState, useLayoutEffect } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, Share,
} from 'react-native';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/Ionicons';

const TTS_FUNCTION_URL = 'YOUR_GOOGLE_CLOUD_FUNCTION_URL_HERE'; // This is the placeholder

const HistoryDetailScreen = ({ route, navigation }) => {
  const { item } = route.params;

  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const [sound, setSound] = useState(null);

  const onShare = async () => {
    try {
      await Share.share({
        title: `FidelRead Scan - ${new Date(item.id).toLocaleDateString()}`,
        message: item.text,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share the scan.');
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={onShare} style={{ marginRight: 15 }}>
          <Icon name="share-social-outline" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, item]);

  const handleReadAloud = async (text) => {
    if (!text || isTtsLoading) return;
    
    if (sound) {
        sound.stop(() => {
            sound.release();
            setSound(null);
        });
        return;
    }

    setIsTtsLoading(true);
    try {
      const response = await fetch(TTS_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const { audioContent } = await response.json();
      const path = `${RNFS.TemporaryDirectoryPath}/tts_audio_${item.id}.mp3`;
      await RNFS.writeFile(path, audioContent, 'base64');

      const newSound = new Sound(path, '', (error) => {
        setIsTtsLoading(false);
        if (error) {
          Alert.alert('Error', 'Failed to play audio.');
          return;
        }
        setSound(newSound);
        newSound.play((success) => {
            if (!success) {
                console.log('Playback failed due to audio decoding errors');
            }
            newSound.release();
            setSound(null);
        });
      });
    } catch (error) {
      setIsTtsLoading(false);
      Alert.alert('Error', 'Could not generate audio.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Image source={{ uri: item.imageUri }} style={styles.image} resizeMode="contain" />
        <View style={styles.textContainer}>
          <Text selectable style={styles.text}>{item.text}</Text>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={[styles.ttsButton, (isTtsLoading || sound) && styles.ttsButtonActive]}
        onPress={() => handleReadAloud(item.text)}
        disabled={isTtsLoading}
      >
        {isTtsLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.buttonContent}>
            <Icon name={sound ? "stop-circle-outline" : "play-circle-outline"} size={28} color="#fff" />
            <Text style={styles.buttonText}>{sound ? 'Stop' : 'Read Aloud'}</Text>
          </View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  image: { width: '100%', height: 250, backgroundColor: '#e1e1e1' },
  textContainer: { padding: 20, backgroundColor: 'white' },
  text: { fontSize: 18, lineHeight: 28, color: '#1c1e21' },
  ttsButton: {
    backgroundColor: '#34C759', padding: 15, margin: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center'
  },
  ttsButtonActive: {
    backgroundColor: '#FF3B30' // Change color to red when active (playing/loading)
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: '600', marginLeft: 10 },
});

export default HistoryDetailScreen;
