import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { getUser, type User } from '../lib/auth';
import { loadReports } from '../lib/safety-data';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://10.210.11.56:3000/health').then(r => r.json()).then(d => console.log('Backend:', d)).catch(e => console.log('Backend offline:', e));
    loadUserData();
    loadSafetyReports();
    requestLocationPermission();
  }, []);

  const loadUserData = async () => {
    const userData = await getUser();
    setUser(userData);
  };

  const loadSafetyReports = async () => {
    const reports = await loadReports();
    setRecentReports(reports.slice(0, 3));
  };

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      await Location.getCurrentPositionAsync({});
    }
  };

  const handleSOS = () => {
    navigation.navigate('SOSActive');
  };

  return (
    <LinearGradient
      colors={['#ffe5ec', '#ffb3c6', '#fb6f92']}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.appName}>SheRiff</Text>
              <Text style={styles.appTagline}>Stay Safe</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            {isOnline ? (
              <Ionicons name="wifi" size={20} color="#4ade80" />
            ) : (
              <Ionicons name="wifi-outline" size={20} color="#f87171" />
            )}
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>Hello, {user?.name || 'User'}! 👋</Text>
          <Text style={styles.welcomeSubtitle}>How can we help keep you safe today?</Text>
        </View>

        <TouchableOpacity
          onPress={handleSOS}
          style={styles.sosButton}
          activeOpacity={0.8}
        >
          <View style={styles.sosIcon}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
          </View>
          <Text style={styles.sosTitle}>Emergency SOS</Text>
          <Text style={styles.sosSubtitle}>Tap to send emergency alert</Text>
        </TouchableOpacity>

        <View style={styles.quickActions}>
          <Card onPress={() => navigation.navigate('TripMode')} style={styles.actionCard}>
            <Ionicons name="navigate" size={32} color="#fff" />
            <Text style={styles.actionTitle}>Start Trip</Text>
            <Text style={styles.actionSubtitle}>Safe route navigation</Text>
          </Card>

          <Card onPress={() => navigation.navigate('LocationSharing')} style={styles.actionCard}>
            <Ionicons name="share-social" size={32} color="#fff" />
            <Text style={styles.actionTitle}>Share Location</Text>
            <Text style={styles.actionSubtitle}>Live tracking</Text>
          </Card>

          <Card onPress={() => navigation.navigate('CommunityReports')} style={styles.actionCard}>
            <Ionicons name="location" size={32} color="#fff" />
            <Text style={styles.actionTitle}>Community Reports</Text>
            <Text style={styles.actionSubtitle}>Safety map</Text>
          </Card>

          <Card onPress={() => navigation.navigate('SafePlaces')} style={styles.actionCard}>
            <Ionicons name="shield-checkmark" size={32} color="#fff" />
            <Text style={styles.actionTitle}>Safe Places</Text>
            <Text style={styles.actionSubtitle}>Find nearby help</Text>
          </Card>
        </View>

        <View style={styles.moreFeatures}>
          <Button
            variant="outline"
            onPress={() => navigation.navigate('EvidenceCapture')}
            style={styles.featureButton}
          >
            <View style={styles.featureButtonContent}>
              <Ionicons name="videocam" size={20} color="#fff" />
              <Text style={styles.featureButtonText}>Evidence Capture</Text>
            </View>
          </Button>

          <Button
            variant="outline"
            onPress={() => navigation.navigate('Guardians')}
            style={styles.featureButton}
          >
            <View style={styles.featureButtonContent}>
              <Ionicons name="people" size={20} color="#fff" />
              <Text style={styles.featureButtonText}>
                Emergency Contacts
              </Text>
            </View>
          </Button>
        </View>

        <View style={styles.recentActivity}>
          <View style={styles.activityHeader}>
            <Ionicons name="alert-circle-outline" size={20} color="#fff" />
            <Text style={styles.activityTitle}>Recent Safety Reports</Text>
          </View>
          {recentReports.length === 0 ? (
            <Text style={styles.noReports}>No recent reports in your area</Text>
          ) : (
            <View style={styles.reportsList}>
              {recentReports.map((report) => (
                <View key={report.id} style={styles.reportItem}>
                  <Text style={styles.reportType}>
                    {report.type.replace('-', ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.reportLocation}>{report.location.address}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {!isOnline && (
          <View style={styles.offlineBanner}>
            <Ionicons name="wifi-outline" size={20} color="#fff" />
            <View style={styles.offlineContent}>
              <Text style={styles.offlineTitle}>Offline Mode Active</Text>
              <Text style={styles.offlineText}>
                Emergency SOS and SMS alerts are still available
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'rgba(251, 111, 146, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 56,
    height: 56,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  appTagline: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  welcome: {
    paddingVertical: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sosButton: {
    backgroundColor: '#ef4444',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  sosIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sosTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sosSubtitle: {
    fontSize: 14,
    color: '#fee2e2',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  actionCard: {
    width: '47%',
    padding: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  moreFeatures: {
    gap: 12,
    marginBottom: 24,
  },
  featureButton: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  recentActivity: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  noReports: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  reportsList: {
    gap: 8,
  },
  reportItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 8,
    borderRadius: 8,
  },
  reportType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    textTransform: 'capitalize',
  },
  reportLocation: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  offlineBanner: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  offlineContent: {
    flex: 1,
  },
  offlineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  offlineText: {
    fontSize: 14,
    color: '#fed7aa',
  },
});
