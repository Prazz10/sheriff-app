import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Guardian {
  name: string;
  phone: string;
  relationship: string;
}

export default function ProfileSetupScreen({ navigation }: any) {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [permissions, setPermissions] = useState({
    location: true,
    camera: true,
    microphone: true,
    sms: true,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newGuardian, setNewGuardian] = useState({ name: '', phone: '', relationship: '' });

  const handleAddGuardian = () => {
    if (!newGuardian.name || !newGuardian.phone) {
      Alert.alert('Error', 'Please enter name and phone number');
      return;
    }
    setGuardians([...guardians, { ...newGuardian }]);
    setNewGuardian({ name: '', phone: '', relationship: '' });
    setModalVisible(false);
  };

  const handleRemoveGuardian = (index: number) => {
    setGuardians(guardians.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    if (guardians.length === 0) {
      Alert.alert('Error', 'Please add at least one emergency contact');
      return;
    }
    if (!permissions.location) {
      Alert.alert('Error', 'Location permission is required');
      return;
    }

    setLoading(true);
    try {
      // Always get user directly from Supabase auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        Alert.alert('Session expired', 'Please login again');
        navigation.navigate('Login');
        return;
      }

      const userId = user.id;
      const userName = user.user_metadata?.full_name || 'User';
      const userEmail = user.email || '';

      // Save to AsyncStorage
      await AsyncStorage.setItem('sheriff_user_id', userId);
      await AsyncStorage.setItem('sheriff_user_name', userName);
      await AsyncStorage.setItem('sheriff_user_email', userEmail);

      // Step 1 � Insert user into users table FIRST
      const { error: userError } = await supabase.from('users').upsert({
        id: userId,
        full_name: userName,
        email: userEmail,
        phone: user.phone || '',
      }, { onConflict: 'id' });

      if (userError) {
        console.log('User upsert error:', userError.message);
      }

      // Step 2 � Insert guardians after user exists
      let savedCount = 0;
      for (const guardian of guardians) {
        const { error: guardianError } = await supabase.from('guardians').insert({
          user_id: userId,
          guardian_name: guardian.name,
          guardian_phone: guardian.phone,
          relationship: guardian.relationship || 'Contact',
        });

        if (guardianError) {
          console.error('Guardian insert error:', guardianError.message);
        } else {
          savedCount++;
        }
      }

      Alert.alert(
        'Setup Complete!',
        savedCount + ' guardian(s) added successfully!',
        [{ text: 'Continue', onPress: () => navigation.navigate('Dashboard') }]
      );
    } catch (error: any) {
      console.error('Setup error:', error.message);
      Alert.alert('Error', error.message || 'Could not complete setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#ffe5ec', '#ffb3c6', '#fb6f92']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Complete Your{'\n'}Profile</Text>
        <Text style={styles.subtitle}>Set up your safety network</Text>

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
                onValueChange={(val) => setPermissions({ ...permissions, [item.key]: val })}
                trackColor={{ false: 'rgba(255,255,255,0.3)', true: '#fb6f92' }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Emergency Contacts</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {guardians.length === 0 ? (
            <View style={styles.emptyGuardians}>
              <Ionicons name="people-outline" size={32} color="rgba(255,255,255,0.5)" />
              <Text style={styles.emptyText}>Add at least one emergency contact</Text>
              <Text style={styles.emptySubtext}>They will receive SOS alerts</Text>
            </View>
          ) : (
            guardians.map((g, index) => (
              <View key={index} style={styles.guardianRow}>
                <View style={styles.guardianAvatar}>
                  <Ionicons name="person" size={20} color="#fff" />
                </View>
                <View style={styles.guardianInfo}>
                  <Text style={styles.guardianName}>{g.name}</Text>
                  <Text style={styles.guardianPhone}>{g.phone}</Text>
                  <Text style={styles.guardianRel}>{g.relationship}</Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveGuardian(index)} style={styles.removeButton}>
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <Button onPress={handleComplete} size="lg" style={styles.completeButton} loading={loading}>
          Complete Setup
        </Button>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Emergency Contact</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Full Name *"
              placeholderTextColor="#999"
              value={newGuardian.name}
              onChangeText={(t) => setNewGuardian({ ...newGuardian, name: t })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="+91XXXXXXXXXX *"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={newGuardian.phone}
              onChangeText={(t) => setNewGuardian({ ...newGuardian, phone: t })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Relationship (friend, family...)"
              placeholderTextColor="#999"
              value={newGuardian.relationship}
              onChangeText={(t) => setNewGuardian({ ...newGuardian, relationship: t })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAdd} onPress={handleAddGuardian}>
                <Text style={styles.modalAddText}>Add Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 32 },
  card: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 20, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  permissionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  permissionText: { flex: 1 },
  permissionLabel: { color: '#fff', fontWeight: '600', fontSize: 16 },
  permissionDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  emptyGuardians: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  emptySubtext: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  guardianRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12, marginBottom: 8, gap: 12 },
  guardianAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  guardianInfo: { flex: 1 },
  guardianName: { color: '#fff', fontWeight: '600', fontSize: 16 },
  guardianPhone: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  guardianRel: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  removeButton: { backgroundColor: '#ef4444', borderRadius: 20, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  completeButton: { marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20 },
  modalInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 16, color: '#1a1a1a' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancel: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  modalCancelText: { color: '#6b7280', fontWeight: '600' },
  modalAdd: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#fb6f92', alignItems: 'center' },
  modalAddText: { color: '#fff', fontWeight: '600' },
});
