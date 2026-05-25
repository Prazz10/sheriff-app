import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

export default function TripModeScreen({ navigation }: any) {
  const [destination, setDestination] = useState('');
  const [currentAddress, setCurrentAddress] = useState('Fetching location...');
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [tripStarted, setTripStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(true);
  const [tripId, setTripId] = useState<string | null>(null);
  const locationRef = useRef<any>(null);

  useEffect(() => {
    getCurrentLocation();
    return () => { if (locationRef.current) locationRef.current.remove(); };
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

      // Let Supabase generate the UUID automatically
      const { data: trip, error } = await supabase.from('trips').insert({
        user_id: user.id,
        origin: currentAddress,
        destination: destination.trim(),
        status: 'active',
      }).select().single();

      if (error) throw error;

      setTripId(trip.id);

      locationRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        async (loc) => {
          setCurrentLocation(loc.coords);
          await supabase.from('location_events').insert({
            trip_id: trip.id,
            user_id: user.id,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      );

      setTripStarted(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not start trip');
    } finally {
      setLoading(false);
    }
  };

  const openRouteInMaps = () => {
    if (!currentLocation || !destination) return;
    const url = 'https://www.google.com/maps/dir/?api=1' +
      '&origin=' + currentLocation.latitude + ',' + currentLocation.longitude +
      '&destination=' + encodeURIComponent(destination) +
      '&travelmode=walking';
    Linking.openURL(url);
  };

  const handleEndTrip = async () => {
    Alert.alert('End Trip', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Trip', style: 'destructive',
        onPress: async () => {
          if (locationRef.current) locationRef.current.remove();
          if (tripId) {
            await supabase.from('trips').update({ status: 'completed', ended_at: new Date().toISOString() }).eq('id', tripId);
          }
          setTripStarted(false);
          navigation.goBack();
        }
      }
    ]);
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
          <View style={styles.statusCard}>
            <Ionicons name="navigate" size={48} color="#fff" />
            <Text style={styles.statusTitle}>Trip in Progress</Text>
            <Text style={styles.statusSubtitle}>Your location is being tracked</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="location" size={20} color="#fff" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>From</Text>
              <Text style={styles.infoValue}>{currentAddress}</Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="flag" size={20} color="#fff" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>To</Text>
              <Text style={styles.infoValue}>{destination}</Text>
            </View>
          </View>
          {currentLocation && (
            <View style={styles.infoCard}>
              <Ionicons name="compass" size={20} color="#fff" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>GPS Coordinates</Text>
                <Text style={styles.infoValue}>{currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}</Text>
              </View>
            </View>
          )}
          <TouchableOpacity style={styles.routeButton} onPress={openRouteInMaps}>
            <Ionicons name="map" size={20} color="#fff" />
            <Text style={styles.routeButtonText}>Open Route in Maps</Text>
          </TouchableOpacity>
          <Button onPress={handleEndTrip} size="lg" style={styles.endButton}>End Trip</Button>
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
        <Text style={styles.subtitle}>We will monitor your journey</Text>
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
              <Input label="" value={destination} onChangeText={setDestination} placeholder="Enter destination..." style={styles.destinationInput} />
            </View>
          </View>
        </View>
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>During your trip we will:</Text>
          {[
            { icon: 'location', text: 'Track your GPS every 5 seconds' },
            { icon: 'people', text: 'Share live location with guardians' },
            { icon: 'warning', text: 'Alert guardians if you need help' },
            { icon: 'shield-checkmark', text: 'Enable quick SOS access' },
          ].map((item, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name={item.icon as any} size={18} color="#fff" />
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>
        <Button onPress={handleStartTrip} size="lg" loading={loading}>Start Safe Trip</Button>
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
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 24 },
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
  statusCard: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 32, marginBottom: 16, gap: 12 },
  statusTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  statusSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 16, marginBottom: 12, gap: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  infoValue: { fontSize: 15, color: '#fff', fontWeight: '500' },
  routeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#3b82f6', borderRadius: 12, padding: 14, marginBottom: 12 },
  routeButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  endButton: { backgroundColor: '#ef4444', marginBottom: 12 },
  sosQuick: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.3)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#ef4444' },
  sosQuickText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
