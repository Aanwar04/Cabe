/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Button, Input } from './components/Button';
import { validateForm, validators } from './utils/validation';
import { useTheme } from './context/ThemeContext';

const SignUpScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const navigation = useNavigation();
  const { theme } = useTheme();

  const handleSignUp = async () => {
    // Validate form
    const validation = validateForm({
      email: { value: email, rules: [validators.required(), validators.email()] },
      password: { value: password, rules: [validators.required(), validators.minLength(6)] },
      confirmPassword: {
        value: confirmPassword,
        rules: [
          validators.required(),
          validators.match('password', () => password, 'Passwords do not match'),
        ],
      },
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await auth().createUserWithEmailAndPassword(email, password);

      // Update user profile with display name
      if (displayName.trim()) {
        const currentUser = auth().currentUser;
        if (currentUser) {
          await currentUser.updateProfile({ displayName: displayName.trim() });
        }
      }

      Alert.alert('Success', 'Account created successfully!');
      navigation.goBack();
    } catch (error: unknown) {
      console.error('Sign-Up Error:', error);
      let errorMessage = 'An unexpected error occurred.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/email-already-in-use') {
          Alert.alert(
            'Email Already Exists',
            'This email is already registered. Please login instead.'
          );
          return;
        } else if (firebaseError.code === 'auth/invalid-email') {
          Alert.alert('Invalid Email', 'The email address is badly formatted.');
          return;
        } else if (firebaseError.code === 'auth/weak-password') {
          Alert.alert('Weak Password', 'Password should be at least 6 characters.');
          return;
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Enter Email', 'Please enter your email address first.');
      return;
    }

    try {
      await auth().sendPasswordResetEmail(email.trim());
      Alert.alert('Password Reset', 'A password reset link has been sent to your email.');
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string };
        if (firebaseError.code === 'auth/user-not-found') {
          errorMessage = 'No account found with this email address.';
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address.';
        }
      }

      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.header, { color: theme.colors.text }]}>Create Account</Text>

        <Input
          label="Full Name (optional)"
          value={displayName}
          onChangeText={text => {
            setDisplayName(text);
            if (errors.displayName) setErrors(prev => ({ ...prev, displayName: '' }));
          }}
          placeholder="Enter your name"
        />

        <Input
          label="Email"
          value={email}
          onChangeText={text => {
            setEmail(text);
            if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
          }}
          placeholder="Enter your email"
          keyboardType="email-address"
          error={errors.email}
        />

        <Input
          label="Password"
          value={password}
          onChangeText={text => {
            setPassword(text);
            if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
          }}
          placeholder="Create a password"
          secureTextEntry={true}
          error={errors.password}
        />

        <Input
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={text => {
            setConfirmPassword(text);
            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
          }}
          placeholder="Confirm your password"
          secureTextEntry={true}
          error={errors.confirmPassword}
        />

        <Button
          title={loading ? 'Creating Account...' : 'Sign Up'}
          onPress={handleSignUp}
          loading={loading}
          style={styles.signUpButton}
        />

        <View style={styles.divider} />

        <TouchableOpacity onPress={handleResetPassword} style={styles.forgotPassword}>
          <Text style={[styles.linkText, { color: theme.colors.secondary }]}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLink}>
          <Text style={[styles.loginText, { color: theme.colors.text }]}>
            Already have an account? <Text style={{ color: theme.colors.secondary }}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 12,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  signUpButton: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 16,
  },
  linkText: {
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
});

export default SignUpScreen;
