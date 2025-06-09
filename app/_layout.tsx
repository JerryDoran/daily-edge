/* eslint-disable react-hooks/exhaustive-deps */
import { AuthProvider } from '@/lib/auth-context';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuth = false;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
    if (!isAuth && !isLoading) {
      // Redirect to login screen
      router.replace('/auth');
    }
  }, [isLoading, isAuth]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteGuard>
        <Stack>
          <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        </Stack>
      </RouteGuard>
    </AuthProvider>
  );
}
