/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth'; // Import Firebase Auth
import useScreenOrientation from './orientationHook';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // useScreenOrientation('portrait'); // Lock to portrait

  const handleSignIn = async () => {
    const sanitizedEmail = email.trim();
    const sanitizedPassword = password.trim();
    console.log('Email:', sanitizedEmail);
    console.log('Password:', sanitizedPassword);

    if (!sanitizedEmail || !sanitizedPassword) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      // Firebase Sign-In
      await auth().signInWithEmailAndPassword(email, password);
      Alert.alert('Success', 'You have successfully signed in!');
      // Navigate to your home screen or desired screen
    } catch (error: any) {
      console.error('Sign-In Error:', error);
      // Handle errors based on Firebase error codes
      if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'The email address is badly formatted.');
      } else if (error.code === 'auth/user-not-found') {
        Alert.alert('User Not Found', 'No user found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('Incorrect Password', 'The password is incorrect.');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}></Text>
      </View>

      <View style={styles.loginContainer}>
        <Text style={styles.loginHeader}>Login to your account</Text>
        <Text style={styles.emailText}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          value={email}
          autoCapitalize="none"
          onChangeText={setEmail}
        />
        <Text style={styles.passwordText}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your Password"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity>
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleSignIn}
          disabled={loading}>
          <Text style={styles.loginButtonText}>
            {loading ? 'Signing In...' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0066cc',
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
    color: '#fff',
  },
  loginContainer: {
    backgroundColor: '#fff',
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
    color: 'rgba(86,86,86,1)',
  },
  emailText: {
    color: 'rgba(86,86,86,1)',
    textAlign: 'left',
    fontWeight: 'bold',
    left: 4,
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgb(195, 195, 195)',
    borderRadius: 9,
    paddingHorizontal: 10,
    marginBottom: 5,
    height: '8%',
    color: 'black',
  },
  passwordText: {
    color: 'rgba(86,86,86,1)',
    textAlign: 'left',
    fontWeight: 'bold',
    left: 4,
    marginVertical: 2,
  },
  linkText: {
    color: '#0066cc',
    textAlign: 'right',
    marginBottom: '5.3%',
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#f56300',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    height: '8%',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'semibold',
    fontSize: 16,
  },
});

export default LoginPage;
