import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = {
  signUp: async (data: { email: string; password: string; fullName: string; phone?: string }) => {
    try {
      const { data: result, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.fullName }
        }
      });
      if (error) throw error;
      return { userId: result.user?.id, message: 'Account created successfully' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  signIn: async (data: { email: string; password: string }) => {
    try {
      const { data: result, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      return {
        token: result.session?.access_token,
        user: {
          id: result.user?.id,
          email: result.user?.email,
          fullName: result.user?.user_metadata?.full_name || '',
        }
      };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  verifyOtp: async (data: { phone: string; token: string }) => {
    try {
      const { data: result, error } = await supabase.auth.verifyOtp({
        phone: data.phone,
        token: data.token,
        type: 'sms',
      });
      if (error) throw error;
      return { token: result.session?.access_token, user: result.user };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  triggerSOS: async (data: { userId: string; lat: number; lng: number }) => {
    try {
      const { error } = await supabase.from('sos_events').insert({
        user_id: data.userId,
        latitude: data.lat,
        longitude: data.lng,
        status: 'active',
      });
      if (error) throw error;
      return { success: true, message: 'SOS triggered' };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  resolveSOS: async (data: { sosId: string }) => {
    try {
      const { error } = await supabase.from('sos_events')
        .update({ status: 'resolved' })
        .eq('id', data.sosId);
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  getProfile: async (userId: string) => {
    try {
      const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
      const { data: guardians } = await supabase.from('guardians').select('*').eq('user_id', userId);
      return { user, guardians };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  addGuardian: async (data: { userId: string; name: string; phone: string; relationship: string }) => {
    try {
      const { data: guardian, error } = await supabase.from('guardians').insert({
        user_id: data.userId,
        guardian_name: data.name,
        guardian_phone: data.phone,
        relationship: data.relationship,
      }).select().single();
      if (error) throw error;
      return { success: true, guardian };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  updateLocation: async (data: { tripId: string; userId: string; lat: number; lng: number }) => {
    try {
      const { error } = await supabase.from('location_events').insert({
        trip_id: data.tripId,
        user_id: data.userId,
        latitude: data.lat,
        longitude: data.lng,
      });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
  },
};
