import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { api } from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await api.signIn({ email, password });
      if (result.error) throw new Error(result.error);
      await AsyncStorage.setItem('sheriff_token', result.token);
      await AsyncStorage.setItem('sheriff_user_id', result.user.id);
      await AsyncStorage.setItem('sheriff_user_name', result.user.fullName || '');
      await AsyncStorage.setItem('sheriff_user_email', result.user.email || '');
      navigation.replace('Dashboard');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#7c3aed', '#9333ea', '#ec4899']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>SheRiff</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to your account</Text>

          <View style={styles.form}>
            <Input label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" keyboardType="email-address" autoCapitalize="none" />
            <Input label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry />
            <Button onPress={handleLogin} size="lg" loading={loading}>Login</Button>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>Sign Up</Text></Text>
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
  form: { gap: 16 },
  footer: { marginTop: 32, marginBottom: 24, alignItems: 'center' },
  footerText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  link: { color: '#fff', fontWeight: '600', textDecorationLine: 'underline' },
});
