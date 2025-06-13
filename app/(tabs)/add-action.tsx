import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, TextInput } from 'react-native-paper';

const FREQUENCIES = ['daily', 'weekly', 'monthly'];
type Frequency = (typeof FREQUENCIES)[number];

export default function AddActionScreen() {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [frequency, setFrequency] = useState<Frequency>('daily');

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.headerLogo}
        resizeMode='contain'
      />
      <TextInput
        style={styles.input}
        onChangeText={setTitle}
        label='Tile'
        mode='outlined'
      />
      <TextInput
        style={styles.input}
        onChangeText={setDescription}
        label='Description'
        mode='outlined'
      />
      <View style={styles.frequencyContainer}>
        <SegmentedButtons
          value={frequency}
          onValueChange={(value) => setFrequency(value)}
          buttons={FREQUENCIES.map((freq) => ({
            value: freq,
            label: freq.charAt(0).toUpperCase() + freq.slice(1),
          }))}
          theme={{ colors: { primary: 'green' } }}
        />
      </View>
      <Button mode='contained' style={styles.addButton}>
        Add Action
      </Button>
    </View>
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
  },
  frequencyContainer: {
    marginBottom: 24,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#704229',
    alignSelf: 'center',
    width: '50%',
  },
  headerLogo: {
    width: 350,
    height: 150,
    marginBottom: 15,
  },
});
