/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import RNFS from 'react-native-fs';
import {responsiveHeight, responsiveWidth} from 'react-native-responsive-dimensions';

const BASE_URL = 'https://vehicle-180609359384.us-central1.run.app'; // Base URL

const MyProjects = () => {
  const [filePath, setFilePath] = useState<string>(''); // User enters only the file path
  const [downloadedFilePath, setDownloadedFilePath] = useState<string | null>(
    null,
  );
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const requestMediaPermissions = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        // Android 13+
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        ]);

        if (
          granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] !==
          PermissionsAndroid.RESULTS.GRANTED
        ) {
          Alert.alert(
            'Permission Denied',
            'Cannot access videos without permission.',
          );
          return false;
        }
      } else {
        // Android 12 and below
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Denied',
            'Cannot download video without permission.',
          );
          return false;
        }
      }
    }
    return true;
  };

  const downloadVideo = async () => {
    if (!filePath.trim()) {
      Alert.alert('Error', 'Please enter a valid file path.');
      return;
    }

    const hasPermission = await requestMediaPermissions();
    if (!hasPermission) return;

    // Construct the full download URL
    const fullDownloadUrl = `${BASE_URL}${filePath}`;
    console.log('📥 Full Download URL:', fullDownloadUrl); // Log the full URL

    // Define the Car360 album path
    const albumPath = `${RNFS.DownloadDirectoryPath}`;

    // Ensure the album folder exists
    await RNFS.mkdir(albumPath).catch(err =>
      console.error('Error creating album:', err),
    );

    const fileName =
      filePath.split('/').pop() || `downloaded_video_${Date.now()}.mp4`;
    const filePathToSave = `${albumPath}/${fileName}`;

    setIsDownloading(true); // Start loading indicator

    try {
      const response = await RNFS.downloadFile({
        fromUrl: fullDownloadUrl,
        toFile: filePathToSave,
        background: true,
      }).promise;

      setIsDownloading(false); // Stop loading indicator

      if (response.statusCode === 200) {
        console.log('✅ Downloaded Video Path:', filePathToSave); // Log the saved file path
        Alert.alert('Download Complete', `Video saved to: ${filePathToSave}`);
        setDownloadedFilePath(filePathToSave);
      } else {
        Alert.alert('Download Failed', 'Error downloading the video.');
      }
    } catch (error) {
      setIsDownloading(false);
      console.error('Download Error:', error);
      Alert.alert('Error', 'Something went wrong while downloading the video.');
    }
  };

  return (
    <ImageBackground source={require('./car.jpg')} style={styles.background}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          // padding: 20,
        }}>
        <View
          style={{
            width: '100%',
            height: '50%',
            justifyContent: 'center',
            alignItems: 'center',
            // backgroundColor: 'red',
          }}>
          <Text style={{fontSize: 18, marginBottom: 20, color: 'white'}}>
            Paste Video File Path To Download:
          </Text>

          <TextInput
            style={{
              width: responsiveWidth(90),
              height: 40,
              borderColor: 'white',
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: 10,
              // marginBottom: 10,
              backgroundColor: 'white',
            }}
            placeholderTextColor={'gray'}
            placeholder="Enter file path (e.g., /download_and_delete/output_xxx.mp4)"
            value={filePath}
            onChangeText={setFilePath}
          />
        </View>
        <View
          style={{
            width: '100%',
            height: '50%',
            justifyContent: 'center',
            alignItems: 'center',
            // backgroundColor: 'blue',
          }}>
          {/* <Button title="Download Video" onPress={downloadVideo} /> */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={downloadVideo}>
              <Text style={styles.buttonText}>Download Processed Video</Text>
            </TouchableOpacity>
          </View>
          {isDownloading && (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={{marginTop: 20}}
            />
          )}

          {downloadedFilePath && (
            <Text style={{marginTop: 20, color: '#f56300'}}>
              Video saved at Downloads Folder
            </Text>
          )}
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
  buttonContainer: {
    // marginTop: 20,
    // backgroundColor: 'red',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    width: responsiveWidth(90),
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
export default MyProjects;
