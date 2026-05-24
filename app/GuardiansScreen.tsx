import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { api } from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Guardian {
  id?: string;
  guardian_name: string;
  guardian_phone: string;
  relationship: string;
}

export default function GuardiansScreen({ navigation }: any) {
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newGuardian, setNewGuardian] = useState({ name: '', phone: '', relationship: '' });

  useEffect(() => {
    loadGuardians();
  }, []);

  const loadGuardians = async () => {
    try {
      const userId = await AsyncStorage.getItem('sheriff_user_id');
      if (!userId) return;
      const result = await api.getProfile(userId);
      if (result.guardians) setGuardians(result.guardians);
    } catch (error) {
      console.error('Load guardians error:', error);
    }
  };

  const handleAddGuardian = async () => {
    if (!newGuardian.name || !newGuardian.phone) {
      Alert.alert('Error', 'Please enter name and phone number');
      return;
    }
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('sheriff_user_id');
      const result = await api.addGuardian({
        userId: userId || '',
        name: newGuardian.name,
        phone: newGuardian.phone,
        relationship: newGuardian.relationship,
      });
      if (result.error) throw new Error(result.error);
      setGuardians([...guardians, result.guardian]);
      setNewGuardian({ name: '', phone: '', relationship: '' });
      setModalVisible(false);
      Alert.alert('Success', 'Guardian added successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add guardian');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#ffe5ec', '#ffb3c6', '#fb6f92']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Guardians</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {guardians.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="rgba(255,255,255,0.5)" />
            <Text style={styles.emptyTitle}>No Guardians Yet</Text>
            <Text style={styles.emptySubtitle}>Add trusted contacts who will receive your SOS alerts</Text>
            <Button onPress={() => setModalVisible(true)} size="lg" style={styles.addFirstButton}>
              Add First Guardian
            </Button>
          </View>
        ) : (
          guardians.map((g, index) => (
            <View key={index} style={styles.guardianCard}>
              <View style={styles.guardianAvatar}>
                <Ionicons name="person" size={24} color="#fff" />
              </View>
              <View style={styles.guardianInfo}>
                <Text style={styles.guardianName}>{g.guardian_name}</Text>
                <Text style={styles.guardianPhone}>{g.guardian_phone}</Text>
                <Text style={styles.guardianRel}>{g.relationship}</Text>
              </View>
              <View style={styles.guardianStatus}>
                <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Guardian</Text>
            <TextInput style={styles.modalInput} placeholder="Full Name" placeholderTextColor="#999" value={newGuardian.name} onChangeText={(t) => setNewGuardian({ ...newGuardian, name: t })} />
            <TextInput style={styles.modalInput} placeholder="+91XXXXXXXXXX" placeholderTextColor="#999" keyboardType="phone-pad" value={newGuardian.phone} onChangeText={(t) => setNewGuardian({ ...newGuardian, phone: t })} />
            <TextInput style={styles.modalInput} placeholder="Relationship (friend, family...)" placeholderTextColor="#999" value={newGuardian.relationship} onChangeText={(t) => setNewGuardian({ ...newGuardian, relationship: t })} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAdd} onPress={handleAddGuardian}>
                <Text style={styles.modalAddText}>{loading ? 'Adding...' : 'Add'}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  scrollContent: { padding: 24 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 16 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  emptySubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  addFirstButton: { marginTop: 16 },
  guardianCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16, marginBottom: 12, gap: 16 },
  guardianAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  guardianInfo: { flex: 1 },
  guardianName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  guardianPhone: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  guardianRel: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  guardianStatus: { alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20 },
  modalInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 16, color: '#1a1a1a' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancel: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  modalCancelText: { color: '#6b7280', fontWeight: '600' },
  modalAdd: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#9333ea', alignItems: 'center' },
  modalAddText: { color: '#fff', fontWeight: '600' },
});
