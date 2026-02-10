/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input } from './components/Button';
import { useTheme } from './context/ThemeContext';
import { carService } from './services/api';
import { Car } from './types';

type RootStackParamList = {
  CarDetails: { carId: string };
  Report: { car: Car };
  VINScanner: { onScan?: (vin: string) => void };
};

type CarDetailsScreenRouteProp = RouteProp<RootStackParamList, 'CarDetails'>;
type CarDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CarDetails' | 'Report' | 'VINScanner'
>;

const CarDetailsScreen: React.FC = () => {
  const navigation = useNavigation<CarDetailsScreenNavigationProp>();
  const route = useRoute<CarDetailsScreenRouteProp>();
  const { theme } = useTheme();
  const { carId } = route.params;

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    vin: '',
    mileage: '',
    price: '',
    condition: '',
  });

  useEffect(() => {
    loadCar();
  }, [carId]);

  const loadCar = async () => {
    try {
      const carData = await carService.getById(carId);
      if (carData) {
        setCar(carData);
        setFormData({
          make: carData.make,
          model: carData.model,
          year: carData.year.toString(),
          vin: carData.vin || '',
          mileage: carData.mileage?.toString() || '',
          price: carData.price?.toString() || '',
          condition: carData.condition || '',
        });
      }
    } catch (error) {
      console.error('Error loading car:', error);
      Alert.alert('Error', 'Failed to load car details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!car) return;

    try {
      await carService.update(carId, {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year, 10),
        vin: formData.vin || undefined,
        mileage: formData.mileage ? parseInt(formData.mileage, 10) : undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        condition: formData.condition || undefined,
      });
      setEditing(false);
      loadCar();
      Alert.alert('Success', 'Car details updated');
    } catch (error) {
      console.error('Error updating car:', error);
      Alert.alert('Error', 'Failed to update car details');
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Car', 'Are you sure you want to delete this car?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await carService.delete(carId);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete car');
          }
        },
      },
    ]);
  };

  const handleGenerateReport = () => {
    if (!car) return;
    navigation.navigate('Report', { car });
  };

  const handleScanVIN = () => {
    navigation.navigate('VINScanner', {
      onScan: (vin: string) => {
        setFormData({ ...formData, vin });
        if (!editing) {
          setEditing(true);
        }
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Loading...</Text>
      </View>
    );
  }

  if (!car) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Car not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Car Details</Text>

      {car.images.length > 0 ? (
        <FlatList
          horizontal
          data={car.images}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <Image source={{ uri: item }} style={styles.carImage} />}
          style={styles.imageList}
        />
      ) : (
        <View style={[styles.noImage, { backgroundColor: theme.colors.surface }]}>
          <Text style={{ color: theme.colors.text }}>No images</Text>
        </View>
      )}

      {editing ? (
        <View style={styles.form}>
          <Input
            label="Make"
            value={formData.make}
            onChangeText={text => setFormData({ ...formData, make: text })}
            placeholder="Enter make"
          />
          <Input
            label="Model"
            value={formData.model}
            onChangeText={text => setFormData({ ...formData, model: text })}
            placeholder="Enter model"
          />
          <Input
            label="Year"
            value={formData.year}
            onChangeText={text => setFormData({ ...formData, year: text })}
            keyboardType="numeric"
            placeholder="Enter year"
          />
          <Input
            label="VIN"
            value={formData.vin}
            onChangeText={text => setFormData({ ...formData, vin: text })}
            placeholder="Enter VIN"
          />
          <TouchableOpacity style={styles.scanButton} onPress={handleScanVIN}>
            <Text style={styles.scanButtonText}>📷 Scan VIN</Text>
          </TouchableOpacity>
          <Input
            label="Mileage"
            value={formData.mileage}
            onChangeText={text => setFormData({ ...formData, mileage: text })}
            keyboardType="numeric"
            placeholder="Enter mileage"
          />
          <Input
            label="Price"
            value={formData.price}
            onChangeText={text => setFormData({ ...formData, price: text })}
            keyboardType="numeric"
            placeholder="Enter price"
          />
          <Input
            label="Condition"
            value={formData.condition}
            onChangeText={text => setFormData({ ...formData, condition: text })}
            placeholder="Enter condition"
          />
          <View style={styles.buttonRow}>
            <Button title="Save" onPress={handleSave} style={styles.saveButton} />
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => setEditing(false)}
              style={styles.cancelButton}
            />
          </View>
        </View>
      ) : (
        <View style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]}>
          <DetailRow label="Make" value={car.make} />
          <DetailRow label="Model" value={car.model} />
          <DetailRow label="Year" value={car.year.toString()} />
          {car.vin && <DetailRow label="VIN" value={car.vin} />}
          {car.mileage && <DetailRow label="Mileage" value={`${car.mileage} miles`} />}
          {car.price && <DetailRow label="Price" value={`$${car.price.toLocaleString()}`} />}
          {car.condition && <DetailRow label="Condition" value={car.condition} />}
        </View>
      )}

      <View style={styles.buttonRow}>
        {editing ? null : (
          <Button title="Edit" onPress={() => setEditing(true)} style={styles.editButton} />
        )}
        {editing ? null : (
          <Button
            title="Report"
            variant="secondary"
            onPress={handleGenerateReport}
            style={styles.editButton}
          />
        )}
        <Button
          title="Delete"
          variant="danger"
          onPress={handleDelete}
          style={styles.deleteButton}
        />
      </View>
    </ScrollView>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

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
    marginBottom: 16,
  },
  imageList: {
    marginBottom: 16,
  },
  carImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 8,
  },
  noImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailLabel: {
    fontWeight: '600',
    color: '#666',
  },
  detailValue: {
    color: '#333',
  },
  form: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  editButton: {
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    marginLeft: 8,
  },
  saveButton: {
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
    marginLeft: 8,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CarDetailsScreen;
