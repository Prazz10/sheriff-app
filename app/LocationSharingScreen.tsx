import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Checkbox } from '../components/Checkbox';
import { getUser, type User } from '../lib/auth';

export default function LocationSharingScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [selectedGuardians, setSelectedGuardians] = useState<string[]>([]);
  const [duration, setDuration] = useState<number | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await getUser();
    setUser(userData);
  };

  const handleToggleGuardian = (guardianId: string) => {
    setSelectedGuardians((prev) =>
      prev.includes(guardianId)
        ? prev.filter((id) => id !== guardianId)
        : [...prev, guardianId]
    );
  };

  const handleStartSharing = () => {
    if (selectedGuardians.length === 0 || !duration) {
      return;
    }
    setIsSharing(true);
  };

  const handleStopSharing = () => {
    setIsSharing(false);
    navigation.navigate('Dashboard');
  };

  const handleExtendTime = () => {
    const newDuration = duration === 60 ? 120 : 60;
    setDuration(newDuration);
  };

  if (isSharing) {
    const selectedGuardiansList = user?.guardians.filter((g) =>
      selectedGuardians.includes(g.id)
    );

    return (
      <LinearGradient colors={['#9333ea', '#7e22ce']} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.pulseDot} />
            <Text style={styles.headerTitle}>Location Sharing Active</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollContent}>
          <Card style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <Ionicons name="location" size={40} color="#fff" />
            </View>
            <Text style={styles.statusTitle}>Sharing Location</Text>
            <Text style={styles.statusSubtitle}>Your guardians can see your live location</Text>
          </Card>

          <Card style={styles.card}>
            <View style={styles.timeHeader}>
              <Ionicons name="time" size={24} color="#fff" />
              <View style={styles.timeText}>
                <Text style={styles.timeLabel}>Time Remaining</Text>
                <Text style={styles.timeValue}>{duration} min</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.card}>
            <View style={styles.sharingHeader}>
              <Ionicons name="people" size={20} color="#fff" />
              <Text style={styles.cardTitle}>Sharing With</Text>
            </View>
            {selectedGuardiansList?.map((guardian) => (
              <View key={guardian.id} style={styles.guardianItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                <View style={styles.guardianInfo}>
                  <Text style={styles.guardianName}>{guardian.name}</Text>
                  <Text style={styles.guardianPhone}>{guardian.phone}</Text>
                </View>
              </View>
            ))}
          </Card>

          <Card style={styles.card}>
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={20} color="#fff" />
              <View style={styles.locationText}>
                <Text style={styles.locationLabel}>Current Location</Text>
                <Text style={styles.locationValue}>Market Street, San Francisco, CA</Text>
                <Text style={styles.locationTime}>Updated just now</Text>
              </View>
            </View>
          </Card>

          <View style={styles.actions}>
            <Button
              onPress={handleExtendTime}
              variant="outline"
              size="lg"
            >
              <View style={styles.buttonContent}>
                <Ionicons name="time" size={20} color="#fff" />
                <Text style={styles.extendText}>Extend Time</Text>
              </View>
            </Button>
            <Button
              onPress={handleStopSharing}
              size="lg"
              style={styles.stopButton}
            >
              Stop Sharing
            </Button>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#9333ea', '#7e22ce']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share Live Location</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContent}>
        <Text style={styles.title}>Share Your Location</Text>
        <Text style={styles.subtitle}>Let your guardians know where you are in real-time</Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Select Guardians</Text>
          {user && user.guardians.length > 0 ? (
            <View style={styles.guardiansList}>
              {user.guardians.map((guardian) => (
                <TouchableOpacity
                  key={guardian.id}
                  onPress={() => handleToggleGuardian(guardian.id)}
                  style={styles.guardianSelectItem}
                >
                  <Checkbox
                    checked={selectedGuardians.includes(guardian.id)}
                    onCheckedChange={() => handleToggleGuardian(guardian.id)}
                  />
                  <View style={styles.guardianSelectInfo}>
                    <Text style={styles.guardianSelectName}>{guardian.name}</Text>
                    <Text style={styles.guardianSelectPhone}>{guardian.phone}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noGuardians}>
              <Text style={styles.noGuardiansText}>No emergency contacts added yet</Text>
              <Button
                onPress={() => navigation.navigate('Guardians')}
                variant="outline"
                style={styles.addButton}
              >
                Add Guardians
              </Button>
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Duration</Text>
          <View style={styles.durationGrid}>
            {[15, 30, 60, 120, 180, 240].map((mins) => (
              <TouchableOpacity
                key={mins}
                onPress={() => setDuration(mins)}
                style={[
                  styles.durationButton,
                  duration === mins && styles.durationButtonActive,
                ]}
              >
                <Text style={[
                  styles.durationValue,
                  duration === mins && styles.durationValueActive,
                ]}>
                  {mins}
                </Text>
                <Text style={[
                  styles.durationLabel,
                  duration === mins && styles.durationLabelActive,
                ]}>
                  min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>What Guardians Will See</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Real-time location updates</Text>
                <Text style={styles.featureDesc}>Continuous GPS tracking</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Movement history</Text>
                <Text style={styles.featureDesc}>See where you've been</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Battery status</Text>
                <Text style={styles.featureDesc}>They'll know when to call</Text>
              </View>
            </View>
          </View>
        </Card>

        <Button
          onPress={handleStartSharing}
          size="lg"
          style={styles.shareButton}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="share-social" size={20} color="#9333ea" />
            <Text style={styles.shareText}>Start Sharing Location</Text>
          </View>
        </Button>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ade80',
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
  statusCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 16,
    color: '#e9d5ff',
    textAlign: 'center',
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeText: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#e9d5ff',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  sharingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  guardianItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 8,
  },
  guardianInfo: {
    flex: 1,
  },
  guardianName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  guardianPhone: {
    fontSize: 12,
    color: '#e9d5ff',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  locationText: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 14,
    color: '#e9d5ff',
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  locationTime: {
    fontSize: 12,
    color: '#e9d5ff',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  extendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  guardiansList: {
    gap: 12,
  },
  guardianSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  guardianSelectInfo: {
    flex: 1,
  },
  guardianSelectName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  guardianSelectPhone: {
    fontSize: 14,
    color: '#e9d5ff',
  },
  noGuardians: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noGuardiansText: {
    color: '#e9d5ff',
    marginBottom: 16,
  },
  addButton: {
    borderColor: '#fff',
    borderWidth: 1,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  durationButton: {
    width: '30%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  durationButtonActive: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  durationValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e9d5ff',
  },
  durationValueActive: {
    color: '#fff',
  },
  durationLabel: {
    fontSize: 12,
    color: '#e9d5ff',
  },
  durationLabelActive: {
    color: '#fff',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: '#e9d5ff',
  },
  shareButton: {
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  shareText: {
    color: '#9333ea',
    fontSize: 16,
    fontWeight: '600',
  },
});
