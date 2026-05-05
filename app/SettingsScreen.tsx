import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { logout } from '../lib/auth';

export default function SettingsScreen({ navigation, route }: any) {
  const userName = route.params?.userName || 'Demo User';
  const userEmail = route.params?.userEmail || 'user@email.com';

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
    <LinearGradient colors={['#7c3aed', '#9333ea']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color="rgba(255,255,255,0.8)" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileEmail}>{userEmail}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="shield-outline" size={20} color="#fff" />
            <Text style={styles.cardTitle}>App Permissions</Text>
          </View>
          {([
            { key: 'location', icon: 'location-outline', label: 'Location', desc: 'Required for safety features' },
            { key: 'camera', icon: 'camera-outline', label: 'Camera', desc: 'For evidence capture' },
            { key: 'microphone', icon: 'mic-outline', label: 'Microphone', desc: 'For audio recording' },
            { key: 'sms', icon: 'chatbubble-outline', label: 'SMS', desc: 'For emergency alerts' },
          ] as any[]).map((item, index, arr) => (
            <View key={item.key}>
              <View style={styles.permissionRow}>
                <Ionicons name={item.icon} size={20} color="rgba(255,255,255,0.7)" />
                <View style={styles.permissionText}>
                  <Text style={styles.permissionLabel}>{item.label}</Text>
                  <Text style={styles.permissionDesc}>{item.desc}</Text>
                </View>
                <Switch
                  value={permissions[item.key as keyof typeof permissions]}
                  onValueChange={(val) => handlePermissionChange(item.key, val)}
                  trackColor={{ false: '#4a5568', true: '#a855f7' }}
                  thumbColor="#fff"
                />
              </View>
              {index < arr.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  profileEmail: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  editProfileButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
  },
  editProfileText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  permissionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  permissionText: { flex: 1 },
  permissionLabel: { color: '#fff', fontWeight: '600', fontSize: 16 },
  permissionDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
});
