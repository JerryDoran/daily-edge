import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: '#999999',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => {
            return focused ? (
              <Ionicons name='home' size={24} color={color} />
            ) : (
              <Ionicons name='home-outline' size={24} color={color} />
            );
          },
        }}
      />
      <Tabs.Screen name='login' options={{ title: 'Login' }} />
    </Tabs>
  );
}
