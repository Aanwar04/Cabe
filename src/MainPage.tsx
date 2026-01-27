/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { responsiveHeight } from 'react-native-responsive-dimensions';

const MainPage = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await auth().signOut(); // Sign out the user
      // navigation.navigate('LoginPage'); // Navigate to LoginPage after logout
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const gotoCamera = () => {
    navigation.navigate('CameraScreen');
  };

  return (
    <ImageBackground source={require('./car.jpg')} style={styles.background}>
      <View style={styles.container}>
        <View
          style={{
            width: '100%',
            height: '50%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={styles.header}>Urban Uplink</Text>
        </View>
        <View
          style={{
            width: '100%',
            height: '50%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.createButton} onPress={gotoCamera}>
              <Text style={styles.buttonText}>Create 360</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover', // Ensures the image covers the whole screen
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Adds a dark overlay for better text visibility
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    // marginBottom: 50,
    // textShadowColor: 'rgba(0, 0, 0, 0.5)',
    // textShadowOffset: {width: 2, height: 2},
    // textShadowRadius: 5,
  },
  buttonContainer: {
    // marginTop: 20,
    // backgroundColor: 'red',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    width: '90%',
    height: responsiveHeight(6),
    backgroundColor: '#f56300',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MainPage;
