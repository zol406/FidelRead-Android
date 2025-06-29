import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import OnboardingScreen from './OnboardingScreen';
import OcrScannerScreen from './OcrScannerScreen';
import HistoryScreen from './HistoryScreen';
import HistoryDetailScreen from './HistoryDetailScreen';
import SettingsScreen from './SettingsScreen';
import Icon from 'react-native-vector-icons/Ionicons';

const ONBOARDING_FLAG_KEY = '@FidelRead_hasOnboarded';
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HistoryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#007AFF' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="HistoryList"
        component={HistoryScreen}
        options={{ title: 'Scan History' }}
      />
      <Stack.Screen
        name="HistoryDetail"
        component={HistoryDetailScreen}
        options={{ title: 'Scan Detail' }}
      />
    </Stack.Navigator>
  );
}

function MainApp() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Scanner') {
            iconName = focused ? 'scan-circle' : 'scan-circle-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Scanner" component={OcrScannerScreen} />
      <Tab.Screen name="History" component={HistoryStack} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const App = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    const checkForFirstLaunch = async () => {
      const hasOnboarded = await AsyncStorage.getItem(ONBOARDING_FLAG_KEY);
      if (hasOnboarded === null) {
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    };
    checkForFirstLaunch();
  }, []);

  const handleDoneOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_FLAG_KEY, 'true');
    setIsFirstLaunch(false);
  };

  if (isFirstLaunch === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return isFirstLaunch ? (
    <OnboardingScreen onDone={handleDoneOnboarding} />
  ) : (
    <NavigationContainer>
      <MainApp />
    </NavigationContainer>
  );
};

export default App;
