import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { loadReports, saveReport, type SafetyReport } from '../lib/safety-data';
import { getUser } from '../lib/auth';

const reportTypes = [
  { value: 'harassment', label: 'Harassment', icon: 'person-remove', color: '#ef4444' },
  { value: 'poor-lighting', label: 'Poor Lighting', icon: 'bulb', color: '#eab308' },
  { value: 'suspicious-activity', label: 'Suspicious Activity', icon: 'alert-circle', color: '#f97316' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal', color: '#a855f7' },
];

export default function CommunityReportsScreen({ navigation }: any) {
  const [showForm, setShowForm] = useState(false);
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [newReport, setNewReport] = useState({
    type: '' as SafetyReport['type'],
    description: '',
  });

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const reportsData = await loadReports();
    setReports(reportsData);
  };

  const handleSubmitReport = async () => {
    if (!newReport.type || !newReport.description) return;

    const user = await getUser();
    const report: SafetyReport = {
      id: Date.now().toString(),
      type: newReport.type,
      location: {
        lat: 37.7749 + Math.random() * 0.01,
        lng: -122.4194 + Math.random() * 0.01,
        address: 'Market St, San Francisco',
      },
      description: newReport.description,
      timestamp: new Date().toISOString(),
      severity: 'medium',
      reportedBy: user?.id || 'anonymous',
    };

    await saveReport(report);
    setReports([report, ...reports]);
    setShowForm(false);
    setNewReport({ type: '' as SafetyReport['type'], description: '' });
  };

  const getRiskColor = (type: string) => {
    const reportType = reportTypes.find((t) => t.value === type);
    return reportType?.color || '#a855f7';
  };

  return (
    <LinearGradient colors={['#9333ea', '#7e22ce']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Community Reports</Text>
          <TouchableOpacity onPress={() => setShowForm(!showForm)}>
            <View style={styles.addButton}>
              <Ionicons name={showForm ? 'close' : 'add'} size={20} color="#9333ea" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContent}>
        {showForm && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Report Safety Issue</Text>
            <Text style={styles.label}>Type of Issue</Text>
            <View style={styles.typeGrid}>
              {reportTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => setNewReport({ ...newReport, type: type.value as any })}
                  style={[
                    styles.typeButton,
                    newReport.type === type.value && styles.typeButtonActive,
                  ]}
                >
                  <Ionicons name={type.icon as any} size={24} color="#fff" />
                  <Text style={styles.typeLabel}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput
              value={newReport.description}
              onChangeText={(text) => setNewReport({ ...newReport, description: text })}
              placeholder="Describe what happened..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />

            <View style={styles.formActions}>
              <Button onPress={handleSubmitReport} style={styles.submitButton}>
                Submit Report
              </Button>
              <Button onPress={() => setShowForm(false)} variant="outline">
                Cancel
              </Button>
            </View>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Recent Reports ({reports.length})</Text>
          {reports.length === 0 ? (
            <Text style={styles.emptyText}>No reports in your area yet</Text>
          ) : (
            <View style={styles.reportsList}>
              {reports.slice(0, 10).map((report) => (
                <View key={report.id} style={styles.reportItem}>
                  <View
                    style={[styles.reportIndicator, { backgroundColor: getRiskColor(report.type) }]}
                  />
                  <View style={styles.reportContent}>
                    <Text style={styles.reportType}>
                      {report.type.replace('-', ' ').toUpperCase()}
                    </Text>
                    <Text style={styles.reportLocation}>{report.location.address}</Text>
                    <Text style={styles.reportDescription}>{report.description}</Text>
                    <Text style={styles.reportTime}>
                      {new Date(report.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginLeft: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  typeButton: {
    width: '47%',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  typeLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  formActions: {
    gap: 12,
  },
  submitButton: {
    backgroundColor: '#fff',
  },
  reportsList: {
    gap: 12,
  },
  reportItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  reportIndicator: {
    width: 4,
  },
  reportContent: {
    flex: 1,
    padding: 12,
  },
  reportType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  reportLocation: {
    fontSize: 12,
    color: '#e9d5ff',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  reportTime: {
    fontSize: 12,
    color: '#c084fc',
  },
  emptyText: {
    color: '#e9d5ff',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
