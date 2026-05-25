import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

export default function EvidenceCaptureScreen({ navigation }: any) {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [guardians, setGuardians] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const cameraRef = useRef<any>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    loadGuardians();
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setCurrentLocation(loc.coords);
      }
    } catch (e) {}
  };

  const loadGuardians = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('guardians').select('*').eq('user_id', user.id);
    setGuardians(data || []);
  };

  const startAudioRecording = async () => {
    try {
      await AudioModule.requestRecordingPermissionsAsync();
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      Alert.alert('Recording Started', 'Audio recording is now active. Press Stop when done.');
    } catch (error) {
      Alert.alert('Error', 'Could not start audio recording');
    }
  };

  const stopAudioRecording = async () => {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (uri) {
        const newRec = {
          id: Date.now().toString(),
          type: 'audio',
          uri,
          timestamp: new Date().toLocaleString(),
          name: 'Audio_' + Date.now() + '.m4a',
        };
        setRecordings(prev => [newRec, ...prev]);
        Alert.alert('Saved!', 'Audio recording saved successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not stop recording');
    }
  };

  const openCamera = async (mode: 'photo' | 'video') => {
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('Permission needed', 'Camera permission is required');
        return;
      }
    }
    if (mode === 'video' && !micPermission?.granted) {
      await requestMicPermission();
    }
    setCameraMode(mode);
    setShowCamera(true);
  };

  const capturePhoto = async () => {
    try {
      if (!cameraRef.current) return;
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(photo.uri);
      }
      const newRec = {
        id: Date.now().toString(),
        type: 'photo',
        uri: photo.uri,
        timestamp: new Date().toLocaleString(),
        name: 'Photo_' + Date.now() + '.jpg',
      };
      setRecordings(prev => [newRec, ...prev]);
      setShowCamera(false);
      Alert.alert('Photo Captured!', 'Saved to gallery and evidence list');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not take photo');
    }
  };

  const startVideoRecording = async () => {
    try {
      if (!cameraRef.current) return;
      setIsRecordingVideo(true);
      const video = await cameraRef.current.recordAsync({ maxDuration: 60 });
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(video.uri);
      }
      const newRec = {
        id: Date.now().toString(),
        type: 'video',
        uri: video.uri,
        timestamp: new Date().toLocaleString(),
        name: 'Video_' + Date.now() + '.mp4',
      };
      setRecordings(prev => [newRec, ...prev]);
      setIsRecordingVideo(false);
      setShowCamera(false);
      Alert.alert('Video Saved!', 'Saved to gallery and evidence list');
    } catch (error: any) {
      setIsRecordingVideo(false);
      Alert.alert('Error', error.message || 'Could not record video');
    }
  };

  const stopVideoRecording = () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
  };

  const shareEvidenceToGuardian = async (recording: any) => {
    if (guardians.length === 0) {
      Alert.alert('No Guardians', 'Add emergency contacts first to share evidence');
      return;
    }

    const locationText = currentLocation
      ? 'Location: https://maps.google.com/?q=' + currentLocation.latitude + ',' + currentLocation.longitude
      : 'Location: Unknown';

    const message = 'SHERIFF EVIDENCE ALERT\n' +
      'Type: ' + recording.type.toUpperCase() + '\n' +
      'Time: ' + recording.timestamp + '\n' +
      locationText + '\n\n' +
      'Evidence captured via SheRiff Safety App';

    Alert.alert(
      'Share Evidence',
      'Send to ' + guardians.length + ' guardian(s)?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send WhatsApp',
          onPress: () => {
            guardians.forEach(g => {
              const phone = g.guardian_phone.replace(/[^0-9]/g, '');
              Linking.openURL('whatsapp://send?phone=' + phone + '&text=' + encodeURIComponent(message))
                .catch(() => {
                  Linking.openURL('sms:' + g.guardian_phone + '?body=' + encodeURIComponent(message));
                });
            });
          }
        },
        {
          text: 'Share File',
          onPress: async () => {
            await Share.share({
              title: 'SheRiff Evidence',
              message,
              url: recording.uri,
            });
          }
        }
      ]
    );
  };

  const deleteRecording = (id: string) => {
    Alert.alert('Delete', 'Delete this recording?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setRecordings(prev => prev.filter(r => r.id !== id)) }
    ]);
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" mode={cameraMode}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity style={styles.cameraClose} onPress={() => setShowCamera(false)}>
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.cameraModeText}>{cameraMode === 'photo' ? 'Photo Mode' : 'Video Mode'}</Text>
            <View style={{ width: 48 }} />
          </View>
          <View style={styles.cameraControls}>
            {cameraMode === 'photo' ? (
              <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
                <View style={styles.captureInner} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.captureButton, isRecordingVideo && styles.captureButtonRecording]}
                onPress={isRecordingVideo ? stopVideoRecording : startVideoRecording}
              >
                <View style={[styles.captureInner, isRecordingVideo && styles.captureInnerRecording]} />
              </TouchableOpacity>
            )}
          </View>
          {isRecordingVideo && (
            <View style={styles.recordingBadge}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingBadgeText}>Recording...</Text>
            </View>
          )}
        </CameraView>
      </View>
    );
  }

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
        <View style={styles.locationBadge}>
          <Ionicons name="location" size={16} color="#fff" />
          <Text style={styles.locationText}>
            {currentLocation
              ? currentLocation.latitude.toFixed(4) + ', ' + currentLocation.longitude.toFixed(4)
              : 'Fetching location...'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Audio Recording</Text>
          <Text style={styles.cardDesc}>Record audio evidence during emergencies</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionBtn, { flex: 1 }]} onPress={startAudioRecording}>
              <Ionicons name="mic" size={22} color="#fff" />
              <Text style={styles.actionBtnText}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { flex: 1, backgroundColor: '#ef4444' }]} onPress={stopAudioRecording}>
              <Ionicons name="stop-circle" size={22} color="#fff" />
              <Text style={styles.actionBtnText}>Stop</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Camera</Text>
          <Text style={styles.cardDesc}>Capture photo or video evidence</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionBtn, { flex: 1 }]} onPress={() => openCamera('photo')}>
              <Ionicons name="camera" size={22} color="#fff" />
              <Text style={styles.actionBtnText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { flex: 1, backgroundColor: '#7c3aed' }]} onPress={() => openCamera('video')}>
              <Ionicons name="videocam" size={22} color="#fff" />
              <Text style={styles.actionBtnText}>Video</Text>
            </TouchableOpacity>
          </View>
        </View>

        {guardians.length > 0 && (
          <View style={styles.guardiansInfo}>
            <Ionicons name="people" size={16} color="#fff" />
            <Text style={styles.guardiansText}>
              {guardians.length} guardian(s) will receive evidence when you share
            </Text>
          </View>
        )}

        {recordings.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Evidence ({recordings.length})</Text>
            {recordings.map(rec => (
              <View key={rec.id} style={styles.recordingItem}>
                <Ionicons
                  name={rec.type === 'audio' ? 'mic' : rec.type === 'video' ? 'videocam' : 'camera'}
                  size={20} color="#fff"
                />
                <View style={styles.recordingInfo}>
                  <Text style={styles.recordingName}>{rec.name}</Text>
                  <Text style={styles.recordingTime}>{rec.timestamp}</Text>
                </View>
                <View style={styles.recordingActions}>
                  <TouchableOpacity
                    onPress={() => shareEvidenceToGuardian(rec)}
                    style={[styles.iconBtn, { backgroundColor: '#3b82f6' }]}
                  >
                    <Ionicons name="share-social" size={16} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteRecording(rec.id)}
                    style={[styles.iconBtn, { backgroundColor: '#ef4444' }]}
                  >
                    <Ionicons name="trash" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#fff" />
          <Text style={styles.infoText}>
            All evidence is stored on your device. Tap the share button on any recording to send it directly to your guardians via WhatsApp or SMS with your current location.
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
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start', marginBottom: 20 },
  locationText: { color: '#fff', fontSize: 13 },
  card: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  cardDesc: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fb6f92', borderRadius: 12, padding: 14 },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  guardiansInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 14, marginBottom: 16 },
  guardiansText: { color: '#fff', fontSize: 14, flex: 1 },
  recordingItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, marginBottom: 8 },
  recordingInfo: { flex: 1 },
  recordingName: { color: '#fff', fontWeight: '600', fontSize: 13 },
  recordingTime: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  recordingActions: { flexDirection: 'row', gap: 6 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  infoCard: { flexDirection: 'row', gap: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 16 },
  infoText: { flex: 1, color: '#fff', fontSize: 13, lineHeight: 20 },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 60 },
  cameraClose: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  cameraModeText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  cameraControls: { position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center' },
  captureButton: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  captureButtonRecording: { borderColor: '#ef4444' },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },
  captureInnerRecording: { width: 30, height: 30, borderRadius: 6, backgroundColor: '#ef4444' },
  recordingBadge: { position: 'absolute', top: 120, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  recordingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' },
  recordingBadgeText: { color: '#fff', fontWeight: '600' },
});
