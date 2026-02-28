import supabase from '../supabaseClient';

const BUCKET = 'projects';

export const StorageService = {
  async upload(file: File, path: string): Promise<{ url: string | null; error: unknown }> {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true });

    if (error) return { url: null, error };

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  },

  async delete(path: string): Promise<{ error: unknown }> {
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    return { error };
  },

  getPublicUrl(path: string): string {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },
};
