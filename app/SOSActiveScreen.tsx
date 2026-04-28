import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { getUser, type User } from '../lib/auth';

export default function SOSActiveScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [sosActive, setSosActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    loadUser();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!sosActive) {
      activateSOS();
    }
  }, [countdown, sosActive]);

  const loadUser = async () => {
    const userData = await getUser();
    setUser(userData);
  };

  const activateSOS = () => {
    setSosActive(true);
    setRecording(true);
  };

  const handleCancel = () => {
    if (!sosActive) {
      setCountdown(0);
      navigation.navigate('Dashboard');
    }
  };

  const handleDeactivate = () => {
    setSosActive(false);
    setRecording(false);
    navigation.navigate('Dashboard');
  };

  const handleCallGuardian = (guardian: any) => {
    // Linking.openURL(`tel:${guardian.phone}`);
  };

  if (!sosActive && countdown > 0) {
    return (
      <View style={styles.countdownContainer}>
        <View style={styles.countdownContent}>
          <Animated.View style={[styles.countdownCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.countdownNumber}>{countdown}</Text>
          </Animated.View>
          <Text style={styles.countdownTitle}>Activating SOS</Text>
          <Text style={styles.countdownSubtitle}>Emergency alert will be sent</Text>
        </View>

        <Button
          onPress={handleCancel}
          variant="outline"
          size="lg"
          style={styles.cancelButton}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="close" size={20} color="#fff" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </View>
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.pulseDot} />
            <Text style={styles.headerTitle}>EMERGENCY ACTIVE</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContent}>
        <Card style={styles.statusCard}>
          <Ionicons name="alert-circle" size={64} color="#fff" style={styles.statusIcon} />
          <Text style={styles.statusTitle}>SOS Activated</Text>
          <Text style={styles.statusSubtitle}>Help is on the way. Stay calm and safe.</Text>
        </Card>

        <Card style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Emergency Actions</Text>

          <View style={styles.actionItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Location Shared</Text>
              <Text style={styles.actionSubtitle}>All guardians can see your location</Text>
            </View>
          </View>

          <View style={styles.actionItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Emergency Contacts Notified</Text>
              <Text style={styles.actionSubtitle}>{user?.guardians.length || 0} contacts alerted</Text>
            </View>
          </View>

          <View style={styles.actionItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Calling Emergency Contact</Text>
              <Text style={styles.actionSubtitle}>Calling {user?.guardians[0]?.name || 'Guardian'}</Text>
            </View>
          </View>

          {recording && (
            <View style={styles.actionItem}>
              <View style={styles.recordingDot} />
              <View style={styles.actionText}>
                <Text style={styles.actionTitle}>Recording Evidence</Text>
                <Text style={styles.actionSubtitle}>Audio/Video being captured</Text>
              </View>
            </View>
          )}
        </Card>

        {user && user.guardians.length > 0 && (
          <Card style={styles.guardiansCard}>
            <Text style={styles.cardTitle}>Guardians Notified</Text>
            <View style={styles.guardiansList}>
              {user.guardians.map((guardian) => (
                <View key={guardian.id} style={styles.guardianItem}>
                  <View style={styles.guardianInfo}>
                    <Text style={styles.guardianName}>{guardian.name}</Text>
                    <Text style={styles.guardianPhone}>{guardian.phone}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleCallGuardian(guardian)}
                    style={styles.callButton}
                  >
                    <Ionicons name="call" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </Card>
        )}

        <Card style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={20} color="#fff" />
            <Text style={styles.locationTitle}>Current Location</Text>
          </View>
          <Text style={styles.locationText}>Your location is being shared in real-time</Text>
        </Card>

        <Button
          onPress={handleDeactivate}
          size="lg"
          variant="outline"
          style={styles.deactivateButton}
        >
          I'm Safe - Deactivate SOS
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  countdownContainer: {
    flex: 1,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  countdownContent: {
    alignItems: 'center',
    marginBottom: 48,
  },
  countdownCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  countdownNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  countdownTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  countdownSubtitle: {
    fontSize: 20,
    color: '#fecaca',
  },
  cancelButton: {
    borderColor: '#fff',
    borderWidth: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#dc2626',
  },
  header: {
    backgroundColor: 'rgba(185, 28, 28, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(220, 38, 38, 0.5)',
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerContent: {
    paddingHorizontal: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  statusCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  statusIcon: {
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
    color: '#fecaca',
    textAlign: 'center',
  },
  actionsCard: {
    padding: 24,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#fecaca',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f87171',
    marginTop: 4,
  },
  guardiansCard: {
    padding: 24,
    marginBottom: 24,
  },
  guardiansList: {
    gap: 8,
  },
  guardianItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
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
    fontSize: 14,
    color: '#fecaca',
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  locationCard: {
    padding: 16,
    marginBottom: 24,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  locationText: {
    fontSize: 14,
    color: '#fecaca',
  },
  deactivateButton: {
    marginBottom: 24,
    borderColor: '#fff',
    borderWidth: 2,
  },
});
