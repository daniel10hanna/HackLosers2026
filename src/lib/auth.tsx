import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

// One client for sign-in. The session is kept on the phone so you stay signed in after a restart.
export const authClient: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
      })
    : null;

type Result = { error: string | null; needsConfirmation?: boolean };

interface AuthState {
  configured: boolean;
  ready: boolean;
  session: Session | null;
  email: string | null;
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (email: string, password: string) => Promise<Result>;
  signOut: () => Promise<void>;
}

const notConfigured: Result = { error: "Sign-in isn't set up yet: add the Supabase URL and key to .env.local." };

const fallback: AuthState = {
  configured: false,
  ready: true,
  session: null,
  email: null,
  signIn: async () => notConfigured,
  signUp: async () => notConfigured,
  signOut: async () => {},
};

const AuthContext = createContext<AuthState | null>(null);

function friendly(message: string): string {
  if (/invalid login credentials/i.test(message)) return "Wrong email or password.";
  if (/email not confirmed/i.test(message)) return "Confirm your email first. Check your inbox.";
  if (/already registered/i.test(message)) return "That email already has an account. Log in instead.";
  if (/password/i.test(message) && /6/.test(message)) return "Password must be at least 6 characters.";
  if (/network|fetch/i.test(message)) return "No connection. Check your internet and try again.";
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!authClient);

  useEffect(() => {
    if (!authClient) return;
    let active = true;
    authClient.auth
      .getSession()
      .then(({ data }) => active && setSession(data.session))
      .finally(() => active && setReady(true));
    const { data } = authClient.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(() => {
    if (!authClient) return fallback;
    const client = authClient;
    return {
      configured: true,
      ready,
      session,
      email: session?.user.email ?? null,
      signIn: async (email, password) => {
        const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
        return { error: error ? friendly(error.message) : null };
      },
      signUp: async (email, password) => {
        const { data, error } = await client.auth.signUp({ email: email.trim(), password });
        if (error) return { error: friendly(error.message) };
        return { error: null, needsConfirmation: !data.session };
      },
      signOut: async () => {
        await client.auth.signOut();
      },
    };
  }, [ready, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Safe anywhere: outside the provider it reports "not configured" instead of throwing. */
export function useAuth(): AuthState {
  return useContext(AuthContext) ?? fallback;
}
