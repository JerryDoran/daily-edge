import { createContext, useContext, useEffect, useState } from 'react';
import { ID, Models } from 'react-native-appwrite';
import { account } from './appwrite';

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );

  async function getUser() {
    try {
      const session = await account.get();
      setUser(session);
    } catch (error) {
      setUser(null);
    }
  }

  useEffect(() => {
    getUser();
  }, []);

  async function signUp(email: string, password: string) {
    try {
      await account.create(ID.unique(), email, password);
      await signIn(email, password);
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }

      return 'An error occurred during signup';
    }
  }

  async function signIn(email: string, password: string) {
    try {
      await account.createEmailPasswordSession(email, password);

      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }

      return 'An error occurred during sign in';
    }
  }
  return (
    <AuthContext.Provider value={{ user, signIn, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
