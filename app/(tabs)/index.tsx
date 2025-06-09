import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edge Daily</Text>
      <Text>Plant small habits, grow a better life.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  nav: {
    marginVertical: 10,
    color: 'white',
    fontSize: 16,
    backgroundColor: 'black',
    padding: 10,
    textAlign: 'center',
    width: '25%',
    borderRadius: 5,
  },
});
