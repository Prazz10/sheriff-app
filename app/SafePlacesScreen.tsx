import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const safePlaces = [
  { id: '1', name: 'Central Police Station', type: 'police', distance: '0.3', phone: '911' },
  { id: '2', name: 'SF General Hospital', type: 'hospital', distance: '0.5', phone: '(415) 206-8000' },
  { id: '3', name: '24/7 Convenience Store', type: 'store', distance: '0.2', phone: '(415) 555-0123' },
  { id: '4', name: 'BART Station', type: 'transport', distance: '0.1', phone: '(510) 465-2278' },
];

export default function SafePlacesScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const getTypeIcon = (type: string) => {
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
      default: return '#6b7280';
    }
  };

  const filteredPlaces = safePlaces.filter((place) => {
    const matchesType = selectedType === 'all' || place.type === selectedType;
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <LinearGradient colors={['#9333ea', '#7e22ce']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safe Places</Text>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.5)" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search places..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollContent}>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Filter by Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {[
              { value: 'all', label: 'All', icon: 'apps' },
              { value: 'police', label: 'Police', icon: 'shield' },
              { value: 'hospital', label: 'Hospital', icon: 'medkit' },
              { value: 'store', label: 'Store', icon: 'storefront' },
              { value: 'transport', label: 'Transit', icon: 'bus' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.value}
                onPress={() => setSelectedType(filter.value)}
                style={[
                  styles.filterButton,
                  selectedType === filter.value && styles.filterButtonActive,
                ]}
              >
                <Ionicons name={filter.icon as any} size={20} color="#fff" />
                <Text style={styles.filterLabel}>{filter.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>
            Nearby Places ({filteredPlaces.length})
          </Text>
          {filteredPlaces.length === 0 ? (
            <Text style={styles.emptyText}>No places found matching your search</Text>
          ) : (
            <View style={styles.placesList}>
              {filteredPlaces.map((place) => (
                <View key={place.id} style={styles.placeItem}>
                  <View style={[styles.placeIcon, { backgroundColor: getTypeColor(place.type) }]}>
                    <Ionicons name={getTypeIcon(place.type) as any} size={24} color="#fff" />
                  </View>
                  <View style={styles.placeInfo}>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <View style={styles.placeDetails}>
                      <Ionicons name="location" size={14} color="#e9d5ff" />
                      <Text style={styles.placeDistance}>{place.distance} mi away</Text>
                    </View>
                    {place.phone && (
                      <View style={styles.placeDetails}>
                        <Ionicons name="call" size={14} color="#e9d5ff" />
                        <Text style={styles.placePhone}>{place.phone}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.placeActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="navigate" size={20} color="#fff" />
                    </TouchableOpacity>
                    {place.phone && (
                      <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="call" size={20} color="#fff" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: 'rgba(126, 34, 206, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginHorizontal: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  card: {
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  filterScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  placesList: {
    gap: 16,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  placeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  placeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  placeDistance: {
    fontSize: 14,
    color: '#e9d5ff',
  },
  placePhone: {
    fontSize: 12,
    color: '#e9d5ff',
  },
  placeActions: {
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  emptyText: {
    color: '#e9d5ff',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
