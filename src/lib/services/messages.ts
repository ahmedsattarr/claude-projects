import supabase from '../supabaseClient';

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read?: boolean;
  created_at?: string;
}

export const MessagesService = {
  async getAll(): Promise<{ data: ContactMessage[]; error: unknown }> {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data ?? [], error };
  },

  async send(msg: Omit<ContactMessage, 'id' | 'read' | 'created_at'>): Promise<{ error: unknown }> {
    const { error } = await supabase.from('contact_messages').insert([{
      ...msg,
      read: false,
      created_at: new Date().toISOString(),
    }]);
    return { error };
  },

  async markRead(id: string): Promise<{ error: unknown }> {
    const { error } = await supabase
      .from('contact_messages')
      .update({ read: true })
      .eq('id', id);
    return { error };
  },

  async delete(id: string): Promise<{ error: unknown }> {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    return { error };
  },
};
