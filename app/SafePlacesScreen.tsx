import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface SafePlace {
  id: string;
  name: string;
  type: string;
  distance: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
}

export default function SafePlacesScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [places, setPlaces] = useState<SafePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNearbyPlaces();
  }, []);

  const fetchNearbyPlaces = async () => {
    setLoading(true);
    setError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });

      const query = '[out:json][timeout:30];(node["amenity"="police"](around:3000,' + latitude + ',' + longitude + ');node["amenity"="hospital"](around:3000,' + latitude + ',' + longitude + ');node["amenity"="clinic"](around:3000,' + latitude + ',' + longitude + ');node["amenity"="pharmacy"](around:3000,' + latitude + ',' + longitude + ');node["shop"="convenience"](around:3000,' + latitude + ',' + longitude + ');node["highway"="bus_stop"](around:2000,' + latitude + ',' + longitude + '););out 30;';

      const response = await fetch('https://overpass.kumi.systems/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
      });

      const text = await response.text();

      // Check if response is valid JSON
      if (!text.startsWith('{') && !text.startsWith('[')) {
        throw new Error('Invalid response from server');
      }

      const data = JSON.parse(text);
      const allPlaces: SafePlace[] = [];

      data.elements?.forEach((element: any) => {
        if (!element.lat || !element.lon) return;
        const tags = element.tags || {};
        const name = tags.name;
        if (!name) return; // Skip unnamed places

        const dist = getDistance(latitude, longitude, element.lat, element.lon);
        let type = 'other';
        if (tags.amenity === 'police') type = 'police';
        else if (tags.amenity === 'hospital' || tags.amenity === 'clinic') type = 'hospital';
        else if (tags.amenity === 'pharmacy') type = 'hospital';
        else if (tags.shop === 'convenience') type = 'store';
        else if (tags.highway === 'bus_stop') type = 'transport';

        allPlaces.push({
          id: String(element.id),
          name,
          type,
          distance: dist.toFixed(1),
          address: tags['addr:street'] || tags['addr:full'] || tags.operator || 'Nearby',
          lat: element.lat,
          lng: element.lon,
          phone: tags.phone || tags['contact:phone'],
        });
      });

      allPlaces.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
      setPlaces(allPlaces.slice(0, 25));

      if (allPlaces.length === 0) {
        setError('No named places found nearby. Try refreshing.');
      }
    } catch (err: any) {
      console.error('SafePlaces error:', err.message);
      setError('Could not load places. Check internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

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

  const handleNavigate = (place: SafePlace) => {
    Linking.openURL('https://www.google.com/maps/dir/?api=1&destination=' + place.lat + ',' + place.lng);
  };

  const filteredPlaces = places.filter(place => {
    const matchesType = selectedType === 'all' || place.type === selectedType;
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <LinearGradient colors={['#ffe5ec', '#ffb3c6', '#fb6f92']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safe Places</Text>
          <TouchableOpacity onPress={fetchNearbyPlaces}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
          <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search places..." placeholderTextColor="rgba(255,255,255,0.5)" style={styles.searchInput} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {[
          { value: 'all', label: 'All', icon: 'apps' },
          { value: 'police', label: 'Police', icon: 'shield' },
          { value: 'hospital', label: 'Hospital', icon: 'medkit' },
          { value: 'store', label: 'Store', icon: 'storefront' },
          { value: 'transport', label: 'Transit', icon: 'bus' },
        ].map(filter => (
          <TouchableOpacity key={filter.value} onPress={() => setSelectedType(filter.value)} style={[styles.filterButton, selectedType === filter.value && styles.filterButtonActive]}>
            <Ionicons name={filter.icon as any} size={14} color="#fff" />
            <Text style={styles.filterLabel}>{filter.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Finding nearby safe places...</Text>
          <Text style={styles.loadingSubtext}>Using your GPS location</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="warning-outline" size={48} color="rgba(255,255,255,0.7)" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchNearbyPlaces} style={styles.retryButton}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.resultsCount}>{filteredPlaces.length} places found near you</Text>
          {filteredPlaces.map(place => (
            <View key={place.id} style={styles.placeCard}>
              <View style={[styles.placeIcon, { backgroundColor: getTypeColor(place.type) }]}>
                <Ionicons name={getTypeIcon(place.type)} size={22} color="#fff" />
              </View>
              <View style={styles.placeInfo}>
                <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
                <Text style={styles.placeAddress} numberOfLines={1}>{place.address}</Text>
                <Text style={styles.placeDistance}>{place.distance} km away</Text>
              </View>
              <View style={styles.placeActions}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleNavigate(place)}>
                  <Ionicons name="navigate" size={18} color="#fff" />
                </TouchableOpacity>
                {place.phone && (
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#22c55e' }]} onPress={() => Linking.openURL('tel:' + place.phone)}>
                    <Ionicons name="call" size={18} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 12, backgroundColor: 'rgba(251,111,146,0.3)' },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, marginHorizontal: 24, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  searchInput: { flex: 1, color: '#fff', fontSize: 16 },
  filterRow: { paddingHorizontal: 24, paddingVertical: 12, maxHeight: 56 },
  filterButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  filterButtonActive: { backgroundColor: '#fb6f92', borderWidth: 1.5, borderColor: '#fff' },
  filterLabel: { color: '#fff', fontSize: 13, fontWeight: '500' },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  loadingText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  loadingSubtext: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  errorText: { color: '#fff', fontSize: 16, textAlign: 'center' },
  retryButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  resultsCount: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 16 },
  placeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 14, marginBottom: 12, gap: 12 },
  placeIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 3 },
  placeAddress: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  placeDistance: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  placeActions: { gap: 8 },
  actionButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fb6f92', justifyContent: 'center', alignItems: 'center' },
});
