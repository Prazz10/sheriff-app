import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { logout } from '../lib/auth';

export default function SettingsScreen({ navigation }: any) {
  const [permissions, setPermissions] = useState({
    location: true,
    camera: true,
    microphone: true,
    sms: true,
  });

  const handlePermissionChange = (key: string, value: boolean) => {
    setPermissions({ ...permissions, [key]: value });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Welcome');
          }
        }
      ]
    );
  };

  return (
    <LinearGradient colors={['#9333ea', '#7e22ce']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>App Permissions</Text>
          {([
            { key: 'location', icon: 'location', label: 'Location', desc: 'Required for safety features' },
            { key: 'camera', icon: 'camera', label: 'Camera', desc: 'For evidence capture' },
            { key: 'microphone', icon: 'mic', label: 'Microphone', desc: 'For audio recording' },
            { key: 'sms', icon: 'chatbubble', label: 'SMS', desc: 'For emergency alerts' },
          ] as any[]).map((item) => (
            <View key={item.key} style={styles.permissionRow}>
              <Ionicons name={item.icon} size={20} color="rgba(255,255,255,0.7)" />
              <View style={styles.permissionText}>
                <Text style={styles.permissionLabel}>{item.label}</Text>
                <Text style={styles.permissionDesc}>{item.desc}</Text>
              </View>
              <Switch
                value={permissions[item.key as keyof typeof permissions]}
                onValueChange={(val) => handlePermissionChange(item.key, val)}
                trackColor={{ false: '#4a5568', true: '#c084fc' }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        <Button onPress={handleLogout} size="lg" style={styles.logoutButton}>
          <View style={styles.buttonContent}>
            <Ionicons name="log-out" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Log Out</Text>
          </View>
        </Button>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  card: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 20, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  permissionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  permissionText: { flex: 1 },
  permissionLabel: { color: '#fff', fontWeight: '600', fontSize: 16 },
  permissionDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  logoutButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#ef4444', marginBottom: 24 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
});
