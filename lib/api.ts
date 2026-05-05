// Replace with your actual laptop IP address
const BASE_URL = 'http://10.117.78.199:3000/api';

async function post(endpoint: string, data: any) {
  try {
    const response = await fetch(BASE_URL + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

async function get(endpoint: string) {
  try {
    const response = await fetch(BASE_URL + endpoint);
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const api = {
  // Auth
  signUp: (data: { email: string; password: string; fullName: string; phone?: string }) =>
    post('/auth/signup', data),
  signIn: (data: { email: string; password: string }) =>
    post('/auth/signin', data),
  verifyOtp: (data: { phone: string; token: string }) =>
    post('/auth/verify-otp', data),

  // SOS
  triggerSOS: (data: { userId: string; lat: number; lng: number }) =>
    post('/sos/trigger', data),
  resolveSOS: (data: { sosId: string }) =>
    post('/sos/resolve', data),

  // Location
  updateLocation: (data: { tripId: string; userId: string; lat: number; lng: number }) =>
    post('/location/update', data),
  getTripLocations: (tripId: string) =>
    get('/location/trip/' + tripId),

  // User
  getProfile: (userId: string) =>
    get('/user/profile/' + userId),
  updateProfile: (userId: string, data: { fullName: string; phone: string }) =>
    post('/user/profile/' + userId, data),
  addGuardian: (data: { userId: string; name: string; phone: string; relationship: string }) =>
    post('/user/guardian', data),
};
