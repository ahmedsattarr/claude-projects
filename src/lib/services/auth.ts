import supabase from '../supabaseClient';

export const AuthService = {
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  isAuthenticated(): boolean {
    // Quick check from local storage (synchronous)
    const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
    if (!key) return false;
    try {
      const token = JSON.parse(localStorage.getItem(key) || '{}');
      return !!token?.access_token;
    } catch {
      return false;
    }
  },
};
