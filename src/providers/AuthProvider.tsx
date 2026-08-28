import type {
  AuthError,
  Session,
  User
} from "@supabase/supabase-js";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  isSupabaseConfigured,
  supabase
} from "../lib/supabase";

type AuthMode = "login" | "register";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  configured: boolean;
  authOpen: boolean;
  authMode: AuthMode;
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
  signIn: (
    email: string,
    password: string
  ) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ needsConfirmation: boolean }>;
  signInWithProvider: (
    provider: "google" | "apple"
  ) => Promise<void>;
  resetPassword: (
    email: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextValue | null>(null);

function throwAuthError(
  error: AuthError | null
) {
  if (error) throw error;
}

export function AuthProvider({
  children
}: {
  children: ReactNode;
}) {
  const [session, setSession] =
    useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] =
    useState(false);
  const [authMode, setAuthMode] =
    useState<AuthMode>("login");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setLoading(false);

        if (nextSession) {
          setAuthOpen(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const openAuth = useCallback(
    (mode: AuthMode = "login") => {
      setAuthMode(mode);
      setAuthOpen(true);
    },
    []
  );

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
  }, []);

  const redirectTo = `${
    import.meta.env.VITE_PUBLIC_SITE_URL ||
    window.location.origin
  }/auth/callback`;

  const signIn = useCallback(
    async (
      email: string,
      password: string
    ) => {
      if (!supabase) {
        throw new Error(
          "Supabase Auth n’est pas configuré."
        );
      }

      const { error } =
        await supabase.auth.signInWithPassword({
          email,
          password
        });

      throwAuthError(error);
    },
    []
  );

  const signUp = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ) => {
      if (!supabase) {
        throw new Error(
          "Supabase Auth n’est pas configuré."
        );
      }

      const { data, error } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo,
            data: {
              full_name: name
            }
          }
        });

      throwAuthError(error);

      return {
        needsConfirmation: !data.session
      };
    },
    [redirectTo]
  );

  const signInWithProvider = useCallback(
    async (provider: "google" | "apple") => {
      if (!supabase) {
        throw new Error(
          "Supabase Auth n’est pas configuré."
        );
      }

      const { error } =
        await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo
          }
        });

      throwAuthError(error);
    },
    [redirectTo]
  );

  const resetPassword = useCallback(
    async (email: string) => {
      if (!supabase) {
        throw new Error(
          "Supabase Auth n’est pas configuré."
        );
      }

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo
          }
        );

      throwAuthError(error);
    },
    [redirectTo]
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;

    const { error } =
      await supabase.auth.signOut();

    throwAuthError(error);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      configured: isSupabaseConfigured,
      authOpen,
      authMode,
      openAuth,
      closeAuth,
      signIn,
      signUp,
      signInWithProvider,
      resetPassword,
      signOut
    }),
    [
      authMode,
      authOpen,
      closeAuth,
      loading,
      openAuth,
      resetPassword,
      session,
      signIn,
      signInWithProvider,
      signOut,
      signUp
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error(
      "useAuth doit être utilisé dans AuthProvider."
    );
  }

  return value;
}
