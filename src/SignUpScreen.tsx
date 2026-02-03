/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
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

const SignUpScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigation = useNavigation();
  const { theme } = useTheme();

  // Calculate password strength
  const getPasswordStrength = (pwd: string): { strength: string; color: string } => {
    if (!pwd) return { strength: '', color: theme.colors.text };
    if (pwd.length < 4) return { strength: 'Weak', color: '#ff4444' };
    if (pwd.length < 8) return { strength: 'Fair', color: '#ff8800' };
    // Check for numbers and special characters
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    if (hasNumber && hasSpecial) return { strength: 'Strong', color: '#00cc00' };
    return { strength: 'Good', color: '#88cc00' };
  };

  const passwordStrength = getPasswordStrength(password);

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
          setLoading(false);
          return;
        } else if (firebaseError.code === 'auth/invalid-email') {
          Alert.alert('Invalid Email', 'The email address is badly formatted.');
          setLoading(false);
          return;
        } else if (firebaseError.code === 'auth/weak-password') {
          Alert.alert('Weak Password', 'Password should be at least 6 characters.');
          setLoading(false);
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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Creating account...
          </Text>
        </View>
      )}

      <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.header, { color: theme.colors.text }]}>Create Account</Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Full Name (optional)</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
            value={displayName}
            onChangeText={text => setDisplayName(text)}
            placeholder="Enter your name"
            placeholderTextColor="#999"
          />
        </View>

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
            keyboardType="email-address"
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
              placeholder="Create a password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Text style={{ color: theme.colors.secondary }}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {password && (
            <View style={styles.passwordStrength}>
              <View style={[styles.strengthBar, { backgroundColor: passwordStrength.color }]} />
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                {passwordStrength.strength}
              </Text>
            </View>
          )}
          {errors.password ? (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.password}</Text>
          ) : null}
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Confirm Password</Text>
          <View
            style={[
              styles.passwordContainer,
              { borderColor: errors.confirmPassword ? theme.colors.error : theme.colors.border },
            ]}
          >
            <TextInput
              style={[styles.passwordInput, { color: theme.colors.text }]}
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
              }}
              placeholder="Confirm your password"
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              <Text style={{ color: theme.colors.secondary }}>
                {showConfirmPassword ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
          {errors.confirmPassword ? (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {errors.confirmPassword}
            </Text>
          ) : null}
        </View>

        <Button
          title={loading ? '' : 'Sign Up'}
          onPress={handleSignUp}
          loading={loading}
          style={styles.signUpButton}
        />

        <TouchableOpacity onPress={handleResetPassword} style={styles.forgotPassword}>
          <Text style={[styles.linkText, { color: theme.colors.secondary }]}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLink}>
          <Text style={[styles.loginText, { color: theme.colors.text }]}>
            Already have an account?{' '}
            <Text style={{ color: theme.colors.secondary, fontWeight: '600' }}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
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
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  signUpButton: {
    marginTop: 16,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
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

export default SignUpScreen;
