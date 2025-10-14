import { supabase } from './supabase';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  icon_url: string | null;
  is_published: boolean;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  created_at: string;
  updated_at: string;
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getCategoryById(id: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
