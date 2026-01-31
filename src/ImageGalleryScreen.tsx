/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from './context/ThemeContext';

type RootStackParamList = {
  ImageGallery: { images: string[]; title?: string };
};

type ImageGalleryRouteProp = RouteProp<RootStackParamList, 'ImageGallery'>;
type ImageGalleryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ImageGallery'>;

const { width: screenWidth } = Dimensions.get('window');

const ImageGalleryScreen: React.FC = () => {
  const navigation = useNavigation<ImageGalleryNavigationProp>();
  const route = useRoute<ImageGalleryRouteProp>();
  const { theme } = useTheme();
  const { images, title = 'Gallery' } = route.params;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const renderItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={styles.thumbnailContainer}
      onPress={() => {
        setSelectedIndex(index);
        setModalVisible(true);
      }}>
      <Image source={{ uri: item }} style={styles.thumbnail} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>

      {images.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.colors.text }}>No images available</Text>
        </View>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={styles.grid}
        />
      )}

      <Modal visible={modalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Image
            source={{ uri: images[selectedIndex] }}
            style={styles.fullImage}
            resizeMode="contain"
          />

          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              {selectedIndex + 1} / {images.length}
            </Text>
          </View>

          {images.length > 1 && (
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() =>
                  setSelectedIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))
                }>
                <Text style={styles.navText}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() =>
                  setSelectedIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))
                }>
                <Text style={styles.navText}>›</Text>
              </TouchableOpacity>
            </View>
          )}
        </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    paddingBottom: 16,
  },
  thumbnailContainer: {
    margin: 2,
    flex: 1 / 3,
  },
  thumbnail: {
    width: '100%',
    height: 120,
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  fullImage: {
    width: screenWidth,
    height: screenWidth,
  },
  counterContainer: {
    marginTop: 16,
  },
  counterText: {
    color: 'white',
    fontSize: 18,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    position: 'absolute',
    top: '50%',
  },
  navButton: {
    padding: 10,
  },
});

export default ImageGalleryScreen;
