import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface AuthState {
  userId: string | null;
  ready: boolean;
}

/**
 * Anonymous auth: on app load, ensure we have a session.
 * If not, sign in anonymously. Session is persisted in localStorage by Supabase.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ userId: null, ready: false });

  useEffect(() => {
    const configured = isSupabaseConfigured();
    console.log('Supabase configured:', configured);
    if (!configured) {
      setState({ userId: null, ready: true });
      return;
    }

    let cancelled = false;

    async function init() {
      if (!supabase) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Existing session:', session);
        if (cancelled) return;
        if (session?.user?.id) {
          console.log('User ID:', session.user.id);
          setState({ userId: session.user.id, ready: true });
          return;
        }
        const result = await supabase.auth.signInAnonymously();
        const { data: { user }, error } = result;
        console.log('Anonymous sign in result:', error ? { error } : result);
        if (cancelled) return;
        if (error) {
          setState({ userId: null, ready: true });
          return;
        }
        const userId = user?.id ?? null;
        console.log('User ID:', userId);
        setState({ userId, ready: true });
      } catch (err) {
        console.log('Anonymous sign in result:', { catch: err });
        if (!cancelled) setState({ userId: null, ready: true });
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
