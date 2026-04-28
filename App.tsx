import React from 'react';
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

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
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
