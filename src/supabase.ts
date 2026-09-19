import Constants from "expo-constants";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";

WebBrowser.maybeCompleteAuthSession();

type Extra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

function getExtra(): Extra {
  return (Constants.expoConfig?.extra as Extra) || {};
}

let client: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  const { supabaseUrl, supabaseAnonKey } = getExtra();
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabase(): SupabaseClient {
  const { supabaseUrl, supabaseAnonKey } = getExtra();
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Set expo.extra.supabaseUrl and supabaseAnonKey in app.json"
    );
  }
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return client;
}

export function parseAuthDeepLink(url: string): URLSearchParams {
  const normalized = url.replace(/^lifeos:\/\//i, "https://lifeos.local/");
  const parsed = new URL(normalized);
  const params = new URLSearchParams(parsed.search);
  if (parsed.hash && parsed.hash.length > 1) {
    const hash = parsed.hash.replace(/^#/, "");
    const hashParams = new URLSearchParams(hash);
    hashParams.forEach((value, key) => {
      if (!params.has(key)) params.set(key, value);
    });
  }
  return params;
}

export async function sessionFromDeepLink(url: string): Promise<Session | null> {
  const supabase = getSupabase();
  const params = parseAuthDeepLink(url);
  const code = params.get("code");
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return data.session;
  }
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (access_token && refresh_token) {
    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (error) throw error;
    return data.session;
  }
  return null;
}

export async function startGoogleOAuth(): Promise<Session | null> {
  const supabase = getSupabase();
  const redirectTo = Linking.createURL("auth/callback");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  if (error) throw error;
  if (!data.url) throw new Error("Google sign-in URL missing");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success" || !result.url) return null;
  return sessionFromDeepLink(result.url);
}
