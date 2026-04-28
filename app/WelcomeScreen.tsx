import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
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
      colors={['#9333ea', '#a855f7', '#ec4899']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Image
            source={require('../assets/logo.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>SheRiff</Text>
          <Text style={styles.subtitle}>
            Your personal safety companion. Stay safe, stay connected.
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
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            onPress={() => navigation.navigate('Signup')}
            size="lg"
            style={styles.primaryButton}
          >
            Get Started
          </Button>
          <Button
            onPress={() => navigation.navigate('Login')}
            variant="outline"
            size="lg"
          >
            Login
          </Button>
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
    marginBottom: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
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
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#fff',
  },
});
