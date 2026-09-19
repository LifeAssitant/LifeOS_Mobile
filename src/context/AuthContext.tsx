import * as Linking from "expo-linking";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  api,
  clearTokens,
  getAccessToken,
  saveTokens,
  User,
} from "../api/client";
import { isSupabaseConfigured, sessionFromDeepLink, startGoogleOAuth } from "../supabase";

type AuthState = {
  user: User | null;
  loading: boolean;
  offlineHint: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setOfflineHint: (msg: string | null) => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [offlineHint, setOfflineHint] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const me = await api.me();
      setUser(me);
      setOfflineHint(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      if (message.toLowerCase().includes("network") || message.includes("Failed")) {
        setOfflineHint("We’ll sync when you’re back.");
      }
      throw err;
    }
  }, []);

  const finishGoogleSession = useCallback(
    async (accessToken: string) => {
      const tokens = await api.loginWithGoogle(accessToken);
      await saveTokens(tokens);
      await refreshUser();
    },
    [refreshUser]
  );

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (token) await refreshUser();
      } catch {
        await clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUser]);

  useEffect(() => {
    const handleUrl = async (url: string) => {
      try {
        if (url.includes("calendar-connected")) {
          // Settings screen listens via focus refresh; broadcast for sync.
          return;
        }
        if (!url.includes("auth")) return;
        if (!isSupabaseConfigured()) return;
        const session = await sessionFromDeepLink(url);
        if (session?.access_token) {
          await finishGoogleSession(session.access_token);
        }
      } catch (err) {
        setOfflineHint(err instanceof Error ? err.message : "Google sign-in failed");
      }
    };

    const sub = Linking.addEventListener("url", ({ url }) => {
      void handleUrl(url);
    });
    void Linking.getInitialURL().then((url) => {
      if (url) void handleUrl(url);
    });
    return () => sub.remove();
  }, [finishGoogleSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await api.login(email.trim(), password);
      await saveTokens(tokens);
      await refreshUser();
    },
    [refreshUser]
  );

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const tokens = await api.register(email.trim(), password, name);
      await saveTokens(tokens);
      await refreshUser();
    },
    [refreshUser]
  );

  const loginWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      throw new Error("Add supabaseUrl and supabaseAnonKey to app.json expo.extra");
    }
    const session = await startGoogleOAuth();
    if (!session?.access_token) {
      throw new Error("Google sign-in was cancelled");
    }
    await finishGoogleSession(session.access_token);
  }, [finishGoogleSession]);

  const logout = useCallback(async () => {
    await clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      offlineHint,
      login,
      register,
      loginWithGoogle,
      logout,
      refreshUser,
      setOfflineHint,
    }),
    [user, loading, offlineHint, login, register, loginWithGoogle, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
