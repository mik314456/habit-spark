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
    if (!isSupabaseConfigured()) {
      setState({ userId: null, ready: true });
      return;
    }

    let cancelled = false;

    async function init() {
      if (!supabase) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        if (session?.user?.id) {
          setState({ userId: session.user.id, ready: true });
          return;
        }
        const { data: { user }, error } = await supabase.auth.signInAnonymously();
        if (cancelled) return;
        if (error) {
          setState({ userId: null, ready: true });
          return;
        }
        setState({ userId: user?.id ?? null, ready: true });
      } catch {
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
