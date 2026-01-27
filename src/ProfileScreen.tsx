// import {View, Text, Alert} from 'react-native';
// import React, {useEffect} from 'react';
// import useScreenOrientation from './orientationHook';
// import messaging from '@react-native-firebase/messaging';

// const ProfileScreen = () => {
//   async function requestUserPermission() {
//     const authStatus = await messaging().requestPermission();
//     const enabled =
//       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//       authStatus === messaging.AuthorizationStatus.PROVISIONAL;
//     if (enabled) {
//       console.log('✅ Push notification permission granted!');
//     } else {
//       Alert.alert(
//         'Permission Denied',
//         'Enable push notifications in settings.',
//       );
//     }
//   }
//   const getFcmToken = async () => {
//     try {
//       const token = await messaging().getToken();
//       console.log('📩 FCM Token:', token);
//       // Send this token to your backend for notification targeting
//     } catch (error) {
//       console.error('❌ Error getting FCM Token:', error);
//     }
//   };

//   useEffect(() => {
//     requestUserPermission();
//     getFcmToken();
//   }, []);

//   return (
//     <View>
//       <Text>ProfileScreen</Text>
//     </View>
//   );
// };

// export default ProfileScreen;
import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import {Accelerometer} from 'expo-sensors';

const SensorExample = () => {
  const [data, setData] = useState({x: 0, y: 0, z: 0});

  useEffect(() => {
    const subscribe = () => {
      Accelerometer.setUpdateInterval(1000); // Update every second
      return Accelerometer.addListener(accelerometerData => {
        setData(accelerometerData);
      });
    };

    const subscription = subscribe();
    return () => subscription && subscription.remove();
  }, []);

  return (
    <View>
      <Text>Accelerometer Data:</Text>
      <Text>X: {data.x}</Text>
      <Text>Y: {data.y}</Text>
      <Text>Z: {data.z}</Text>
    </View>
  );
};

export default SensorExample;
