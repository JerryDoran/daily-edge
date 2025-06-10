/* eslint-disable react-hooks/exhaustive-deps */
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoadingUser } = useAuth();
  // const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    // setIsLoading(false);
    const inAuthGroup = segments[0] === 'auth';
    if (!user && !inAuthGroup && !isLoadingUser) {
      // Redirect to login screen
      router.replace('/auth');
    } else if (user && inAuthGroup && !isLoadingUser) {
      // Redirect away from login screen
      router.replace('/');
    }
  }, [isLoadingUser, user, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider>
        <SafeAreaProvider>
          <RouteGuard>
            <Stack>
              <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
            </Stack>
          </RouteGuard>
        </SafeAreaProvider>
      </PaperProvider>
    </AuthProvider>
  );
}
