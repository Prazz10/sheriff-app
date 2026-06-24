import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { supabase } from '../lib/supabase';

const DEVIATION_THRESHOLD_KM = 0.5; // 500 meters
const INACTIVITY_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
const CHECK_INTERVAL_MS = 30 * 1000; // 30 seconds

export default function TripModeScreen({ navigation }: any) {
  const [destination, setDestination] = useState('');
  const [currentAddress, setCurrentAddress] = useState('Fetching location...');
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [tripStarted, setTripStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(true);
  const [tripId, setTripId] = useState<string | null>(null);
  const [safetyStatus, setSafetyStatus] = useState<'safe' | 'warning' | 'alert'>('safe');
  const [alertMessage, setAlertMessage] = useState('');
  const locationRef = useRef<any>(null);
  const routePointsRef = useRef<any[]>([]);
  const lastMoveTimeRef = useRef(Date.now());
  const lastLocationRef = useRef<any>(null);
  const checkIntervalRef = useRef<any>(null);
  const guardianListRef = useRef<any[]>([]);

  useEffect(() => {
    getCurrentLocation();
    return () => {
      if (locationRef.current) locationRef.current.remove();
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, []);

  const getCurrentLocation = async () => {
    setFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCurrentAddress('Location permission denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCurrentLocation(loc.coords);
      lastLocationRef.current = loc.coords;
      const address = await Location.reverseGeocodeAsync(loc.coords);
      if (address[0]) {
        const addr = [address[0].street, address[0].district, address[0].city].filter(Boolean).join(', ');
        setCurrentAddress(addr || 'Current Location');
      }
    } catch (error) {
      setCurrentAddress('Could not fetch location');
    } finally {
      setFetchingLocation(false);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const sendGuardianAlert = async (alertMsg: string, lat: number, lng: number) => {
    try {
      const mapsLink = 'https://maps.google.com/?q=' + lat + ',' + lng;
      const fullMsg = 'SheRiff Safety Alert!\n' + alertMsg + '\nLocation: ' + mapsLink + '\nTime: ' + new Date().toLocaleString();
      const phones = guardianListRef.current.map((g: any) => g.guardian_phone);
      if (phones.length > 0) {
        const available = await SMS.isAvailableAsync();
        if (available) {
          await SMS.sendSMSAsync(phones, fullMsg);
        } else {
          for (const g of guardianListRef.current) {
            let phone = g.guardian_phone.replace(/[^0-9]/g, '');
            if (phone.length === 10) phone = '91' + phone;
            Linking.openURL('https://wa.me/' + phone + '?text=' + encodeURIComponent(fullMsg));
          }
        }
      }
    } catch (e) {}
  };

  const checkSafety = async (currentLat: number, currentLng: number) => {
    // Check inactivity
    const timeSinceMove = Date.now() - lastMoveTimeRef.current;
    if (timeSinceMove > INACTIVITY_THRESHOLD_MS) {
      setSafetyStatus('alert');
      const msg = 'No movement detected for 10+ minutes during trip!';
      setAlertMessage(msg);
      await sendGuardianAlert(msg, currentLat, currentLng);
      return;
    }

    // Check route deviation
    if (routePointsRef.current.length > 3) {
      // Calculate average expected path
      const recentPoints = routePointsRef.current.slice(-5);
      const avgLat = recentPoints.reduce((s: number, p: any) => s + p.lat, 0) / recentPoints.length;
      const avgLng = recentPoints.reduce((s: number, p: any) => s + p.lng, 0) / recentPoints.length;

      // Check if current location is far from recent path trend
      const distFromPath = getDistance(currentLat, currentLng, avgLat, avgLng);
      if (distFromPath > DEVIATION_THRESHOLD_KM) {
        setSafetyStatus('warning');
        const msg = 'Route deviation detected! User may have gone off track.';
        setAlertMessage(msg);
        Alert.alert(
          'Safety Alert',
          'You seem to have deviated from your route. Are you safe?',
          [
            { text: "I'm Safe", onPress: () => { setSafetyStatus('safe'); setAlertMessage(''); } },
            { text: 'Send SOS', style: 'destructive', onPress: () => navigation.navigate('SOSActive') }
          ]
        );
        await sendGuardianAlert(msg, currentLat, currentLng);
        return;
      }
    }

    setSafetyStatus('safe');
    setAlertMessage('');
  };

  const ensureUserExists = async (user: any) => {
    await supabase.from('users').upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || 'User',
      email: user.email || '',
      phone: user.phone || '',
    }, { onConflict: 'id' });
  };

  const handleStartTrip = async () => {
    if (!destination.trim()) {
      Alert.alert('Error', 'Please enter your destination');
      return;
    }
    if (!currentLocation) {
      Alert.alert('Error', 'Could not get your current location');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      await ensureUserExists(user);

      // Load guardians for alerts
      const { data: guardians } = await supabase
        .from('guardians').select('*').eq('user_id', user.id);
      guardianListRef.current = guardians || [];

      // Create trip in database
      const { data: trip, error } = await supabase.from('trips').insert({
        user_id: user.id,
        origin: currentAddress,
        destination: destination.trim(),
        status: 'active',
      }).select().single();

      if (error) throw error;
      setTripId(trip.id);

      // Initialize route tracking
      routePointsRef.current = [{
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
        time: Date.now()
      }];
      lastMoveTimeRef.current = Date.now();
      lastLocationRef.current = currentLocation;

      // Watch location every 10 seconds
      locationRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 10000, distanceInterval: 20 },
        async (loc) => {
          const { latitude, longitude } = loc.coords;
          setCurrentLocation(loc.coords);

          // Check if user moved
          if (lastLocationRef.current) {
            const dist = getDistance(
              lastLocationRef.current.latitude,
              lastLocationRef.current.longitude,
              latitude, longitude
            );
            if (dist > 0.01) { // moved more than 10 meters
              lastMoveTimeRef.current = Date.now();
              lastLocationRef.current = loc.coords;
            }
          }

          // Add to route history
          routePointsRef.current.push({ lat: latitude, lng: longitude, time: Date.now() });
          if (routePointsRef.current.length > 50) routePointsRef.current.shift();

          // Save to database
          await supabase.from('location_events').insert({
            trip_id: trip.id,
            user_id: user.id,
            latitude,
            longitude,
          });
        }
      );

      // Safety check every 30 seconds
      checkIntervalRef.current = setInterval(async () => {
        if (lastLocationRef.current) {
          await checkSafety(lastLocationRef.current.latitude, lastLocationRef.current.longitude);
        }
      }, CHECK_INTERVAL_MS);

      setTripStarted(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not start trip');
    } finally {
      setLoading(false);
    }
  };

  const handleEndTrip = async () => {
    Alert.alert('End Trip', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Trip', style: 'destructive',
        onPress: async () => {
          if (locationRef.current) locationRef.current.remove();
          if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
          if (tripId) {
            await supabase.from('trips').update({
              status: 'completed',
              ended_at: new Date().toISOString()
            }).eq('id', tripId);
          }
          setTripStarted(false);
          navigation.goBack();
        }
      }
    ]);
  };

  const openRouteInMaps = () => {
    if (!currentLocation || !destination) return;
    const url = 'https://www.google.com/maps/dir/?api=1' +
      '&origin=' + currentLocation.latitude + ',' + currentLocation.longitude +
      '&destination=' + encodeURIComponent(destination) +
      '&travelmode=walking';
    Linking.openURL(url);
  };

  const getSafetyColor = () => {
    switch (safetyStatus) {
      case 'safe': return '#22c55e';
      case 'warning': return '#f97316';
      case 'alert': return '#ef4444';
    }
  };

  if (tripStarted) {
    return (
      <LinearGradient colors={['#ffe5ec', '#ffb3c6', '#fb6f92']} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.pulseDot} />
          <Text style={styles.headerTitle}>Trip Active</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.statusCard, { borderColor: getSafetyColor(), borderWidth: 2 }]}>
            <Ionicons
              name={safetyStatus === 'safe' ? 'shield-checkmark' : 'warning'}
              size={48}
              color={getSafetyColor()}
            />
            <Text style={styles.statusTitle}>
              {safetyStatus === 'safe' ? 'Trip in Progress' : safetyStatus === 'warning' ? 'Route Deviation!' : 'Inactivity Alert!'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {alertMessage || 'Your location is being tracked safely'}
            </Text>
            <View style={[styles.safetyBadge, { backgroundColor: getSafetyColor() }]}>
              <Text style={styles.safetyBadgeText}>
                {safetyStatus === 'safe' ? '? On Route' : safetyStatus === 'warning' ? '? Off Route' : '?? No Movement'}
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="location" size={20} color="#fff" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Current Location</Text>
              <Text style={styles.infoValue}>{currentAddress}</Text>
              {currentLocation && (
                <Text style={styles.infoCoords}>
                  {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="flag" size={20} color="#fff" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Destination</Text>
              <Text style={styles.infoValue}>{destination}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="people" size={20} color="#fff" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Guardians Monitoring</Text>
              <Text style={styles.infoValue}>{guardianListRef.current.length} guardian(s) will be alerted if unsafe</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.routeButton} onPress={openRouteInMaps}>
            <Ionicons name="map" size={20} color="#fff" />
            <Text style={styles.routeButtonText}>Open Route in Google Maps</Text>
          </TouchableOpacity>

          <Button onPress={handleEndTrip} size="lg" style={styles.endButton}>
            End Trip
          </Button>

          <TouchableOpacity style={styles.sosQuick} onPress={() => navigation.navigate('SOSActive')}>
            <Ionicons name="warning" size={24} color="#fff" />
            <Text style={styles.sosQuickText}>Emergency SOS</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Start Trip</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Plan Your Safe Trip</Text>
        <Text style={styles.subtitle}>AI route monitoring will alert guardians if you deviate or stop moving</Text>

        <View style={styles.locationCard}>
          <View style={styles.locationRow}>
            <View style={styles.locationDot} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Current Location</Text>
              {fetchingLocation ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.locationValue}>Fetching GPS...</Text>
                </View>
              ) : (
                <Text style={styles.locationValue}>{currentAddress}</Text>
              )}
            </View>
            <TouchableOpacity onPress={getCurrentLocation} style={styles.refreshBtn}>
              <Ionicons name="refresh" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.locationDivider} />
          <View style={styles.locationRow}>
            <View style={[styles.locationDot, { backgroundColor: '#ef4444' }]} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Destination</Text>
              <Input
                label=""
                value={destination}
                onChangeText={setDestination}
                placeholder="Enter destination..."
                style={styles.destinationInput}
              />
            </View>
          </View>
        </View>

        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Smart Safety Features:</Text>
          {[
            { icon: 'location', text: 'GPS tracked every 10 seconds', color: '#22c55e' },
            { icon: 'map', text: 'Route deviation detection (>500m alert)', color: '#3b82f6' },
            { icon: 'time', text: 'Inactivity alert after 10 minutes', color: '#f97316' },
            { icon: 'people', text: 'Guardians notified automatically', color: '#a855f7' },
            { icon: 'warning', text: 'Quick SOS access during trip', color: '#ef4444' },
          ].map((item, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name={item.icon as any} size={18} color={item.color} />
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <Button onPress={handleStartTrip} size="lg" loading={loading}>
          Start Safe Trip
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
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 24 },
  locationCard: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 20, marginBottom: 20 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  locationDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4ade80' },
  locationInfo: { flex: 1 },
  locationLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  locationValue: { fontSize: 15, color: '#fff', fontWeight: '500' },
  locationDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 16, marginLeft: 24 },
  refreshBtn: { padding: 8 },
  destinationInput: { backgroundColor: 'transparent', borderWidth: 0, color: '#fff', fontSize: 15, padding: 0 },
  featuresCard: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 20, marginBottom: 20 },
  featuresTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  featureText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, flex: 1 },
  statusCard: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 24, marginBottom: 16, gap: 12 },
  statusTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  statusSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  safetyBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  safetyBadgeText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 16, marginBottom: 12, gap: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  infoValue: { fontSize: 15, color: '#fff', fontWeight: '500' },
  infoCoords: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  routeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#3b82f6', borderRadius: 12, padding: 14, marginBottom: 12 },
  routeButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  endButton: { backgroundColor: '#ef4444', marginBottom: 12 },
  sosQuick: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#ef4444' },
  sosQuickText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
