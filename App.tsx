import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth'; // Import Firebase auth
import MainPage from './src/MainPage';
import CameraScreen from './src/CameraScreen';
import LoginPage from './src/LoginPage';
import {Alert} from 'react-native';
import unAuthorized from './src/unAuthorized';
import TabScreens from './src/TabScreens';
import CameraPreview from './src/CameraPreview';

const Stack = createNativeStackNavigator();

const App = () => {
  const [user, setUser] = useState(null); // Track authenticated user
  const [isDealerAdmin, setIsDealerAdmin] = useState(false); // Track dealer admin status
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = auth().onAuthStateChanged(async currentUser => {
      try {
        setLoading(true);

        if (currentUser) {
          // Get the user's ID token and claims
          const tokenResult = await currentUser.getIdTokenResult();
          console.log('Token Results:', tokenResult);

          // Check if the dealeradmin claim is true
          if (tokenResult.claims.dealeradmin) {
            setIsDealerAdmin(true);
            setUser({
              email: currentUser.email,
              uid: currentUser.uid,
            });
          } else {
            throw new Error('Unauthorized'); // User is not a dealer admin
          }
        } else {
          setIsDealerAdmin(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Authentication Error:', error);
        setIsDealerAdmin(false);
        setUser(null);
        Alert.alert(
          'Unauthorized',
          'You are not authorized to access this app.',
        );
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Clean up the listener
  }, []);

  if (loading) {
    // Show a loading spinner or placeholder while checking authentication
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Remove title headers from all screens
        }}>
        {!user ? (
          <Stack.Screen
            name="LoginPage"
            component={LoginPage}
            options={{title: 'Login'}}
          />
        ) : isDealerAdmin ? (
          <>
            <Stack.Screen name="Tab" component={TabScreens} />
            <Stack.Screen name="CameraPreview" component={CameraPreview} />
            <Stack.Screen name="CameraScreen" component={CameraScreen} />
          </>
        ) : (
          <Stack.Screen
            name="unAuthorized"
            component={unAuthorized}
            options={{title: 'unAuthorized'}}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
