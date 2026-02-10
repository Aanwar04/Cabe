/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from './components/Button';
import { useTheme } from './context/ThemeContext';
import { pdfService, createReportFromData } from './services/pdfService';
import { Car, Project } from './types';
import Share from 'react-native-share';

type RootStackParamList = {
  ReportScreen: { car: Car; project?: Project };
};

type ReportScreenRouteProp = RouteProp<RootStackParamList, 'ReportScreen'>;
type ReportScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ReportScreen'>;

interface ReportScreenProps {
  route?: ReportScreenRouteProp;
  navigation?: ReportScreenNavigationProp;
}

const ReportScreen: React.FC<ReportScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const car = route?.params?.car;
  const project = route?.params?.project;

  const [generating, setGenerating] = useState(false);
  const [generatedPath, setGeneratedPath] = useState<string | null>(null);

  if (!car) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>No car data available</Text>
      </View>
    );
  }

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      const report = createReportFromData(car, project);
      const filePath = await pdfService.generateReport(report);
      setGeneratedPath(filePath);
      Alert.alert('Success', 'Report generated successfully!');
    } catch (error) {
      console.error('Report generation error:', error);
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleShareReport = async () => {
    if (!generatedPath) {
      Alert.alert('Error', 'Please generate a report first');
      return;
    }

    try {
      await pdfService.sharePDF(generatedPath, 'Car360 Inspection Report');
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleViewReport = async () => {
    if (!generatedPath) {
      Alert.alert('Error', 'Please generate a report first');
      return;
    }

    try {
      await pdfService.sharePDF(generatedPath, 'View Report');
    } catch (error) {
      console.error('View error:', error);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Generate Report</Text>

      {/* Car Summary Card */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Vehicle Summary</Text>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Make:</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{car.make}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Model:</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{car.model}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Year:</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{car.year}</Text>
        </View>
        {car.vin && (
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.text }]}>VIN:</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>{car.vin}</Text>
          </View>
        )}
        {car.images.length > 0 && (
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Photos:</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>{car.images.length}</Text>
          </View>
        )}
      </View>

      {/* Report Options */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Report Options</Text>

        <TouchableOpacity
          style={[styles.option, { borderBottomColor: theme.colors.border }]}
          onPress={handleGenerateReport}
          disabled={generating}
        >
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
              Full Inspection Report
            </Text>
            <Text style={[styles.optionDesc, { color: theme.colors.text }]}>
              Complete report with all vehicle details and photos
            </Text>
          </View>
          {generating ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : (
            <Text style={[styles.optionArrow, { color: theme.colors.primary }]}>&#9654;</Text>
          )}
        </TouchableOpacity>

        {generatedPath && (
          <View style={styles.generatedSection}>
            <View style={styles.successBanner}>
              <Text style={styles.successText}>Report Generated!</Text>
            </View>

            <View style={styles.buttonRow}>
              <Button
                title="View"
                onPress={handleViewReport}
                style={styles.actionButton}
                variant="secondary"
              />
              <Button title="Share" onPress={handleShareReport} style={styles.actionButton} />
            </View>
          </View>
        )}
      </View>

      {/* Report Preview Info */}
      <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.infoTitle, { color: theme.colors.text }]}>Report Includes:</Text>
        <View style={styles.checklist}>
          <Text style={[styles.checkItem, { color: theme.colors.text }]}>
            ✓ Vehicle Information
          </Text>
          <Text style={[styles.checkItem, { color: theme.colors.text }]}>✓ VIN Number</Text>
          <Text style={[styles.checkItem, { color: theme.colors.text }]}>
            ✓ Mileage & Condition
          </Text>
          <Text style={[styles.checkItem, { color: theme.colors.text }]}>✓ Inspection Photos</Text>
          <Text style={[styles.checkItem, { color: theme.colors.text }]}>✓ Project Details</Text>
          <Text style={[styles.checkItem, { color: theme.colors.text }]}>✓ Inspector Notes</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleGenerateReport}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.quickButtonText}>Generate PDF Report</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontWeight: '600',
  },
  value: {
    flex: 1,
    textAlign: 'right',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionDesc: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  optionArrow: {
    fontSize: 20,
    marginLeft: 8,
  },
  generatedSection: {
    marginTop: 16,
  },
  successBanner: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  successText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  checklist: {
    gap: 8,
  },
  checkItem: {
    fontSize: 14,
  },
  quickActions: {
    marginTop: 8,
  },
  quickButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportScreen;
