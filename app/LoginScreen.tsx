import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { saveUser, type User } from '../lib/auth';

export default function LoginScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [emailLogin, setEmailLogin] = useState({ email: '', password: '' });
  const [phoneLogin, setPhoneLogin] = useState({ phone: '', otp: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    setLoading(true);

    const mockUser: User = {
      id: 'user_' + Date.now(),
      name: 'Demo User',
      email: emailLogin.email,
      phone: '+1234567890',
      guardians: [],
      permissions: {
        location: true,
        camera: true,
        microphone: true,
        sms: true,
      },
    };

    await saveUser(mockUser);
    setLoading(false);
    navigation.replace('Dashboard');
  };

  const handlePhoneLogin = async () => {
    if (!otpSent) {
      setOtpSent(true);
      return;
    }

    setLoading(true);
    const mockUser: User = {
      id: 'user_' + Date.now(),
      name: 'Demo User',
      email: '',
      phone: phoneLogin.phone,
      guardians: [],
      permissions: {
        location: true,
        camera: true,
        microphone: true,
        sms: true,
      },
    };

    await saveUser(mockUser);
    setLoading(false);
    navigation.replace('Dashboard');
  };

  return (
    <LinearGradient
      colors={['#2563eb', '#3b82f6', '#06b6d4']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image
            source={require('../assets/logo.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to continue your safety journey</Text>

          <View style={styles.tabs}>
            <TouchableOpacity
              onPress={() => setActiveTab('email')}
              style={[styles.tab, activeTab === 'email' && styles.activeTab]}
            >
              <Ionicons name="mail" size={16} color={activeTab === 'email' ? '#2563eb' : '#fff'} />
              <Text style={[styles.tabText, activeTab === 'email' && styles.activeTabText]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('phone')}
              style={[styles.tab, activeTab === 'phone' && styles.activeTab]}
            >
              <Ionicons name="call" size={16} color={activeTab === 'phone' ? '#2563eb' : '#fff'} />
              <Text style={[styles.tabText, activeTab === 'phone' && styles.activeTabText]}>
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'email' ? (
            <View style={styles.form}>
              <Input
                label="Email"
                value={emailLogin.email}
                onChangeText={(text) => setEmailLogin({ ...emailLogin, email: text })}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label="Password"
                value={emailLogin.password}
                onChangeText={(text) => setEmailLogin({ ...emailLogin, password: text })}
                placeholder="Enter your password"
                secureTextEntry
              />
              <Button onPress={handleEmailLogin} size="lg" loading={loading}>
                Login
              </Button>
            </View>
          ) : (
            <View style={styles.form}>
              <Input
                label="Phone Number"
                value={phoneLogin.phone}
                onChangeText={(text) => setPhoneLogin({ ...phoneLogin, phone: text })}
                placeholder="+1 234 567 8900"
                keyboardType="phone-pad"
                editable={!otpSent}
              />
              {otpSent && (
                <Input
                  label="Enter OTP"
                  value={phoneLogin.otp}
                  onChangeText={(text) => setPhoneLogin({ ...phoneLogin, otp: text })}
                  placeholder="123456"
                  keyboardType="numeric"
                />
              )}
              <Button onPress={handlePhoneLogin} size="lg" loading={loading}>
                {otpSent ? 'Verify OTP' : 'Send OTP'}
              </Button>
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text
                style={styles.link}
                onPress={() => navigation.navigate('Signup')}
              >
                Sign Up
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
  },
  logo: {
    width: 96,
    height: 96,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 32,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  tabText: {
    color: '#fff',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#2563eb',
  },
  form: {
    gap: 16,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  link: {
    color: '#fff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
