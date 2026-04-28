import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { getUser, saveUser, type Guardian, type User } from '../lib/auth';

export default function GuardiansScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuardian, setNewGuardian] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
  });

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await getUser();
    setUser(userData);
    setGuardians(userData?.guardians || []);
  };

  const handleAddGuardian = async () => {
    if (!newGuardian.name || !newGuardian.phone) return;

    const guardian: Guardian = {
      id: 'guardian_' + Date.now(),
      ...newGuardian,
    };

    const updatedGuardians = [...guardians, guardian];
    setGuardians(updatedGuardians);

    if (user) {
      user.guardians = updatedGuardians;
      await saveUser(user);
    }

    setNewGuardian({ name: '', phone: '', email: '', relationship: '' });
    setShowAddForm(false);
  };

  const handleRemoveGuardian = async (id: string) => {
    const updatedGuardians = guardians.filter((g) => g.id !== id);
    setGuardians(updatedGuardians);

    if (user) {
      user.guardians = updatedGuardians;
      await saveUser(user);
    }
  };

  return (
    <LinearGradient colors={['#9333ea', '#7e22ce']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency Contacts</Text>
          <TouchableOpacity onPress={() => setShowAddForm(!showAddForm)}>
            <View style={styles.addButton}>
              <Ionicons name="add" size={16} color="#9333ea" />
              <Text style={styles.addButtonText}>Add</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContent}>
        <Text style={styles.title}>Your Safety Network</Text>
        <Text style={styles.subtitle}>
          These trusted contacts will be notified during emergencies
        </Text>

        {showAddForm && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Add Emergency Contact</Text>
            <Input
              label="Full Name *"
              value={newGuardian.name}
              onChangeText={(text) => setNewGuardian({ ...newGuardian, name: text })}
              placeholder="Enter name"
            />
            <Input
              label="Phone Number *"
              value={newGuardian.phone}
              onChangeText={(text) => setNewGuardian({ ...newGuardian, phone: text })}
              placeholder="+1 234 567 8900"
              keyboardType="phone-pad"
            />
            <Input
              label="Email (Optional)"
              value={newGuardian.email}
              onChangeText={(text) => setNewGuardian({ ...newGuardian, email: text })}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Relationship (Optional)"
              value={newGuardian.relationship}
              onChangeText={(text) => setNewGuardian({ ...newGuardian, relationship: text })}
              placeholder="e.g., Mother, Friend"
            />
            <View style={styles.formActions}>
              <Button onPress={handleAddGuardian} style={styles.saveButton}>
                Add Guardian
              </Button>
              <Button
                onPress={() => setShowAddForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </View>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>
            Guardians ({guardians.length})
          </Text>
          {guardians.length === 0 ? (
            <Text style={styles.emptyText}>No emergency contacts added yet</Text>
          ) : (
            <View style={styles.guardiansList}>
              {guardians.map((guardian) => (
                <View key={guardian.id} style={styles.guardianItem}>
                  <View style={styles.guardianInfo}>
                    <Text style={styles.guardianName}>{guardian.name}</Text>
                    <Text style={styles.guardianPhone}>{guardian.phone}</Text>
                    {guardian.relationship && (
                      <Text style={styles.guardianRelationship}>{guardian.relationship}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveGuardian(guardian.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                  </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginLeft: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#9333ea',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e9d5ff',
    marginBottom: 24,
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
  formActions: {
    gap: 12,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#fff',
  },
  guardiansList: {
    gap: 12,
  },
  guardianItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  guardianInfo: {
    flex: 1,
  },
  guardianName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  guardianPhone: {
    fontSize: 14,
    color: '#e9d5ff',
    marginBottom: 2,
  },
  guardianRelationship: {
    fontSize: 12,
    color: '#c084fc',
  },
  removeButton: {
    padding: 8,
  },
  emptyText: {
    color: '#e9d5ff',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
