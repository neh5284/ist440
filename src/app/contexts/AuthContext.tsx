import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 [AUTH] Initializing auth context...');

    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 [AUTH] Initial session check:', {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
      });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 [AUTH] Auth state changed:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
      });
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 [AUTH] Attempting sign in for:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ [AUTH] Sign in failed:', error);
      throw error;
    }

    console.log('✅ [AUTH] Sign in successful:', {
      userId: data.user?.id,
      email: data.user?.email,
      hasSession: !!data.session,
    });

    setSession(data.session);
    setUser(data.user);
  };

  const signOut = async () => {
    console.log('🔐 [AUTH] Attempting sign out...');

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ [AUTH] Sign out failed:', error);
      throw error;
    }

    console.log('✅ [AUTH] Sign out successful');

    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
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
