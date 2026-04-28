import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SafetyReport {
  id: string;
  type: 'harassment' | 'suspicious-activity' | 'poorly-lit' | 'other';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  reportedBy: string;
}

export interface Trip {
  id: string;
  startTime: string;
  endTime?: string;
  startLocation: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  currentLocation?: { lat: number; lng: number };
  status: 'active' | 'completed' | 'cancelled';
  route: Array<{ lat: number; lng: number }>;
  safetyScore?: number;
}

const REPORTS_STORAGE_KEY = 'sheriff_reports';
const TRIPS_STORAGE_KEY = 'sheriff_trips';

export const saveReport = async (report: SafetyReport): Promise<void> => {
  try {
    const reports = await loadReports();
    reports.unshift(report);
    await AsyncStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } catch (error) {
    console.error('Error saving report:', error);
  }
};

export const loadReports = async (): Promise<SafetyReport[]> => {
  try {
    const reportsJson = await AsyncStorage.getItem(REPORTS_STORAGE_KEY);
    return reportsJson ? JSON.parse(reportsJson) : [];
  } catch (error) {
    console.error('Error loading reports:', error);
    return [];
  }
};

export const saveTrip = async (trip: Trip): Promise<void> => {
  try {
    const trips = await loadTrips();
    const existingIndex = trips.findIndex(t => t.id === trip.id);
    if (existingIndex >= 0) {
      trips[existingIndex] = trip;
    } else {
      trips.unshift(trip);
    }
    await AsyncStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
  } catch (error) {
    console.error('Error saving trip:', error);
  }
};

export const loadTrips = async (): Promise<Trip[]> => {
  try {
    const tripsJson = await AsyncStorage.getItem(TRIPS_STORAGE_KEY);
    return tripsJson ? JSON.parse(tripsJson) : [];
  } catch (error) {
    console.error('Error loading trips:', error);
    return [];
  }
};

export const getActiveTrip = async (): Promise<Trip | null> => {
  const trips = await loadTrips();
  return trips.find(t => t.status === 'active') || null;
};
