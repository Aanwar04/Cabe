import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';

// Components
import MainPage from './src/MainPage';
import CameraScreen from './src/CameraScreen';
import LoginPage from './src/LoginPage';
import SignUpScreen from './src/SignUpScreen';
import unAuthorized from './src/unAuthorized';
import TabScreens from './src/TabScreens';
import CameraPreview from './src/CameraPreview';
import CarDetailsScreen from './src/CarDetailsScreen';
import ImageGalleryScreen from './src/ImageGalleryScreen';
import { ThemeProvider } from './src/context/ThemeContext';
import { OfflineProvider } from './src/context/OfflineContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { LoadingScreen } from './src/components/LoadingSpinner';

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  const [user, setUser] = useState<{ email: string | null; uid: string } | null>(null);
  const [isDealerAdmin, setIsDealerAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async currentUser => {
      try {
        setLoading(true);

        if (currentUser) {
          const tokenResult = await currentUser.getIdTokenResult();
          console.log('Token Results:', tokenResult);

          if (tokenResult.claims.dealeradmin) {
            setIsDealerAdmin(true);
            setUser({
              email: currentUser.email,
              uid: currentUser.uid,
            });
          } else {
            throw new Error('Unauthorized');
          }
        } else {
          setIsDealerAdmin(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Authentication Error:', error);
        setIsDealerAdmin(false);
        setUser(null);
        Alert.alert('Unauthorized', 'You are not authorized to access this app.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  return (
    <ThemeProvider>
      <OfflineProvider>
        <ErrorBoundary>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}
            >
              {!user ? (
                <>
                  <Stack.Screen
                    name="LoginPage"
                    component={LoginPage}
                    options={{ title: 'Login' }}
                  />
                  <Stack.Screen
                    name="SignUpScreen"
                    component={SignUpScreen}
                    options={{ title: 'Sign Up' }}
                  />
                </>
              ) : isDealerAdmin ? (
                <>
                  <Stack.Screen name="Tab" component={TabScreens} />
                  <Stack.Screen name="CameraPreview" component={CameraPreview} />
                  <Stack.Screen name="CameraScreen" component={CameraScreen} />
                  <Stack.Screen
                    name="CarDetails"
                    component={CarDetailsScreen}
                    options={{ title: 'Car Details' }}
                  />
                  <Stack.Screen
                    name="ImageGallery"
                    component={ImageGalleryScreen}
                    options={{ title: 'Gallery' }}
                  />
                </>
              ) : (
                <Stack.Screen
                  name="unAuthorized"
                  component={unAuthorized}
                  options={{ title: 'unAuthorized' }}
                />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </ErrorBoundary>
      </OfflineProvider>
    </ThemeProvider>
  );
};

export default App;
