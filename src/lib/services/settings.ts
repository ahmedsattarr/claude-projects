/**
 * Settings service
 * EXACT schema: id, accent_color, logo_text, logo_mark_color, font_display,
 * font_body, dark_default, instagram_url, linkedin_url, hero_size, body_size,
 * radius, nav_h, section_pad, card_gap, updated_at
 *
 * CRITICAL: save() must:
 * 1. maybeSingle()
 * 2. update if exists
 * 3. insert if not
 * 4. NEVER chain select().single() after write
 * 5. return { data: payload, error }
 */

import supabase from '../supabaseClient';

export interface Settings {
  id?: string;
  accent_color?: string;
  logo_text?: string;
  logo_mark_color?: string;
  font_display?: string;
  font_body?: string;
  dark_default?: boolean;
  instagram_url?: string;
  linkedin_url?: string;
  hero_size?: string;
  body_size?: string;
  radius?: string;
  nav_h?: string;
  section_pad?: string;
  card_gap?: string;
  updated_at?: string;
}

const ALLOWED_KEYS: (keyof Settings)[] = [
  'accent_color', 'logo_text', 'logo_mark_color', 'font_display', 'font_body',
  'dark_default', 'instagram_url', 'linkedin_url', 'hero_size', 'body_size',
  'radius', 'nav_h', 'section_pad', 'card_gap', 'updated_at',
];

export const SettingsService = {
  async get(): Promise<{ data: Settings | null; error: unknown }> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .maybeSingle();
    return { data, error };
  },

  async save(payload: Partial<Settings>): Promise<{ data: Partial<Settings>; error: unknown }> {
    // Strip any keys not in the allowed list (never add columns)
    const sanitized: Partial<Settings> = {};
    for (const key of ALLOWED_KEYS) {
      if (key in payload) {
        (sanitized as Record<string, unknown>)[key] = (payload as Record<string, unknown>)[key];
      }
    }
    sanitized.updated_at = new Date().toISOString();

    // Step 1: Check if row exists
    const { data: existing, error: fetchError } = await supabase
      .from('settings')
      .select('id')
      .maybeSingle();

    if (fetchError) {
      return { data: payload, error: fetchError };
    }

    let error: unknown = null;

    if (existing?.id) {
      // Step 2: Update existing row
      const { error: updateError } = await supabase
        .from('settings')
        .update(sanitized)
        .eq('id', existing.id);
      error = updateError;
    } else {
      // Step 3: Insert new row
      const { error: insertError } = await supabase
        .from('settings')
        .insert([sanitized]);
      error = insertError;
    }

    // Step 4 & 5: Never chain select().single() after write — return payload directly
    return { data: payload, error };
  },
};
