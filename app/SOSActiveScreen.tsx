import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Vibration, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { supabase } from '../lib/supabase';

export default function SOSActiveScreen({ navigation }: any) {
  const [countdown, setCountdown] = useState(5);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [location, setLocation] = useState<any>(null);
  const [guardianCount, setGuardianCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const triggeredRef = useRef(false);

  useEffect(() => {
    getLocation();
    loadGuardianCount();
    Vibration.vibrate([500, 500, 500]);
  }, []);

  useEffect(() => {
    if (countdown > 0 && !sosTriggered) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !sosTriggered) {
      triggerSOS();
    }
  }, [countdown, sosTriggered]);

  const loadGuardianCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('guardians').select('id').eq('user_id', user.id);
      setGuardianCount(data?.length || 0);
    } catch (error) {}
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          setLocation(loc.coords);
        } catch {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setLocation(loc.coords);
        }
      }
    } catch (error) {}
  };

  const ensureUserExists = async (user: any) => {
    await supabase.from('users').upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name || 'User',
      email: user.email || '',
      phone: user.phone || '',
    }, { onConflict: 'id' });
  };

  const triggerSOS = async () => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    setSosTriggered(true);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      await ensureUserExists(user);

      const lat = location?.latitude || 0;
      const lng = location?.longitude || 0;

      // Save SOS to database
      await supabase.from('sos_events').insert({
        user_id: user.id,
        latitude: lat,
        longitude: lng,
        status: 'active',
      });

      // Get guardians
      const { data: guardians } = await supabase
        .from('guardians')
        .select('*')
        .eq('user_id', user.id);

      const count = guardians?.length || 0;
      setGuardianCount(count);

      const userName = user.user_metadata?.full_name || 'SheRiff User';
      const mapsLink = lat !== 0
        ? 'https://maps.google.com/?q=' + lat + ',' + lng
        : 'Location unavailable';
      const message = 'EMERGENCY SOS from SheRiff!\n' +
        userName + ' needs immediate help!\n' +
        'Location: ' + mapsLink + '\n' +
        'Time: ' + new Date().toLocaleString();

      if (count > 0 && guardians) {
        const phones = guardians.map((g: any) => g.guardian_phone);

        // Try SMS first (works directly from user's phone)
        const smsAvailable = await SMS.isAvailableAsync();
        if (smsAvailable) {
          await SMS.sendSMSAsync(phones, message);
        } else {
          // Fallback to WhatsApp
          for (const g of guardians) {
            let phone = g.guardian_phone.replace(/[^0-9]/g, '');
            if (phone.length === 10) phone = '91' + phone;
            Linking.openURL('https://wa.me/' + phone + '?text=' + encodeURIComponent(message));
          }
        }
      }

      Alert.alert(
        'SOS Triggered!',
        count > 0
          ? 'Emergency alert sent to ' + count + ' guardian(s)!\n' +
            (lat !== 0 ? 'Location: ' + lat.toFixed(4) + ', ' + lng.toFixed(4) : 'Location pending')
          : 'SOS saved! Add guardians to send alerts.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('SOS Saved', 'Emergency recorded. ' + (error.message || ''));
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
            <View>
              <Text style={styles.locationText}>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://maps.google.com/?q=' + location.latitude + ',' + location.longitude)}>
                <Text style={styles.locationLink}>View on Maps</Text>
              </TouchableOpacity>
            </View>
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
  locationCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(255,255,255,0.2)', padding: 16, borderRadius: 12 },
  locationText: { color: '#fff', fontSize: 14 },
  locationLink: { color: '#fde68a', fontSize: 13, textDecorationLine: 'underline', marginTop: 4 },
  triggerButton: { backgroundColor: '#fff', paddingHorizontal: 48, paddingVertical: 16, borderRadius: 50 },
  triggerText: { color: '#dc2626', fontSize: 20, fontWeight: 'bold' },
  cancelButton: { borderWidth: 2, borderColor: '#fff', paddingHorizontal: 48, paddingVertical: 16, borderRadius: 50 },
  cancelText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
