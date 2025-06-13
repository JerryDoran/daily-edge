import { useAuth } from '@/lib/auth-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';

export default function AuthScreen() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>('');

  const theme = useTheme();

  const { signIn, signUp } = useAuth();

  async function handleAuth() {
    if (!email || !password) {
      setError('Please fill all the fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError(null);

    if (isSignUp) {
      const error = await signUp(email, password);
      if (error) {
        setError(error);
        return;
      }
    } else {
      const error = await signIn(email, password);
      if (error) {
        setError(error);
        return;
      }
    }
    router.replace('/');
    setEmail('');
    setPassword('');
  }

  function handleSwitchMode() {
    setIsSignUp((prev) => !prev);
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/habit-4.png')}
          style={styles.illustration}
        />
        <Text style={styles.title} variant='headlineMedium'>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Text>
        <TextInput
          style={styles.input}
          label='Email'
          autoCapitalize='none'
          keyboardType='email-address'
          placeholder='johndoe@example.com'
          mode='outlined'
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          label='Password'
          autoCapitalize='none'
          secureTextEntry
          mode='outlined'
          onChangeText={setPassword}
        />

        {/* Errors */}
        {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}

        <Button mode='contained' style={styles.button} onPress={handleAuth}>
          {isSignUp ? 'Create Account' : 'Sign In'}
        </Button>
        <TouchableOpacity onPress={handleSwitchMode}>
          <Text style={styles.switchModeButton}>
            {isSignUp
              ? 'Already have a account? Sign In'
              : "Don't have a account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: .75,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    textAlign: 'center',

    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#704229',
  },
  switchModeButton: {
    marginTop: 16,
    color: '#704229',
    textAlign: 'center',
  },
  illustration: {
    width: 340,
    height: 150,
    resizeMode: 'contain',
  },
});
