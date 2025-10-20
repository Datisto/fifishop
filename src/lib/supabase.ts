import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export async function isUserAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  return profile?.role === 'admin';
}

export async function logAdminAction(
  action: string,
  entityType?: string,
  entityId?: string,
  details?: Record<string, any>
) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log('Admin action:', action, entityType, entityId, details);
    return;
  }

  await supabase.from('admin_logs').insert({
    user_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
    ip_address: null,
  });
}

export async function logLoginAttempt(email: string, success: boolean) {
  await supabase.from('login_attempts').insert({
    email,
    success,
    ip_address: null,
  });
}

export async function checkLoginAttempts(email: string): Promise<number> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .eq('success', false)
    .gte('attempted_at', oneHourAgo);

  if (error) return 0;

  return data?.length || 0;
}
