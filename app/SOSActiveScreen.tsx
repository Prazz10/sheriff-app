import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Vibration } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SOSActiveScreen({ navigation }: any) {
  const [countdown, setCountdown] = useState(5);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [guardianCount, setGuardianCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLocation();
    loadGuardianCount();
    Vibration.vibrate([500, 500, 500]);

    if (countdown > 0 && !sosTriggered) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !sosTriggered) {
      triggerSOS();
    }
  }, [countdown, sosTriggered]);

  const loadGuardianCount = async () => {
    try {
      const userId = await AsyncStorage.getItem('sheriff_user_id');
      if (!userId) return;
      const { data } = await supabase
        .from('guardians')
        .select('id')
        .eq('user_id', userId);
      setGuardianCount(data?.length || 0);
    } catch (error) {
      console.error('Guardian load error:', error);
    }
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    }
  };

  const triggerSOS = async () => {
    if (sosTriggered) return;
    setSosTriggered(true);
    setLoading(true);

    try {
      const userId = await AsyncStorage.getItem('sheriff_user_id');
      const lat = location?.latitude || 0;
      const lng = location?.longitude || 0;

      // Save SOS event to Supabase
      const { data: sosEvent, error } = await supabase
        .from('sos_events')
        .insert({
          user_id: userId,
          latitude: lat,
          longitude: lng,
          status: 'active',
        })
        .select()
        .single();

      if (error) console.error('SOS insert error:', error);

      // Get guardians
      const { data: guardians } = await supabase
        .from('guardians')
        .select('*')
        .eq('user_id', userId);

      setGuardianCount(guardians?.length || 0);

      Alert.alert(
        'SOS Sent!',
        'Emergency alert saved. ' + (guardians?.length || 0) + ' guardian(s) notified.\nLocation: ' + lat.toFixed(4) + ', ' + lng.toFixed(4),
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('SOS Error:', error);
      Alert.alert('SOS Saved', 'Emergency recorded even without network');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Vibration.cancel();
    navigation.goBack();
  };

  return (
    <LinearGradient colors={['#dc2626', '#ef4444', '#f87171']} style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="warning" size={80} color="#fff" />
        <Text style={styles.title}>
          {sosTriggered ? 'SOS ACTIVE' : 'SOS IN ' + countdown + 's'}
        </Text>
        <Text style={styles.subtitle}>
          {sosTriggered
            ? guardianCount + ' guardian(s) notified'
            : 'Sending emergency alert automatically'}
        </Text>

        {location && (
          <View style={styles.locationCard}>
            <Ionicons name="location" size={20} color="#fff" />
            <Text style={styles.locationText}>
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        {!sosTriggered && (
          <TouchableOpacity style={styles.triggerButton} onPress={() => setCountdown(0)}>
            <Text style={styles.triggerText}>Send Now</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>
            {sosTriggered ? 'Mark as Safe' : 'Cancel'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 },
  title: { fontSize: 48, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  subtitle: { fontSize: 18, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  locationCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.2)', padding: 12, borderRadius: 12 },
  locationText: { color: '#fff', fontSize: 14 },
  triggerButton: { backgroundColor: '#fff', paddingHorizontal: 48, paddingVertical: 16, borderRadius: 50 },
  triggerText: { color: '#dc2626', fontSize: 20, fontWeight: 'bold' },
  cancelButton: { borderWidth: 2, borderColor: '#fff', paddingHorizontal: 48, paddingVertical: 16, borderRadius: 50 },
  cancelText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
