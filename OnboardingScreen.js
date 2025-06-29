import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import Icon from 'react-native-vector-icons/Ionicons';

const OnboardingScreen = ({ onDone }) => {
  return (
    <SafeAreaView style={styles.container}>
      <Swiper
        style={styles.wrapper}
        loop={false}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
      >
        <View style={styles.slide}>
          <Icon name="camera-outline" size={120} color="#007AFF" />
          <Text style={styles.title}>Welcome to FidelRead</Text>
          <Text style={styles.description}>
            Scan Amharic & English text instantly from your camera, photo gallery, or document files.
          </Text>
        </View>
        <View style={styles.slide}>
          <Icon name="crop-outline" size={120} color="#34C759" />
          <Text style={styles.title}>Pinpoint Accuracy</Text>
          <Text style={styles.description}>
            Use the built-in cropper to isolate text and get the most accurate results from any image.
          </Text>
        </View>
        <View style={styles.slide}>
          <Icon name="document-text-outline" size={120} color="#FF9500" />
          <Text style={styles.title}>Process Documents</Text>
          <Text style={styles.description}>
            Select specific pages from multi-page PDF files to extract exactly what you need.
          </Text>
        </View>
        <View style={styles.slide}>
          <Icon name="volume-high-outline" size={120} color="#5856D6" />
          <Text style={styles.title}>Listen and Share</Text>
          <Text style={styles.description}>
            Have any extracted text read aloud or share it with other apps on your phone.
          </Text>
        </View>
        <View style={styles.slide}>
          <Icon name="checkmark-circle-outline" size={120} color="#007AFF" />
          <Text style={styles.title}>You're All Set!</Text>
          <TouchableOpacity style={styles.doneButton} onPress={onDone}>
            <Text style={styles.doneButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        </View>
      </Swiper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 40,
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    lineHeight: 24,
  },
  dot: {
    backgroundColor: 'rgba(0,0,0,.2)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  activeDot: {
    backgroundColor: '#007AFF',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  doneButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 40,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
