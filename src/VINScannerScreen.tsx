/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Pressable,
  StatusBar,
} from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from './context/ThemeContext';
import { validateVIN, decodeVIN, getYearFromCode } from './types/vinScanner';
import { showToast } from './utils/toast';

type RootStackParamList = {
  VINScanner: { onScan?: (vin: string) => void };
};

type VINScannerRouteProp = RouteProp<RootStackParamList, 'VINScanner'>;
type VINScannerNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VINScanner'>;

interface VINScannerProps {
  route?: VINScannerRouteProp;
  navigation?: VINScannerNavigationProp;
}

const VINScannerScreen: React.FC<VINScannerProps> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const onScan = route?.params?.onScan;
  const [scannedVIN, setScannedVIN] = useState('');
  const [manualVIN, setManualVIN] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [decodedInfo, setDecodedInfo] = useState<ReturnType<typeof decodeVIN> | null>(null);
  const inputRef = useRef<TextInput>(null);

  // Simulated barcode scanning (replace with actual camera implementation)
  const handleSimulatedScan = () => {
    // This is a demo - replace with actual camera barcode scanning
    const sampleVINs = [
      '1HGCM82633A123456',
      'WVWZZZ3CZWE123456',
      '5YJSA1E47FF123456',
      'KNAFW12134567890',
      'JH4KA7561PC123456',
    ];

    const randomVIN = sampleVINs[Math.floor(Math.random() * sampleVINs.length)];
    handleVINScanned(randomVIN);
  };

  const handleVINScanned = (vin: string) => {
    const cleanVIN = vin.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    setScannedVIN(cleanVIN);

    // Validate VIN
    const validation = validateVIN(cleanVIN);

    if (validation.valid) {
      // Decode VIN
      const info = decodeVIN(cleanVIN);
      setDecodedInfo(info);
      showToast('success', 'VIN scanned successfully!');

      if (onScan) {
        onScan(cleanVIN);
        navigation?.goBack();
      }
    } else {
      setDecodedInfo({
        vin: cleanVIN,
        valid: false,
        errors: validation.errors,
      });
      showToast('error', `Invalid VIN: ${validation.errors.join(', ')}`);
    }
  };

  const handleManualSubmit = () => {
    if (manualVIN.length < 17) {
      showToast('error', 'VIN must be 17 characters');
      return;
    }
    handleVINScanned(manualVIN);
    setShowManualInput(false);
  };

  const handleUseVIN = () => {
    if (decodedInfo?.valid && onScan) {
      onScan(scannedVIN);
      navigation?.goBack();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation?.goBack()}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan VIN</Text>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() =>
            Alert.alert(
              'VIN Scanner',
              'Position the VIN barcode in the camera frame. VIN can also be entered manually.'
            )
          }
        >
          <Text style={styles.helpButtonText}>?</Text>
        </TouchableOpacity>
      </View>

      {/* Camera View (simulated) */}
      <View style={styles.cameraContainer}>
        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            <Text style={styles.scanFrameText}>Position VIN Here</Text>
            <Text style={styles.scanFrameSubtext}>(17 characters)</Text>
          </View>
        </View>

        <Text style={styles.instructionText}>Point camera at VIN barcode or enter manually</Text>
      </View>

      {/* Scanned VIN Display */}
      {scannedVIN ? (
        <View style={[styles.resultCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.resultTitle, { color: theme.colors.text }]}>Scanned VIN</Text>
          <Text style={styles.vinText}>{scannedVIN}</Text>

          {decodedInfo?.valid ? (
            <View style={styles.validBadge}>
              <Text style={styles.validBadgeText}>✓ Valid VIN</Text>
            </View>
          ) : (
            <View style={styles.invalidBadge}>
              <Text style={styles.invalidBadgeText}>
                {decodedInfo?.errors?.join(', ') || 'Invalid VIN'}
              </Text>
            </View>
          )}

          {/* Decoded Info */}
          {decodedInfo?.valid && (
            <View style={styles.decodedInfo}>
              <InfoRow label="Year" value={decodedInfo.year?.toString() || 'N/A'} />
              <InfoRow label="Make" value={decodedInfo.make || 'N/A'} />
              <InfoRow label="Model" value={decodedInfo.model || 'N/A'} />
              <InfoRow label="Country" value={decodedInfo.plantCountry || 'N/A'} />
              <InfoRow label="Type" value={decodedInfo.vehicleType || 'N/A'} />
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            {decodedInfo?.valid ? (
              <TouchableOpacity
                style={[styles.useButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleUseVIN}
              >
                <Text style={styles.useButtonText}>Use This VIN</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSimulatedScan}
              >
                <Text style={styles.retryButtonText}>Try Another Scan</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.manualButton, { borderColor: theme.colors.border }]}
              onPress={() => setShowManualInput(true)}
            >
              <Text style={[styles.manualButtonText, { color: theme.colors.text }]}>
                Enter Manually
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Scan Button */
        <View style={styles.scanActions}>
          <TouchableOpacity style={styles.scanButton} onPress={handleSimulatedScan}>
            <Text style={styles.scanButtonText}>📷 Scan VIN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.manualLink} onPress={() => setShowManualInput(true)}>
            <Text style={styles.manualLinkText}>Don't have a VIN? Enter manually</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Manual Input Modal */}
      <Modal visible={showManualInput} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Enter VIN Manually
            </Text>

            <TextInput
              ref={inputRef}
              style={[
                styles.vinInput,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              value={manualVIN}
              onChangeText={setManualVIN}
              placeholder="Enter 17-character VIN"
              placeholderTextColor={theme.colors.text + '80'}
              autoCapitalize="characters"
              maxLength={17}
              autoFocus
            />

            <Text style={[styles.charCount, { color: theme.colors.text }]}>
              {manualVIN.length}/17 characters
            </Text>

            {/* Validation Feedback */}
            {manualVIN.length > 0 && (
              <View style={styles.validationRow}>
                <Text
                  style={[
                    styles.validationItem,
                    { color: manualVIN.length === 17 ? '#4CAF50' : '#FF9800' },
                  ]}
                >
                  {manualVIN.length === 17 ? '✓' : '○'} 17 chars
                </Text>
                <Text
                  style={[
                    styles.validationItem,
                    { color: /^[A-HJ-NPR-Z0-9]+$/.test(manualVIN) ? '#4CAF50' : '#FF9800' },
                  ]}
                >
                  {/^[A-HJ-NPR-Z0-9]+$/.test(manualVIN) ? '✓' : '○'} No I,O,Q
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowManualInput(false);
                  setManualVIN('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  { backgroundColor: manualVIN.length === 17 ? theme.colors.primary : '#999' },
                ]}
                onPress={handleManualSubmit}
                disabled={manualVIN.length !== 17}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Info Row Component
const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
  },
  scanArea: {
    width: 280,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: '100%',
    height: '100%',
    borderWidth: 3,
    borderColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  scanFrameText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  scanFrameSubtext: {
    color: '#888',
    fontSize: 12,
  },
  instructionText: {
    color: '#888',
    fontSize: 14,
    marginTop: 24,
    textAlign: 'center',
  },
  scanActions: {
    padding: 24,
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  manualLink: {
    padding: 8,
  },
  manualLinkText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  resultCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  vinText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  validBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  validBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  invalidBadge: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  invalidBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  decodedInfo: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    color: '#666',
    fontSize: 14,
  },
  infoValue: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  useButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  useButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  manualButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  manualButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 24,
    borderRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  vinInput: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
  },
  charCount: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  validationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 16,
  },
  validationItem: {
    fontSize: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VINScannerScreen;
