/* eslint-disable react-native/no-inline-styles */
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { responsiveHeight } from 'react-native-responsive-dimensions';
import { Button } from './components/Button';
import { useTheme } from './context/ThemeContext';

const MainPage: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const handleLogout = async (): Promise<void> => {
    try {
      await auth().signOut();
      // navigation.navigate('LoginPage');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const gotoCamera = (): void => {
    navigation.navigate('CameraScreen');
  };

  return (
    <ImageBackground
      source={require('./car.jpg')}
      style={[styles.background, { backgroundColor: theme.colors.overlay }]}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.overlay }]}>
        <View style={styles.topSection}>
          <Text style={[styles.header, { color: theme.colors.text }]}>Urban Uplink</Text>
        </View>
        <View style={styles.bottomSection}>
          <View style={styles.buttonContainer}>
            <Button
              title="Create 360"
              onPress={gotoCamera}
              style={styles.createButton}
              size="large"
            />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  topSection: {
    width: '100%',
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    width: '100%',
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    width: '90%',
    height: responsiveHeight(6),
    borderRadius: 25,
  },
});

export default MainPage;
