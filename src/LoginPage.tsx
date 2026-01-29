/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import useScreenOrientation from './orientationHook';
import { Button, Input } from './components/Button';
import { validateForm, validators } from './utils/validation';
import { useTheme } from './context/ThemeContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // useScreenOrientation('portrait');

  const { theme } = useTheme();

  const handleSignIn = async () => {
    // Validate form
    const validation = validateForm({
      email: { value: email, rules: [validators.required(), validators.email()] },
      password: { value: password, rules: [validators.required()] },
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await auth().signInWithEmailAndPassword(email, password);
      Alert.alert('Success', 'You have successfully signed in!');
    } catch (error: unknown) {
      console.error('Sign-In Error:', error);
      let errorMessage = 'An unexpected error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/invalid-email') {
          Alert.alert('Invalid Email', 'The email address is badly formatted.');
          return;
        } else if (firebaseError.code === 'auth/user-not-found') {
          Alert.alert('User Not Found', 'No user found with this email.');
          return;
        } else if (firebaseError.code === 'auth/wrong-password') {
          Alert.alert('Incorrect Password', 'The password is incorrect.');
          return;
        }
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.logoContainer}>
        <Text style={[styles.logoText, { color: theme.colors.text }]}></Text>
      </View>

      <View style={[styles.loginContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={styles.loginHeader}>Login to your account</Text>

        <Input
          value={email}
          onChangeText={text => {
            setEmail(text);
            if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
          }}
          placeholder="Enter your email"
          keyboardType="email-address"
          label="Email"
          error={errors.email}
        />

        <Input
          value={password}
          onChangeText={text => {
            setPassword(text);
            if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
          }}
          placeholder="Enter your Password"
          secureTextEntry={true}
          label="Password"
          error={errors.password}
        />

        <View style={styles.forgotPasswordContainer}>
          <Text style={[styles.linkText, { color: theme.colors.secondary }]}>Forgot Password?</Text>
        </View>

        <Button
          title={loading ? 'Signing In...' : 'Login'}
          onPress={handleSignIn}
          loading={loading}
          style={styles.loginButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    width: '100%',
    height: '35%',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loginContainer: {
    paddingHorizontal: '5%',
    borderRadius: 12,
    width: '100%',
    height: '65%',
  },
  loginHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: '10%',
    marginBottom: '18%',
    textAlign: 'center',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: '5.3%',
  },
  linkText: {
    fontWeight: 'bold',
  },
  loginButton: {
    marginTop: 10,
  },
});

export default LoginPage;
