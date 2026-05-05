import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { api } from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignupScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const result = await api.signUp({ email, password, fullName: name });
      if (result.error) throw new Error(result.error);
      await AsyncStorage.setItem('sheriff_user_id', result.userId);
      await AsyncStorage.setItem('sheriff_user_name', name);
      await AsyncStorage.setItem('sheriff_user_email', email);
      navigation.navigate('ProfileSetup');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!name || !phone) {
      Alert.alert('Error', 'Please enter name and phone number');
      return;
    }
    setLoading(true);
    try {
      const result = await api.signUp({ email: phone + '@sheriff.app', password: 'Sheriff@123', fullName: name, phone });
      if (result.error) throw new Error(result.error);
      setOtpSent(true);
      Alert.alert('Success', 'Account created! Please verify your phone.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      const result = await api.verifyOtp({ phone, token: otp });
      if (result.error) throw new Error(result.error);
      await AsyncStorage.setItem('sheriff_user_name', name);
      await AsyncStorage.setItem('sheriff_user_phone', phone);
      navigation.navigate('ProfileSetup');
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#059669', '#14b8a6', '#06b6d4']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SheRiff</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join SheRiff for your safety</Text>

          <View style={styles.tabs}>
            <TouchableOpacity onPress={() => setActiveTab('email')} style={[styles.tab, activeTab === 'email' && styles.activeTab]}>
              <Ionicons name="mail" size={16} color={activeTab === 'email' ? '#059669' : '#fff'} />
              <Text style={[styles.tabText, activeTab === 'email' && styles.activeTabText]}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveTab('phone')} style={[styles.tab, activeTab === 'phone' && styles.activeTab]}>
              <Ionicons name="call" size={16} color={activeTab === 'phone' ? '#059669' : '#fff'} />
              <Text style={[styles.tabText, activeTab === 'phone' && styles.activeTabText]}>Phone</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'email' ? (
            <View style={styles.form}>
              <Input label="Full Name" value={name} onChangeText={setName} placeholder="Your name" />
              <Input label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" keyboardType="email-address" autoCapitalize="none" />
              <Input label="Password" value={password} onChangeText={setPassword} placeholder="Min 6 characters" secureTextEntry />
              <Button onPress={handleEmailSignup} size="lg" loading={loading}>Sign Up</Button>
            </View>
          ) : (
            <View style={styles.form}>
              <Input label="Full Name" value={name} onChangeText={setName} placeholder="Your name" editable={!otpSent} />
              <Input label="Phone Number" value={phone} onChangeText={setPhone} placeholder="+91XXXXXXXXXX" keyboardType="phone-pad" editable={!otpSent} />
              {otpSent && <Input label="Enter OTP" value={otp} onChangeText={setOtp} placeholder="123456" keyboardType="numeric" />}
              <Button onPress={otpSent ? handleVerifyOTP : handleSendOTP} size="lg" loading={loading}>
                {otpSent ? 'Verify OTP' : 'Send OTP'}
              </Button>
              {otpSent && <TouchableOpacity onPress={() => setOtpSent(false)}><Text style={styles.resendText}>Wrong number? Go back</Text></TouchableOpacity>}
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? <Text style={styles.link} onPress={() => navigation.navigate('Login')}>Login</Text></Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24 },
  backButton: { width: 40 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  placeholder: { width: 40 },
  content: { flex: 1, paddingHorizontal: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 32 },
  tabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, marginBottom: 24 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 8 },
  activeTab: { backgroundColor: '#fff', borderRadius: 8 },
  tabText: { color: '#fff', fontWeight: '600' },
  activeTabText: { color: '#059669' },
  form: { gap: 16 },
  footer: { marginTop: 32, marginBottom: 24, alignItems: 'center' },
  footerText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  link: { color: '#fff', fontWeight: '600', textDecorationLine: 'underline' },
  resendText: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontSize: 14 },
});
