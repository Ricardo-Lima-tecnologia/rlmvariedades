/**
 * auth.js — Substituto do base44.auth
 * Usa Supabase Auth.
 *
 * Uso:
 *   import { auth } from '@/lib/auth';
 *   auth.me()
 *   auth.isAuthenticated()
 *   auth.logout()
 *   auth.redirectToLogin()
 */

import { supabase } from './supabaseClient';

export const auth = {
  async me() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email,
      role: user.user_metadata?.role || 'user',
    };
  },

  async isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  async logout(redirectUrl = '/') {
    await supabase.auth.signOut();
    window.location.href = redirectUrl;
  },

  redirectToLogin(nextUrl) {
    const redirect = nextUrl || window.location.href;
    window.location.href = `/login?next=${encodeURIComponent(redirect)}`;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};