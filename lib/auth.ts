import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  guardians: any[];
  permissions: {
    location: boolean;
    camera: boolean;
    microphone: boolean;
    sms: boolean;
  };
}

export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return session !== null;
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: fullName } }
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function saveUser(user: User) {
  await AsyncStorage.setItem('sheriff_user', JSON.stringify(user));
}

export async function getUser(): Promise<User | null> {
  const data = await AsyncStorage.getItem('sheriff_user');
  return data ? JSON.parse(data) : null;
}

export async function logout() {
  await AsyncStorage.removeItem('sheriff_user');
  await supabase.auth.signOut();
}
