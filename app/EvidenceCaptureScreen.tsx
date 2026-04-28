import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export default function EvidenceCaptureScreen({ navigation }: any) {
  const [recording, setRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<'audio' | 'video' | null>(null);
  const [evidence, setEvidence] = useState<Array<{
    id: string;
    type: 'audio' | 'video' | 'photo';
    timestamp: string;
  }>>([]);

  const handleStartRecording = (type: 'audio' | 'video') => {
    setRecording(true);
    setRecordingType(type);
  };

  const handleStopRecording = () => {
    if (recordingType) {
      const newEvidence = {
        id: Date.now().toString(),
        type: recordingType,
        timestamp: new Date().toISOString(),
      };
      setEvidence([newEvidence, ...evidence]);
    }
    setRecording(false);
    setRecordingType(null);
  };

  const handleTakePhoto = () => {
    const newEvidence = {
      id: Date.now().toString(),
      type: 'photo' as const,
      timestamp: new Date().toISOString(),
    };
    setEvidence([newEvidence, ...evidence]);
  };

  return (
    <LinearGradient colors={['#9333ea', '#7e22ce']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Evidence Capture</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContent}>
        {recording && (
          <Card style={styles.recordingCard}>
            <View style={styles.recordingHeader}>
              <View style={styles.pulseDot} />
              <View style={styles.recordingInfo}>
                <Text style={styles.recordingTitle}>Recording in Progress</Text>
                <Text style={styles.recordingSubtitle}>
                  {recordingType === 'audio' ? 'Audio' : 'Video'} is being captured
                </Text>
              </View>
              <Button
                onPress={handleStopRecording}
                size="sm"
                style={styles.stopButton}
              >
                Stop
              </Button>
            </View>
          </Card>
        )}

        {!recording && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Capture Evidence</Text>
            <View style={styles.captureGrid}>
              <TouchableOpacity
                onPress={() => handleStartRecording('video')}
                style={styles.captureButton}
              >
                <Ionicons name="videocam" size={40} color="#fff" />
                <Text style={styles.captureLabel}>Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleStartRecording('audio')}
                style={styles.captureButton}
              >
                <Ionicons name="mic" size={40} color="#fff" />
                <Text style={styles.captureLabel}>Audio</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTakePhoto}
                style={styles.captureButton}
              >
                <Ionicons name="camera" size={40} color="#fff" />
                <Text style={styles.captureLabel}>Photo</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Saved Evidence ({evidence.length})</Text>
          {evidence.length === 0 ? (
            <Text style={styles.emptyText}>No evidence captured yet</Text>
          ) : (
            <View style={styles.evidenceList}>
              {evidence.map((item) => (
                <View key={item.id} style={styles.evidenceItem}>
                  <View style={styles.evidenceIcon}>
                    <Ionicons
                      name={
                        item.type === 'photo'
                          ? 'image'
                          : item.type === 'audio'
                          ? 'mic'
                          : 'videocam'
                      }
                      size={24}
                      color="#fff"
                    />
                  </View>
                  <View style={styles.evidenceInfo}>
                    <Text style={styles.evidenceType}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Recording
                    </Text>
                    <Text style={styles.evidenceTime}>
                      {new Date(item.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Important Information</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons name="lock-closed" size={20} color="#4ade80" />
              <Text style={styles.infoText}>
                All evidence is encrypted and stored securely
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="cloud-upload" size={20} color="#4ade80" />
              <Text style={styles.infoText}>
                Automatically backed up to secure cloud storage
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark" size={20} color="#4ade80" />
              <Text style={styles.infoText}>
                Can be shared with authorities if needed
              </Text>
            </View>
          </View>
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
  recordingCard: {
    padding: 24,
    marginBottom: 24,
    backgroundColor: '#ef4444',
  },
  recordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pulseDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  recordingInfo: {
    flex: 1,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  recordingSubtitle: {
    fontSize: 14,
    color: '#fecaca',
  },
  stopButton: {
    backgroundColor: '#fff',
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
  captureGrid: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-around',
  },
  captureButton: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  captureLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  evidenceList: {
    gap: 12,
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  evidenceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  evidenceInfo: {
    flex: 1,
  },
  evidenceType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  evidenceTime: {
    fontSize: 12,
    color: '#e9d5ff',
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },
  emptyText: {
    color: '#e9d5ff',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
