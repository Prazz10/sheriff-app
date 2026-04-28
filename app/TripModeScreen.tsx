import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Progress } from '../components/Progress';

export default function TripModeScreen({ navigation }: any) {
  const [step, setStep] = useState<'input' | 'analysis' | 'active'>('input');
  const [tripData, setTripData] = useState({
    currentLocation: '',
    destination: '',
  });
  const [safetyScore, setSafetyScore] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);

  const handleStartAnalysis = () => {
    if (!tripData.currentLocation || !tripData.destination) {
      return;
    }

    setAnalyzing(true);
    setStep('analysis');

    setTimeout(() => {
      setSafetyScore(75);
      setAnalyzing(false);
    }, 3000);
  };

  const handleStartTrip = () => {
    setStep('active');
  };

  const handleEndTrip = () => {
    navigation.navigate('Dashboard');
  };

  const handleUseCurrentLocation = () => {
    setTripData({ ...tripData, currentLocation: 'Market St, San Francisco' });
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#4ade80';
    if (score >= 40) return '#fbbf24';
    return '#f87171';
  };

  if (step === 'active') {
    return (
      <LinearGradient colors={['#9333ea', '#7e22ce']} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.pulseDot} />
            <Text style={styles.headerTitle}>Trip Active</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollContent}>
          <Card style={styles.card}>
            <View style={styles.scoreHeader}>
              <Text style={styles.cardTitle}>Safety Score</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(safetyScore) }]}>
                {safetyScore}%
              </Text>
            </View>
            <Progress value={safetyScore} style={styles.progress} />
          </Card>

          <Card style={styles.card}>
            <View style={styles.routeItem}>
              <Ionicons name="location" size={20} color="#4ade80" />
              <View style={styles.routeText}>
                <Text style={styles.routeLabel}>From</Text>
                <Text style={styles.routeValue}>{tripData.currentLocation}</Text>
              </View>
            </View>
            <View style={styles.routeItem}>
              <Ionicons name="navigate" size={20} color="#a78bfa" />
              <View style={styles.routeText}>
                <Text style={styles.routeLabel}>To</Text>
                <Text style={styles.routeValue}>{tripData.destination}</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Live Monitoring</Text>
            <View style={styles.monitoringList}>
              <View style={styles.monitoringItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                <Text style={styles.monitoringText}>Following safe route</Text>
              </View>
              <View style={styles.monitoringItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                <Text style={styles.monitoringText}>Location shared with guardians</Text>
              </View>
              <View style={styles.monitoringItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                <Text style={styles.monitoringText}>Movement detected</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.card}>
            <View style={styles.riskHeader}>
              <Ionicons name="alert-circle" size={20} color="#fbbf24" />
              <Text style={styles.cardTitle}>Risk Zones Ahead</Text>
            </View>
            <View style={styles.riskZone}>
              <Text style={styles.riskTitle}>⚠️ Medium Risk - 0.5 mi ahead</Text>
              <Text style={styles.riskDescription}>Poor lighting reported</Text>
            </View>
          </Card>

          <View style={styles.actions}>
            <Button onPress={handleEndTrip} size="lg" style={styles.endButton}>
              <View style={styles.buttonContent}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>End Trip - I've Arrived Safely</Text>
              </View>
            </Button>
            <Button
              onPress={() => navigation.navigate('SOSActive')}
              variant="outline"
              size="lg"
              style={styles.sosButton}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                <Text style={styles.sosButtonText}>Emergency SOS</Text>
              </View>
            </Button>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  if (step === 'analysis') {
    return (
      <LinearGradient colors={['#9333ea', '#7e22ce']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.analysisCont}>
          {analyzing ? (
            <View style={styles.analyzing}>
              <View style={styles.spinnerContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Ionicons name="navigate" size={40} color="#fff" style={styles.spinnerIcon} />
              </View>
              <Text style={styles.analyzingTitle}>Analyzing Your Route</Text>
              <Text style={styles.analyzingSubtitle}>Please wait while we find the safest path...</Text>
              <View style={styles.checkList}>
                <View style={styles.checkItem}>
                  <View style={styles.checkDot} />
                  <Text style={styles.checkText}>Checking crime data...</Text>
                </View>
                <View style={styles.checkItem}>
                  <View style={styles.checkDot} />
                  <Text style={styles.checkText}>Analyzing lighting conditions...</Text>
                </View>
                <View style={styles.checkItem}>
                  <View style={styles.checkDot} />
                  <Text style={styles.checkText}>Evaluating crowd density...</Text>
                </View>
                <View style={styles.checkItem}>
                  <View style={styles.checkDot} />
                  <Text style={styles.checkText}>Reviewing community reports...</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.results}>
              <Ionicons name="checkmark-circle" size={96} color="#4ade80" style={styles.checkIcon} />
              <Text style={styles.resultsTitle}>Route Analysis Complete</Text>
              <Text style={styles.resultsSubtitle}>We've found the safest route for you</Text>

              <Card style={styles.scoreCard}>
                <View style={styles.scoreHeader}>
                  <Text style={styles.cardTitle}>Safety Score</Text>
                  <Text style={[styles.scoreLarge, { color: getScoreColor(safetyScore) }]}>
                    {safetyScore}%
                  </Text>
                </View>
                <Progress value={safetyScore} style={styles.progress} />
                <Text style={styles.scoreDesc}>
                  {safetyScore >= 70
                    ? 'This route is safe with minimal risks'
                    : safetyScore >= 40
                    ? 'This route has some risk zones - stay alert'
                    : 'Consider an alternative route or travel with someone'}
                </Text>
              </Card>

              <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                  <Ionicons name="time" size={24} color="#fff" style={styles.statIcon} />
                  <Text style={styles.statLabel}>Duration</Text>
                  <Text style={styles.statValue}>12 min</Text>
                </Card>
                <Card style={styles.statCard}>
                  <Ionicons name="git-commit" size={24} color="#fff" style={styles.statIcon} />
                  <Text style={styles.statLabel}>Distance</Text>
                  <Text style={styles.statValue}>2.3 mi</Text>
                </Card>
                <Card style={styles.statCard}>
                  <Ionicons name="alert-circle" size={24} color="#fff" style={styles.statIcon} />
                  <Text style={styles.statLabel}>Risk Zones</Text>
                  <Text style={styles.statValue}>1</Text>
                </Card>
              </View>

              <Button onPress={handleStartTrip} size="lg" style={styles.startButton}>
                Start Trip with Monitoring
              </Button>
              <Button
                onPress={() => setStep('input')}
                variant="outline"
                size="lg"
              >
                Change Route
              </Button>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#9333ea', '#7e22ce']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Start Safe Trip</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContent}>
        <Text style={styles.title}>Plan Your Journey</Text>
        <Text style={styles.subtitle}>We'll find the safest route for you</Text>

        <Card style={styles.card}>
          <Input
            label="Current Location"
            value={tripData.currentLocation}
            onChangeText={(text) => setTripData({ ...tripData, currentLocation: text })}
            placeholder="Enter your current location"
          />
          <TouchableOpacity onPress={handleUseCurrentLocation} style={styles.detectButton}>
            <Ionicons name="location" size={16} color="#fff" />
            <Text style={styles.detectText}>Use Current Location</Text>
          </TouchableOpacity>

          <Input
            label="Destination"
            value={tripData.destination}
            onChangeText={(text) => setTripData({ ...tripData, destination: text })}
            placeholder="Where are you going?"
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Trip Safety Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>AI Route Analysis</Text>
                <Text style={styles.featureDesc}>Safest path based on crime data and reports</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Live Tracking</Text>
                <Text style={styles.featureDesc}>Guardians can monitor your journey</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Smart Alerts</Text>
                <Text style={styles.featureDesc}>Automatic alerts for deviations</Text>
              </View>
            </View>
          </View>
        </Card>

        <Button onPress={handleStartAnalysis} size="lg" style={styles.analyzeButton}>
          <View style={styles.buttonContent}>
            <Ionicons name="navigate" size={20} color="#9333ea" />
            <Text style={styles.analyzeText}>Analyze Route</Text>
          </View>
        </Button>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4ade80',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e9d5ff',
    marginBottom: 24,
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
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -8,
    marginBottom: 16,
  },
  detectText: {
    color: '#fff',
    fontSize: 14,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: '#e9d5ff',
  },
  analyzeButton: {
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  analyzeText: {
    color: '#9333ea',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analysisCont: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48,
  },
  analyzing: {
    alignItems: 'center',
  },
  spinnerContainer: {
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  spinnerIcon: {
    position: 'absolute',
  },
  analyzingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  analyzingSubtitle: {
    fontSize: 16,
    color: '#e9d5ff',
    marginBottom: 32,
    textAlign: 'center',
  },
  checkList: {
    alignSelf: 'stretch',
    gap: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  checkText: {
    color: '#fff',
    fontSize: 14,
  },
  results: {
    alignItems: 'center',
  },
  checkIcon: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: '#e9d5ff',
    marginBottom: 32,
    textAlign: 'center',
  },
  scoreCard: {
    padding: 24,
    marginBottom: 24,
    width: '100%',
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreLarge: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  progress: {
    marginBottom: 16,
  },
  scoreDesc: {
    fontSize: 14,
    color: '#e9d5ff',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#e9d5ff',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  startButton: {
    backgroundColor: '#fff',
    marginBottom: 12,
    width: '100%',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  routeText: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 14,
    color: '#e9d5ff',
    marginBottom: 4,
  },
  routeValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  monitoringList: {
    gap: 12,
  },
  monitoringItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monitoringText: {
    fontSize: 14,
    color: '#fff',
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  riskZone: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    padding: 12,
    borderRadius: 8,
  },
  riskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  riskDescription: {
    fontSize: 12,
    color: '#fef3c7',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  endButton: {
    backgroundColor: '#22c55e',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sosButton: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  sosButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
