import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './app/WelcomeScreen';
import LoginScreen from './app/LoginScreen';
import SignupScreen from './app/SignupScreen';
import ProfileSetupScreen from './app/ProfileSetupScreen';
import DashboardScreen from './app/DashboardScreen';
import SOSActiveScreen from './app/SOSActiveScreen';
import TripModeScreen from './app/TripModeScreen';
import LocationSharingScreen from './app/LocationSharingScreen';
import CommunityReportsScreen from './app/CommunityReportsScreen';
import SafePlacesScreen from './app/SafePlacesScreen';
import EvidenceCaptureScreen from './app/EvidenceCaptureScreen';
import GuardiansScreen from './app/GuardiansScreen';
import SettingsScreen from './app/SettingsScreen';

const Stack = createNativeStackNavigator();

function SplashScreen() {
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
      Animated.loop(
        Animated.timing(rotation, { toValue: 1, duration: 2000, useNativeDriver: true })
      ),
    ]).start();
  }, []);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.splash}>
      <Animated.Image
        source={require('./assets/logo.jpeg')}
        style={[styles.logo, { transform: [{ rotate: spin }, { scale }], opacity }]}
        resizeMode="contain"
      />
      <Animated.Text style={[styles.splashText, { opacity }]}>SheRiff</Animated.Text>
      <Animated.Text style={[styles.splashSubtext, { opacity }]}>Your Safety Companion</Animated.Text>
    </View>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    setTimeout(() => setShowSplash(false), 3000);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="SOSActive" component={SOSActiveScreen} />
        <Stack.Screen name="TripMode" component={TripModeScreen} />
        <Stack.Screen name="LocationSharing" component={LocationSharingScreen} />
        <Stack.Screen name="CommunityReports" component={CommunityReportsScreen} />
        <Stack.Screen name="SafePlaces" component={SafePlacesScreen} />
        <Stack.Screen name="EvidenceCapture" component={EvidenceCaptureScreen} />
        <Stack.Screen name="Guardians" component={GuardiansScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: '#fb6f92', alignItems: 'center', justifyContent: 'center', gap: 16 },
  logo: { width: 150, height: 150, borderRadius: 75 },
  splashText: { fontSize: 48, fontWeight: 'bold', color: '#ffffff' },
  splashSubtext: { fontSize: 18, color: 'rgba(255,255,255,0.9)' },
});
