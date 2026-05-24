import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraType } from 'expo-camera';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export default function EvidenceCaptureScreen({ navigation }: any) {
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [audioPermission, setAudioPermission] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const requestPermissions = async () => {
    const { status: audioStatus } = await Audio.requestPermissionsAsync();
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    setAudioPermission(audioStatus === 'granted');
    setCameraPermission(cameraStatus === 'granted');
    return audioStatus === 'granted' && cameraStatus === 'granted';
  };

  const startAudioRecording = async () => {
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert('Permission needed', 'Microphone permission is required');
      return;
    }
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecordingAudio(true);
      Alert.alert('Recording Started', 'Audio recording is now active');
    } catch (error) {
      Alert.alert('Error', 'Could not start recording');
    }
  };

  const stopAudioRecording = async () => {
    try {
      if (!recordingRef.current) return;
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      setIsRecordingAudio(false);
      recordingRef.current = null;
      if (uri) {
        const newRecording = {
          id: Date.now().toString(),
          type: 'audio',
          uri,
          timestamp: new Date().toLocaleString(),
          name: 'Audio_' + Date.now() + '.m4a',
        };
        setRecordings(prev => [newRecording, ...prev]);
        Alert.alert('Saved!', 'Audio recording saved successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not stop recording');
    }
  };

  const takePhoto = async () => {
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert('Permission needed', 'Camera permission is required');
      return;
    }
    Alert.alert('Photo Capture', 'Camera integration ready. Full camera UI coming in next update.');
  };

  const playRecording = async (uri: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      Alert.alert('Error', 'Could not play recording');
    }
  };

  const deleteRecording = (id: string) => {
    Alert.alert('Delete', 'Delete this recording?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setRecordings(prev => prev.filter(r => r.id !== id))
      }
    ]);
  };

  return (
    <LinearGradient colors={['#ffe5ec', '#ffb3c6', '#fb6f92']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evidence Capture</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.warning}>
          All recordings are stored securely on your device
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Audio Recording</Text>
          <Text style={styles.cardDesc}>Record audio evidence during emergencies</Text>
          <TouchableOpacity
            style={[styles.recordButton, isRecordingAudio && styles.recordingActive]}
            onPress={isRecordingAudio ? stopAudioRecording : startAudioRecording}
          >
            <Ionicons name={isRecordingAudio ? 'stop-circle' : 'mic'} size={32} color="#fff" />
            <Text style={styles.recordButtonText}>
              {isRecordingAudio ? 'Stop Recording' : 'Start Audio Recording'}
            </Text>
          </TouchableOpacity>
          {isRecordingAudio && (
            <View style={styles.recordingIndicator}>
              <View style={styles.pulseDot} />
              <Text style={styles.recordingText}>Recording in progress...</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Photo Capture</Text>
          <Text style={styles.cardDesc}>Take photos of evidence</Text>
          <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
            <Ionicons name="camera" size={32} color="#fff" />
            <Text style={styles.recordButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        {recordings.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Saved Recordings ({recordings.length})</Text>
            {recordings.map(recording => (
              <View key={recording.id} style={styles.recordingItem}>
                <Ionicons
                  name={recording.type === 'audio' ? 'mic' : 'camera'}
                  size={20} color="#fff"
                />
                <View style={styles.recordingInfo}>
                  <Text style={styles.recordingName}>{recording.name}</Text>
                  <Text style={styles.recordingTime}>{recording.timestamp}</Text>
                </View>
                <View style={styles.recordingActions}>
                  {recording.type === 'audio' && (
                    <TouchableOpacity onPress={() => playRecording(recording.uri)} style={styles.actionBtn}>
                      <Ionicons name="play" size={18} color="#fff" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => deleteRecording(recording.id)} style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}>
                    <Ionicons name="trash" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#fff" />
          <Text style={styles.infoText}>
            Evidence is stored locally on your device. You can share it with authorities when needed.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  warning: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 12, color: '#fff', fontSize: 14, textAlign: 'center', marginBottom: 20 },
  card: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  cardDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  recordButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#fb6f92', borderRadius: 12, padding: 16 },
  recordingActive: { backgroundColor: '#ef4444' },
  photoButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#7c3aed', borderRadius: 12, padding: 16 },
  recordButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  recordingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  pulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' },
  recordingText: { color: '#fff', fontSize: 14 },
  recordingItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, marginBottom: 8 },
  recordingInfo: { flex: 1 },
  recordingName: { color: '#fff', fontWeight: '600', fontSize: 14 },
  recordingTime: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  recordingActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center' },
  infoCard: { flexDirection: 'row', gap: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 16 },
  infoText: { flex: 1, color: '#fff', fontSize: 14, lineHeight: 20 },
});
