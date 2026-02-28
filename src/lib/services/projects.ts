import supabase from '../supabaseClient';

export interface ContentBlock {
  type: string;
  content?: string;
  src?: string;
  alt?: string;
  images?: string[];
  items?: Array<{ value: string; label: string }>;
  colors?: Array<{ hex: string; name: string }>;
  swatches?: string[];
  caption?: string;
  beforeSrc?: string;
  afterSrc?: string;
  embedUrl?: string;
  layout?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  category?: string;
  tags?: string[];
  year?: number;
  short_desc?: string;
  cover_url?: string;
  featured?: boolean;
  sort_order?: number;
  role_badge?: string;
  timeline?: string;
  external_link?: string;
  content_blocks?: ContentBlock[];
  seo_title?: string;
  seo_desc?: string;
  kind: 'work' | 'personal';
  created_at?: string;
  updated_at?: string;
}

export const ProjectsService = {
  async getAll(kind?: 'work' | 'personal'): Promise<{ data: Project[]; error: unknown }> {
    let q = supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (kind) q = q.eq('kind', kind);

    const { data, error } = await q;
    return { data: data ?? [], error };
  },

  async getPublished(kind?: 'work' | 'personal'): Promise<{ data: Project[]; error: unknown }> {
    let q = supabase
      .from('projects')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (kind) q = q.eq('kind', kind);

    const { data, error } = await q;
    return { data: data ?? [], error };
  },

  async getBySlug(slug: string): Promise<{ data: Project | null; error: unknown }> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    return { data, error };
  },

  async getFeatured(): Promise<{ data: Project | null; error: unknown }> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'published')
      .eq('featured', true)
      .eq('kind', 'work')
      .maybeSingle();
    return { data, error };
  },

  async upsert(project: Partial<Project>): Promise<{ data: unknown; error: unknown }> {
    const payload = {
      ...project,
      updated_at: new Date().toISOString(),
    };

    if (project.id) {
      const { data, error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', project.id)
        .select()
        .maybeSingle();
      return { data, error };
    } else {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ ...payload, created_at: new Date().toISOString() }])
        .select()
        .maybeSingle();
      return { data, error };
    }
  },

  async delete(id: string): Promise<{ error: unknown }> {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    return { error };
  },

  async updateSortOrder(updates: Array<{ id: string; sort_order: number }>): Promise<{ error: unknown }> {
    const promises = updates.map(({ id, sort_order }) =>
      supabase.from('projects').update({ sort_order }).eq('id', id)
    );
    const results = await Promise.all(promises);
    const error = results.find((r) => r.error)?.error ?? null;
    return { error };
  },
};
