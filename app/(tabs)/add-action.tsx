import { StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, Text, TextInput } from 'react-native-paper';

const FREQUENCIES = ['daily', 'weekly', 'monthly'];

export default function AddActionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title} variant='headlineSmall'>
        Slight Edge Actions
      </Text>
      <TextInput style={styles.input} label='Tile' mode='outlined' />
      <TextInput style={styles.input} label='Description' mode='outlined' />
      <View style={styles.frequencyContainer}>
        <SegmentedButtons
          buttons={FREQUENCIES.map((freq) => ({
            value: freq,
            label: freq.charAt(0).toUpperCase() + freq.slice(1),
          }))}
          style={styles.segmentedButtons}
        />
      </View>
      <Button style={styles.addButton} mode='contained'>
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
    alignSelf: 'center',
    width: '50%',
  },
});
