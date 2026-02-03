/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Button } from './components/Button';
import { validateForm, validators } from './utils/validation';
import { useTheme } from './context/ThemeContext';
import { storage } from './utils/storage';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation();
  const { theme } = useTheme();

  // Load saved credentials on mount
  useEffect(() => {
    const loadSavedCredentials = async () => {
      const savedEmail = await storage.getItem('rememberedEmail');
      const savedPassword = await storage.getItem('rememberedPassword');
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    };
    loadSavedCredentials();
  }, []);

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

      // Handle remember me
      if (rememberMe) {
        await storage.setItem('rememberedEmail', email);
        await storage.setItem('rememberedPassword', password);
      } else {
        await storage.setItem('rememberedEmail', '');
        await storage.setItem('rememberedPassword', '');
      }

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
          setLoading(false);
          return;
        } else if (firebaseError.code === 'auth/user-not-found') {
          Alert.alert('User Not Found', 'No user found with this email.');
          setLoading(false);
          return;
        } else if (firebaseError.code === 'auth/wrong-password') {
          Alert.alert('Incorrect Password', 'The password is incorrect.');
          setLoading(false);
          return;
        }
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Signing in...</Text>
        </View>
      )}

      <View style={styles.logoContainer}>
        <Text style={[styles.logoText, { color: theme.colors.primary }]}>🚗 Car360</Text>
      </View>

      <View style={[styles.loginContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.loginHeader, { color: theme.colors.text }]}>
          Login to your account
        </Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: errors.email ? theme.colors.error : theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            value={email}
            onChangeText={text => {
              setEmail(text);
              if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
            }}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
          {errors.email ? (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.email}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
          <View
            style={[
              styles.passwordContainer,
              { borderColor: errors.password ? theme.colors.error : theme.colors.border },
            ]}
          >
            <TextInput
              style={[styles.passwordInput, { color: theme.colors.text }]}
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
              }}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Text style={{ color: theme.colors.secondary }}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.password}</Text>
          ) : null}
        </View>

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, { borderColor: theme.colors.secondary }]}>
              {rememberMe && <Text style={{ color: theme.colors.secondary }}>✓</Text>}
            </View>
            <Text style={[styles.rememberMeText, { color: theme.colors.text }]}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={[styles.linkText, { color: theme.colors.secondary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          title={loading ? '' : 'Login'}
          onPress={handleSignIn}
          loading={loading}
          style={styles.loginButton}
        />

        <View style={styles.signUpContainer}>
          <Text style={[styles.signUpText, { color: theme.colors.text }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen' as never)}>
            <Text style={[styles.signUpLink, { color: theme.colors.secondary }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  loginContainer: {
    paddingHorizontal: 20,
    borderRadius: 16,
    width: '100%',
    paddingBottom: 40,
  },
  loginHeader: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  rememberMeText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 10,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signUpText: {
    fontSize: 14,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoginPage;
