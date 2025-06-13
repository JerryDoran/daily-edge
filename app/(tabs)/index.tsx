import { useAuth } from '@/lib/auth-context';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';

export default function HomeScreen() {
  const { signOut } = useAuth();
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/habit-2.png')}
        style={styles.headerLogo}
        resizeMode='contain'
      />
      <Text style={styles.title}>Daily Edge</Text>
      <Text style={{ marginBottom: 10 }}>
        Plant small habits, grow a better life.
      </Text>
      <Button mode='text' onPress={signOut} icon='logout' textColor='#704229'>
        Sign Out
      </Button>
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
  headerLogo: {
    width: 200,
    height: 200,
    marginBottom: 15,
  },
});
