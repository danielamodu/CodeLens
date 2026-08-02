import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // 1. Check existing session immediately on mount
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error fetching session:', error.message);
      }
      if (isMounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // 2. Listen for auth state changes (e.g. OAuth redirect, SIGNED_IN, SIGNED_OUT)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      alert('Supabase is not configured yet. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app`,
      },
    });
    if (error) {
      console.error('Google Sign-In Error:', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign Out Error:', error.message);
      throw error;
    }
    setUser(null);
  };

  return {
    user,
    signInWithGoogle,
    signOut,
    loading,
  };
}
