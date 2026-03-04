import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// 1. Context create kiya
const AuthContext = createContext({});

// 2. AuthProvider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gymName, setGymName] = useState("Your Gym");

  useEffect(() => {
    // Session check karne ka function
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        setGymName(currentUser.user_metadata?.gym_name || "Your Gym");
      }
      setLoading(false);
    };

    getSession();

    // Auth status change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        setGymName(currentUser.user_metadata?.gym_name || "Your Gym");
      } else {
        setGymName("Your Gym");
      }
      setLoading(false);
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const signOut = () => supabase.auth.signOut();

  const value = {
    user,
    loading,
    signOut,
    gymName
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook (Iska naam 'useAuth' hi rakha hai taaki baki files na bigde)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};