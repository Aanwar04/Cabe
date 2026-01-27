/* eslint-disable react-native/no-inline-styles */

import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
} from 'react-native-vision-camera';
import Orientation from 'react-native-orientation-locker';
import {useNavigation} from '@react-navigation/native';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import useScreenOrientation from './orientationHook';
import Ionicons from 'react-native-vector-icons/Ionicons';
const CameraScreen = () => {
  const {hasPermission, requestPermission} = useCameraPermission();
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoPath, setVideoPath] = useState(null);
  const cameraRef = useRef<Camera>(null);
  // useScreenOrientation('portrait'); // Lock to portrait

  const navigation = useNavigation();
  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [
    {videoAspectRatio: 4 / 3}, // Ensure a 4:3 aspect ratio
    {videoResolution: 'max'}, // Use maximum resolution for 4:3
  ]);
  useEffect(() => {
    const checkAndRequestPermissions = async () => {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Camera permission is required to use this feature. Please enable it in the settings.',
          );
        }
      }
      setPermissionChecked(true);
    };

    checkAndRequestPermissions();

    // Display the guidance alert when the screen loads
    Alert.alert(
      'Guidance',
      'Please keep your mobile in landscape mode and keep the car inside the box.',
      [{text: 'Got it!', style: 'default'}],
    );
  }, [hasPermission, requestPermission]);

  if (!permissionChecked) {
    return (
      <View style={styles.center}>
        <Text>Checking Camera Permissions...</Text>
      </View>
    );
  }
  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>Requesting Camera Permission...</Text>
      </View>
    );
  }
  if (!device) {
    return (
      <View style={styles.center}>
        <Text>No Camera Device Found</Text>
      </View>
    );
  }

  const startRecording = async () => {
    if (cameraRef.current) {
      setIsRecording(true);
      try {
        const video = await cameraRef.current.startRecording({
          onRecordingFinished: video => {
            console.log('Recording finished:', video);
            setVideoPath(video.path);
            navigation.navigate('CameraPreview', {videoPath: video.path});
          },
          onRecordingError: error => {
            console.error('Recording error:', error);
            setIsRecording(false);
          },
        });
      } catch (error) {
        console.error('Failed to start recording:', error);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current) {
      setIsRecording(false);
      await cameraRef.current.stopRecording();
    }
  };
  const goBack = () => {
    navigation.goBack();
  };
  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <View style={{height: '85%', width: '100%'}}>
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            format={format}
            onUIRotationChanged={() => {
              // console.log('triggered');
            }}
            // fps={format.maxFps}
            video={true}
            outputOrientation="device" // Capture in device orientation
            videoStabilizationMode="auto"
          />
          <View style={styles.rectangle} />
          <View
            style={{
              top: 0,
              position: 'absolute',
              width: '100%',
              height: '8%',
              // backgroundColor: 'red',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              onPress={goBack}
              style={{
                height: 30,
                width: 30,
                backgroundColor: '#f56300',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 15,
                left: 12,
              }}>
              <Ionicons name="arrow-back" size={20} />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            height: '15%',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {!isRecording ? (
            <TouchableOpacity onPress={startRecording} style={styles.button}>
              <Text style={styles.buttonText}>Start Shoot</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={stopRecording}
              style={[styles.button, {backgroundColor: 'red'}]}>
              <Text style={styles.buttonText}>Stop Shoot</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    // flexDirection: 'row',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rectangle: {
    position: 'absolute',
    top: responsiveHeight(13),
    left: responsiveWidth(12),
    right: responsiveWidth(12),
    height: responsiveHeight(60),
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
    // backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent background
  },
  camera: {
    flex: 1,
    // aspectRatio: 2, // Force square preview
  },
  button: {
    height: 70,
    width: 70,
    backgroundColor: '#f56300',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'white',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
  },
});
export default CameraScreen;
