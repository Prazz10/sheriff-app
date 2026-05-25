import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const PLACE_TYPES = [
  { query: 'police station near me', type: 'police', label: 'Police Station' },
  { query: 'hospital near me', type: 'hospital', label: 'Hospital' },
  { query: 'pharmacy near me', type: 'hospital', label: 'Pharmacy' },
  { query: 'bus stop near me', type: 'transport', label: 'Bus Stop' },
  { query: 'railway station near me', type: 'transport', label: 'Railway Station' },
  { query: 'convenience store near me', type: 'store', label: 'Store' },
  { query: 'supermarket near me', type: 'store', label: 'Supermarket' },
];

export default function SafePlacesScreen({ navigation }: any) {
  const [selectedType, setSelectedType] = useState('all');
  const [userLocation, setUserLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');

  useEffect(() => { getLocation(); }, []);

  const getLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLoading(false); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setUserLocation(loc.coords);
      const addr = await Location.reverseGeocodeAsync(loc.coords);
      if (addr[0]) {
        setAddress([addr[0].street, addr[0].district, addr[0].city].filter(Boolean).join(', '));
      }
    } catch (e) {} finally { setLoading(false); }
  };

  const openGoogleMapsSearch = (query: string) => {
    if (!userLocation) return;
    const url = 'https://www.google.com/maps/search/' +
      encodeURIComponent(query) +
      '/@' + userLocation.latitude + ',' + userLocation.longitude + ',15z';
    Linking.openURL(url);
  };

  const openDirections = (query: string) => {
    if (!userLocation) return;
    const url = 'https://www.google.com/maps/dir/?api=1' +
      '&origin=' + userLocation.latitude + ',' + userLocation.longitude +
      '&destination=' + encodeURIComponent(query) +
      '&travelmode=walking';
    Linking.openURL(url);
  };

  const filteredTypes = selectedType === 'all'
    ? PLACE_TYPES
    : PLACE_TYPES.filter(p => p.type === selectedType);

  const getTypeIcon = (type: string): any => {
    switch (type) {
      case 'police': return 'shield';
      case 'hospital': return 'medkit';
      case 'store': return 'storefront';
      case 'transport': return 'bus';
      default: return 'location';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'police': return '#3b82f6';
      case 'hospital': return '#ef4444';
      case 'store': return '#22c55e';
      case 'transport': return '#a855f7';
      default: return '#fb6f92';
    }
  };

  return (
    <LinearGradient colors={['#ffe5ec', '#ffb3c6', '#fb6f92']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safe Places</Text>
          <TouchableOpacity onPress={getLocation}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {address ? (
          <View style={styles.locationBadge}>
            <Ionicons name="location" size={14} color="#fff" />
            <Text style={styles.locationText} numberOfLines={1}>{address}</Text>
          </View>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {[
          { value: 'all', label: 'All', icon: 'apps' },
          { value: 'police', label: 'Police', icon: 'shield' },
          { value: 'hospital', label: 'Hospital', icon: 'medkit' },
          { value: 'store', label: 'Store', icon: 'storefront' },
          { value: 'transport', label: 'Transit', icon: 'bus' },
        ].map(filter => (
          <TouchableOpacity
            key={filter.value}
            onPress={() => setSelectedType(filter.value)}
            style={[styles.filterButton, selectedType === filter.value && styles.filterButtonActive]}
          >
            <Ionicons name={filter.icon as any} size={14} color="#fff" />
            <Text style={styles.filterLabel}>{filter.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      ) : !userLocation ? (
        <View style={styles.centerContainer}>
          <Ionicons name="location-outline" size={48} color="rgba(255,255,255,0.5)" />
          <Text style={styles.emptyText}>Location permission needed</Text>
          <TouchableOpacity onPress={getLocation} style={styles.retryButton}>
            <Text style={styles.retryText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={18} color="#fff" />
            <Text style={styles.infoText}>
              Tap any place to find it on Google Maps. Tap the navigate button for directions from your current location.
            </Text>
          </View>

          {filteredTypes.map((place, index) => (
            <View key={index} style={styles.placeCard}>
              <View style={[styles.placeIcon, { backgroundColor: getTypeColor(place.type) }]}>
                <Ionicons name={getTypeIcon(place.type)} size={22} color="#fff" />
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName}>{place.label}</Text>
                <Text style={styles.placeSubtext}>Near {address || 'your location'}</Text>
              </View>
              <View style={styles.placeActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openGoogleMapsSearch(place.query)}
                >
                  <Ionicons name="search" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#22c55e' }]}
                  onPress={() => openDirections(place.label + ' near ' + address)}
                >
                  <Ionicons name="navigate" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={styles.emergencyCard}>
            <Text style={styles.emergencyTitle}>Emergency Numbers</Text>
            {[
              { name: 'Police', number: '100' },
              { name: 'Ambulance', number: '108' },
              { name: 'Women Helpline', number: '1091' },
              { name: 'Emergency', number: '112' },
            ].map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.emergencyRow}
                onPress={() => Linking.openURL('tel:' + item.number)}
              >
                <Text style={styles.emergencyName}>{item.name}</Text>
                <View style={styles.callButton}>
                  <Ionicons name="call" size={16} color="#fff" />
                  <Text style={styles.emergencyNumber}>{item.number}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 12, backgroundColor: 'rgba(251,111,146,0.3)' },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 24, marginBottom: 4 },
  locationText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, flex: 1 },
  filterRow: { paddingHorizontal: 24, paddingVertical: 12, maxHeight: 56 },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  filterButtonActive: { backgroundColor: '#fb6f92', borderWidth: 1.5, borderColor: '#fff' },
  filterLabel: { color: '#fff', fontSize: 13, fontWeight: '500' },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  loadingText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  emptyText: { color: '#fff', fontSize: 16 },
  retryButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  infoCard: { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 14, marginBottom: 20 },
  infoText: { flex: 1, color: '#fff', fontSize: 13, lineHeight: 18 },
  placeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 14, marginBottom: 12, gap: 12 },
  placeIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 3 },
  placeSubtext: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  placeActions: { flexDirection: 'row', gap: 8 },
  actionButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fb6f92', justifyContent: 'center', alignItems: 'center' },
  emergencyCard: { backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 16, padding: 20, marginTop: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)' },
  emergencyTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  emergencyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  emergencyName: { color: '#fff', fontSize: 16, fontWeight: '500' },
  callButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#22c55e', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  emergencyNumber: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
