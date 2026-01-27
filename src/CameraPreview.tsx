/* eslint-disable react-native/no-inline-styles */
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Button,
  Alert,
  TouchableOpacity,
  Clipboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import uuid from 'react-native-uuid';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

const CameraPreview = ({route}) => {
  const {videoPath} = route.params;
  const [uploading, setUploading] = useState(false);
  const navigation = useNavigation();

  const user = auth().currentUser;
  if (!user) {
    Alert.alert('Error', 'User not logged in.');
    return;
  }

  const uid = user.uid.toLowerCase(); // Get Firebase UID
  // console.log('userId:', uid);

  const uploadVideo = async () => {
    if (!videoPath) {
      Alert.alert('Error', 'No video file found.');
      return;
    }

    try {
      await fetch('https://www.google.com');
      console.log('Internet is working');
    } catch (error) {
      Alert.alert('No Internet Connection', 'Please check your internet.');
      return;
    }

    setUploading(true);
    const token = await messaging().getToken();
    console.log('📩 FCM Token:', token);

    try {
      const formData = new FormData();
      formData.append('video', {
        uri: `file://${videoPath}`,
        type: 'video/mp4',
        name: 'recorded-video.mp4',
      });
      formData.append('uid', uid);
      formData.append('FCM_token', token);

      const response = await fetch(
        'https://vehicle-180609359384.us-central1.run.app/process_video',
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      const result = await response.json();

      if (result?.download_url) {
        console.log(result.download_url);
        Alert.alert(
          'Upload Successful',
          `Video uploaded successfully!\n\nCopy this URL to download your video:\n\n${result.download_url}`,
          [
            {
              text: 'Copy URL',
              onPress: () => Clipboard.setString(result.download_url),
            },
            {text: 'OK'},
          ],
        );
        navigation.navigate('Tab');
      } else {
        console.log('result',result);
        Alert.alert('Could not create output video from processed frames','Please Try Again');
      }

      console.log(result);
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Upload Failed', 'Something went wrong.');
    } finally {
      setUploading(false);
    }
  };
  const goBack = () => {
    navigation.goBack();
  };

  if (!videoPath) {
    return (
      <View style={styles.center}>
        <Text>No video to display</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Video
        source={{uri: videoPath}}
        style={styles.video}
        controls
        resizeMode="contain"
        repeat
      />
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
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={{
            height: '50%',
            width: '30%',
            backgroundColor: '#f56300',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 20,
          }}
          onPress={uploadVideo}
          disabled={uploading}>
          <Text>{uploading ? 'Uploading...' : 'Upload Video'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    height: '10%',

    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CameraPreview;
