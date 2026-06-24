import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { isAuthenticated } from '../lib/auth';

export default function WelcomeScreen({ navigation }: any) {
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await isAuthenticated();
    if (authenticated) {
      navigation.replace('Dashboard');
    }
  };

  return (
    <LinearGradient
      colors={['#ffe5ec', '#ffb3c6', '#fb6f92']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.subtitle}>
            Your Personal Safety Companion
          </Text>
          <Text style={styles.tagline}>
            Stay Safe, Stay Connected
          </Text>

          <View style={styles.features}>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#60a5fa' }]}>
                <Ionicons name="location" size={24} color="#fff" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Real-Time Tracking</Text>
                <Text style={styles.featureDescription}>
                  Share your location with trusted contacts
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#f87171' }]}>
                <Ionicons name="alert-circle" size={24} color="#fff" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Emergency SOS</Text>
                <Text style={styles.featureDescription}>
                  Instant alerts to guardians and authorities
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#4ade80' }]}>
                <Ionicons name="people" size={24} color="#fff" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Community Safety</Text>
                <Text style={styles.featureDescription}>
                  Report and view safety information
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#a855f7' }]}>
                <Ionicons name="videocam" size={24} color="#fff" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Evidence Capture</Text>
                <Text style={styles.featureDescription}>
                  Record audio & video evidence during emergencies
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => navigation.navigate('Signup')}
            style={({ pressed }) => [
              styles.welcomeButton,
              pressed ? styles.outlineButtonFormat : styles.solidButtonFormat
            ]}
          >
            {({ pressed }) => (
              <Text style={[
                styles.buttonText,
                pressed ? styles.outlineTextFormat : styles.solidTextFormat
              ]}>
                Get Started
              </Text>
            )}
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Login')}
            style={({ pressed }) => [
              styles.welcomeButton,
              pressed ? styles.solidButtonFormat : styles.outlineButtonFormat
            ]}
          >
            {({ pressed }) => (
              <Text style={[
                styles.buttonText,
                pressed ? styles.solidTextFormat : styles.outlineTextFormat
              ]}>
                Login
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  logo: {
    width: 256,
    height: 256,
    marginBottom: 0,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: -40,
    marginBottom: 24,
    maxWidth: 360,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 48,
    maxWidth: 360,
  },
  features: {
    width: '100%',
    gap: 24,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    marginTop: 32,
    gap: 12,
  },
  welcomeButton: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 2,
  },
  solidButtonFormat: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  outlineButtonFormat: {
    backgroundColor: 'transparent',
    borderColor: '#fff',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  solidTextFormat: {
    color: '#fb6f92',
  },
  outlineTextFormat: {
    color: '#fff',
  },
});
