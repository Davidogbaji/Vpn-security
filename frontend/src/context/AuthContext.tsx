import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  simulateGuestLogin: (role?: 'user' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isConfigured: false,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
  simulateGuestLogin: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if demo user stored in localStorage
    const savedDemoUser = localStorage.getItem('vpn_demo_user');
    if (savedDemoUser) {
      try {
        setUser(JSON.parse(savedDemoUser));
      } catch {}
    }

    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Supabase session listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        localStorage.setItem('vpn_auth_token', session.access_token);
        fetchUserProfile(session.user.id, session.user.email || '');
      } else if (!savedDemoUser) {
        setUser(null);
        localStorage.removeItem('vpn_auth_token');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        localStorage.setItem('vpn_auth_token', session.access_token);
        fetchUserProfile(session.user.id, session.user.email || '');
      } else if (!localStorage.getItem('vpn_demo_user')) {
        setUser(null);
        localStorage.removeItem('vpn_auth_token');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string, email: string) => {
    if (!supabase) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', userId)
        .single();

      setUser({
        id: userId,
        email,
        fullName: data?.full_name || email.split('@')[0],
        role: data?.role === 'admin' ? 'admin' : 'user',
      });
    } catch {
      setUser({
        id: userId,
        email,
        role: 'user',
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      // Demo authentication simulation
      const demoRole: 'user' | 'admin' = email.includes('admin') ? 'admin' : 'user';
      const demoProfile: UserProfile = {
        id: 'demo-user-id-001',
        email,
        fullName: email.split('@')[0],
        role: demoRole,
      };
      setUser(demoProfile);
      localStorage.setItem('vpn_demo_user', JSON.stringify(demoProfile));
      return {};
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.session) {
      localStorage.setItem('vpn_auth_token', data.session.access_token);
    }
    return {};
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured || !supabase) {
      const demoProfile: UserProfile = {
        id: 'demo-user-id-001',
        email,
        fullName,
        role: 'user',
      };
      setUser(demoProfile);
      localStorage.setItem('vpn_demo_user', JSON.stringify(demoProfile));
      return {};
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };
    if (data.session) {
      localStorage.setItem('vpn_auth_token', data.session.access_token);
    }
    return {};
  };

  const signOut = async () => {
    localStorage.removeItem('vpn_demo_user');
    localStorage.removeItem('vpn_auth_token');
    setUser(null);
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const simulateGuestLogin = (role: 'user' | 'admin' = 'user') => {
    const guestProfile: UserProfile = {
      id: `guest-${Date.now()}`,
      email: role === 'admin' ? 'admin@cybersecurity.lab' : 'researcher@academic.edu',
      fullName: role === 'admin' ? 'Lab Security Administrator' : 'Guest Security Analyst',
      role,
    };
    setUser(guestProfile);
    localStorage.setItem('vpn_demo_user', JSON.stringify(guestProfile));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        simulateGuestLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
