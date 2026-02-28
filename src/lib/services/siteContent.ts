import supabase from '../supabaseClient';

export type SiteContentKey =
  | 'home'
  | 'about'
  | 'contact'
  | 'nav'
  | 'footer'
  | 'photography'
  | 'layout_home'
  | 'layout_about'
  | 'layout_contact'
  | 'layout_work'
  | 'layout_personal';

export interface NavContent {
  links?: Array<{ label: string; href: string }>;
}

export interface FooterContent {
  tagline?: string;
  links?: Array<{ label: string; href: string }>;
}

export interface HomeContent {
  hero_title?: string;
  hero_subtitle?: string;
  hero_cta_label?: string;
  hero_cta_url?: string;
  ticker_items?: string;
  work_title?: string;
  personal_title?: string;
  photo_title?: string;
  cta_title?: string;
  cta_subtitle?: string;
  cta_label?: string;
  cta_url?: string;
}

export interface LayoutContent {
  type?: 'list' | 'grid' | 'bento';
  sections?: string[];
}

export interface PhotographyContent {
  title?: string;
  description?: string;
  images?: Array<{ src: string; alt?: string; width?: number; height?: number }>;
}

export const SiteContentService = {
  async get(key: SiteContentKey): Promise<{ data: unknown; error: unknown }> {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    return { data: data?.value ?? null, error };
  },

  async getMultiple(keys: SiteContentKey[]): Promise<{ data: Record<string, unknown>; error: unknown }> {
    const { data, error } = await supabase
      .from('site_content')
      .select('key, value')
      .in('key', keys);

    const result: Record<string, unknown> = {};
    if (data) {
      for (const row of data) {
        result[row.key] = row.value;
      }
    }
    return { data: result, error };
  },

  async save(key: SiteContentKey, value: unknown): Promise<{ error: unknown }> {
    // Check if row exists
    const { data: existing } = await supabase
      .from('site_content')
      .select('key')
      .eq('key', key)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('site_content')
        .update({ value })
        .eq('key', key);
      return { error };
    } else {
      const { error } = await supabase
        .from('site_content')
        .insert([{ key, value }]);
      return { error };
    }
  },
};

// Default fallback content
export const DEFAULT_NAV: NavContent = {
  links: [
    { label: 'Work', href: '/work' },
    { label: 'Personal', href: '/personal' },
    { label: 'Photography', href: '/photography' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
};

export const DEFAULT_FOOTER: FooterContent = {
  tagline: 'Designer & Digital Marketer',
  links: [
    { label: 'Work', href: '/work' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
};

export const DEFAULT_HOME: HomeContent = {
  hero_title: 'Ahmed Sattar',
  hero_subtitle: 'Designer & Digital Marketer\nbased in Baghdad, Iraq.',
  hero_cta_label: 'View Work',
  hero_cta_url: '/work',
  ticker_items: 'Branding · UI/UX · Digital Marketing · Photography · Visual Identity · Strategy',
  work_title: 'Selected Work',
  personal_title: 'Personal Projects',
  photo_title: 'Photography',
  cta_title: 'Available for new projects',
  cta_subtitle: 'Currently accepting select freelance and full-time opportunities.',
  cta_label: 'Get in touch',
  cta_url: '/contact',
};

export const DEFAULT_LAYOUT_HOME: LayoutContent = {
  sections: ['hero', 'ticker', 'work', 'personal', 'photography', 'cta'],
};

export const DEFAULT_LAYOUT_WORK: LayoutContent = { type: 'grid' };
export const DEFAULT_LAYOUT_PERSONAL: LayoutContent = { type: 'grid' };
