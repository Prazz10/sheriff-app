import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export default function LocationSharingScreen({ navigation }: any) {
  const [isSharing, setIsSharing] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentAddress, setCurrentAddress] = useState('Fetching location...');
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [guardians, setGuardians] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<any>(null);
  const locationRef = useRef<any>(null);
  const tripId = useRef('trip_' + Date.now());

  useEffect(() => {
    getCurrentLocation();
    loadGuardians();
    return () => stopAllServices();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setCurrentLocation(loc.coords);
      const address = await Location.reverseGeocodeAsync(loc.coords);
      if (address[0]) {
        setCurrentAddress(
          (address[0].street || '') + ', ' + (address[0].city || '')
        );
      }
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const loadGuardians = async () => {
    try {
      const userId = await AsyncStorage.getItem('sheriff_user_id');
      if (!userId) return;
      const { data } = await supabase
        .from('guardians')
        .select('*')
        .eq('user_id', userId);
      setGuardians(data || []);
    } catch (error) {
      console.error('Load guardians error:', error);
    }
  };

  const stopAllServices = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (locationRef.current) locationRef.current.remove();
  };

  const handleStartSharing = async () => {
    if (!duration) {
      Alert.alert('Select Duration', 'Please select how long to share');
      return;
    }
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location permission is required');
        setLoading(false);
        return;
      }

      const userId = await AsyncStorage.getItem('sheriff_user_id');

      // Save trip to Supabase
      await supabase.from('trips').insert({
        id: tripId.current,
        user_id: userId,
        origin: currentAddress,
        destination: 'Live Sharing',
        status: 'active',
      });

      // Start watching location
      locationRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        async (loc) => {
          setCurrentLocation(loc.coords);
          try {
            const address = await Location.reverseGeocodeAsync(loc.coords);
            if (address[0]) {
              setCurrentAddress((address[0].street || '') + ', ' + (address[0].city || ''));
            }
          } catch (e) {}

          // Save location to Supabase
          await supabase.from('location_events').insert({
            trip_id: tripId.current,
            user_id: userId,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );

      // Start countdown
      setTimeLeft(duration * 60);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleStopSharing();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setIsSharing(true);
      // Send location link to all guardians via WhatsApp
      if (guardians.length > 0 && currentLocation) {
        const trackingLink = 'https://www.google.com/maps/search/?api=1&query=' + currentLocation.latitude + ',' + currentLocation.longitude;
        const message = 'SheRiff Safety Alert: I am sharing my live location with you. Track me here: ' + trackingLink + ' (Updates every 5 mins)';
        for (const g of guardians) {
          const phone = g.guardian_phone.replace(/[^0-9]/g, '');
          const whatsappUrl = 'whatsapp://send?phone=' + phone + '&text=' + encodeURIComponent(message);
          Linking.openURL(whatsappUrl).catch(() => {
            Linking.openURL('sms:' + g.guardian_phone + '?body=' + encodeURIComponent(message));
          });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Could not start location sharing');
    } finally {
      setLoading(false);
    }
  };

  const handleStopSharing = async () => {
    stopAllServices();
    await supabase
      .from('trips')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', tripId.current);
    setIsSharing(false);
    setTimeLeft(0);
    Alert.alert('Stopped', 'Location sharing has ended');
    navigation.goBack();
  };

  const handleExtendTime = () => {
    setTimeLeft(prev => prev + 30 * 60);
    Alert.alert('Extended', '30 minutes added');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + ':' + (s < 10 ? '0' + s : s);
  };

  if (isSharing) {
    return (
      <LinearGradient colors={['#ffe5ec', '#ffb3c6', '#fb6f92']} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.pulseDot} />
          <Text style={styles.headerTitle}>Sharing Live Location</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.statusCard}>
            <Ionicons name="location" size={48} color="#fff" />
            <Text style={styles.statusTitle}>Live Sharing Active</Text>
            <Text style={styles.statusSubtitle}>
              {guardians.length} guardian(s) can track you
            </Text>
          </View>

          <View style={styles.card}>
            <Ionicons name="time" size={24} color="#fff" />
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Time Remaining</Text>
              <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Ionicons name="location" size={20} color="#fff" />
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Current Location</Text>
              <Text style={styles.cardValue}>{currentAddress}</Text>
              {currentLocation && (
                <Text style={styles.cardCoords}>
                  {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                </Text>
              )}
            </View>
          </View>

          {guardians.length > 0 && (
            <View style={styles.guardiansCard}>
              <Text style={styles.guardiansTitle}>Sharing With</Text>
              {guardians.map((g, i) => (
                <View key={i} style={styles.guardianRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                  <Text style={styles.guardianName}>{g.guardian_name}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.actions}>
            <Button onPress={handleExtendTime} variant="outline" size="lg">
              + Extend 30 min
            </Button>
            <Button onPress={handleStopSharing} size="lg" style={styles.stopButton}>
              Stop Sharing
            </Button>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#ffe5ec', '#ffb3c6', '#fb6f92']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Live Location</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Share Your Location</Text>
        <Text style={styles.subtitle}>Let your guardians track you in real-time</Text>

        {currentLocation && (
          <View style={styles.card}>
            <Ionicons name="location" size={20} color="#fff" />
            <View style={styles.cardContent}>
              <Text style={styles.cardLabel}>Your Current Location</Text>
              <Text style={styles.cardValue}>{currentAddress}</Text>
            </View>
          </View>
        )}

        {guardians.length > 0 && (
          <View style={styles.guardiansCard}>
            <Text style={styles.guardiansTitle}>Your Guardians</Text>
            {guardians.map((g, i) => (
              <View key={i} style={styles.guardianRow}>
                <Ionicons name="person" size={20} color="#fff" />
                <Text style={styles.guardianName}>{g.guardian_name} — {g.guardian_phone}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.durationCard}>
          <Text style={styles.guardiansTitle}>Select Duration</Text>
          <View style={styles.durationGrid}>
            {[15, 30, 60, 120, 180, 240].map(mins => (
              <TouchableOpacity
                key={mins}
                onPress={() => setDuration(mins)}
                style={[styles.durationButton, duration === mins && styles.durationButtonActive]}
              >
                <Text style={[styles.durationValue, duration === mins && styles.durationValueActive]}>
                  {mins}
                </Text>
                <Text style={[styles.durationUnit, duration === mins && styles.durationValueActive]}>
                  min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Button onPress={handleStartSharing} size="lg" loading={loading} style={styles.shareButton}>
          Start Sharing Location
        </Button>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  pulseDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4ade80' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 24 },
  statusCard: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 32, marginBottom: 16, gap: 12 },
  statusTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  statusSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 20, marginBottom: 16, gap: 12 },
  cardContent: { flex: 1 },
  cardLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  cardValue: { fontSize: 16, fontWeight: '600', color: '#fff' },
  cardCoords: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  timerValue: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  guardiansCard: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 20, marginBottom: 16 },
  guardiansTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  guardianRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  guardianName: { color: '#fff', fontSize: 15 },
  durationCard: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 20, marginBottom: 16 },
  durationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  durationButton: { width: '30%', padding: 16, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center' },
  durationButtonActive: { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.3)' },
  durationValue: { fontSize: 24, fontWeight: 'bold', color: 'rgba(255,255,255,0.7)' },
  durationUnit: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  durationValueActive: { color: '#fff' },
  shareButton: { marginTop: 8 },
  actions: { gap: 12 },
  stopButton: { backgroundColor: '#ef4444' },
});
