import { ACTIONS_COLLECTION_ID, DATABASE_ID, db } from '@/lib/appwrite';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import { ID } from 'react-native-appwrite';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Button, SegmentedButtons, Text, useTheme } from 'react-native-paper';

const FREQUENCIES = ['daily', 'weekly', 'monthly'];
type Frequency = (typeof FREQUENCIES)[number];

export default function AddActionScreen() {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [error, setError] = useState<string>('');
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  async function handleSubmit() {
    if (!user) {
      return;
    }
    try {
      const action = await db.createDocument(
        DATABASE_ID,
        ACTIONS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: user.$id,
          title,
          description,
          frequency,
          streak_count: 0,
          last_completed: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }
      );
      console.log('Action created:', action);
      // Redirect to action detail page
      setTitle('');
      setDescription('');
      setFrequency('daily');
      router.back();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }
      setError('An error occurred creating your slight edge action');
    }
  }

  return (
    <KeyboardAwareScrollView
      style={{
        flex: 1,
      }}
      contentContainerStyle={{
        flexGrow: 1,
      }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={10}
    >
      <View style={styles.container}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.headerLogo}
          resizeMode='contain'
        />
        <TextInput
          style={styles.input}
          onChangeText={setTitle}
          placeholder='Title'
          placeholderTextColor='#98897e'
        />
        <TextInput
          style={styles.input}
          onChangeText={setDescription}
          placeholder='Description'
          multiline
          placeholderTextColor='#a89b91'
        />
        <View style={styles.frequencyContainer}>
          <SegmentedButtons
            value={frequency}
            onValueChange={(value) => setFrequency(value)}
            buttons={FREQUENCIES.map((freq) => ({
              value: freq,
              label: freq.charAt(0).toUpperCase() + freq.slice(1),
              style: {
                backgroundColor: frequency === freq ? '#e4d2c7' : '#f5f5f5',
                color: 'red',
              },
              labelStyle: {
                color: '#704229',
              },
            }))}
            style={styles.segmentedButtons}
          />
        </View>
        <Button
          mode='contained'
          disabled={!title || !description}
          style={styles.addButton}
          labelStyle={{ color: 'white' }}
          onPress={handleSubmit}
        >
          Add Action
        </Button>
        {error && (
          <Text
            style={{
              color: theme.colors.error,
              marginTop: 12,
              textAlign: 'center',
            }}
          >
            {error}
          </Text>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
    alignContent: 'center',
    marginTop: 80,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
    color: '#333333',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4d2c7',
  },
  frequencyContainer: {
    marginBottom: 24,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#704229',
    color: 'white',
    alignSelf: 'center',
    width: '50%',
  },
  headerLogo: {
    width: 350,
    height: 150,
    marginBottom: 15,
  },
});
