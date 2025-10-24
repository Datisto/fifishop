import { supabase, logAdminAction } from './supabase';

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

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export async function getCategories(publishedOnly: boolean = false) {
  let query = supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (publishedOnly) {
    query = query.eq('is_published', true);
  }

  const { data, error } = await query;

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

export async function createCategory(category: Partial<Category>) {
  const slug = await generateUniqueSlug(category.name || '', null);

  const { data, error } = await supabase
    .from('categories')
    .insert({
      ...category,
      slug,
    })
    .select()
    .single();

  if (error) throw error;

  await logAdminAction('create_category', 'category', data.id, { name: category.name });

  return data;
}

export async function updateCategory(id: string, category: Partial<Category>) {
  const updateData = { ...category };

  if (category.name) {
    updateData.slug = await generateUniqueSlug(category.name, id);
  }

  const { data, error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction('update_category', 'category', id, { name: category.name });

  return data;
}

export async function deleteCategory(id: string) {
  const category = await getCategoryById(id);

  const { data: children } = await supabase
    .from('categories')
    .select('id')
    .eq('parent_id', id);

  if (children && children.length > 0) {
    throw new Error('Неможливо видалити категорію, що має підкатегорії');
  }

  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) throw error;

  await logAdminAction('delete_category', 'category', id, { name: category?.name });
}

export async function toggleCategoryPublished(id: string, isPublished: boolean) {
  const { data, error } = await supabase
    .from('categories')
    .update({ is_published: isPublished })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction(
    isPublished ? 'publish_category' : 'unpublish_category',
    'category',
    id,
    { name: data.name }
  );

  return data;
}

export async function uploadCategoryIcon(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);

  return data.publicUrl;
}

export async function updateCategoriesOrder(categories: Array<{ id: string; sort_order: number; parent_id: string | null }>) {
  for (const cat of categories) {
    await supabase
      .from('categories')
      .update({ sort_order: cat.sort_order, parent_id: cat.parent_id })
      .eq('id', cat.id);
  }

  await logAdminAction('reorder_categories', 'category', null, { count: categories.length });
}

export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const categoryMap = new Map<string, CategoryTreeNode>();
  const rootCategories: CategoryTreeNode[] = [];

  categories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  categories.forEach((cat) => {
    const node = categoryMap.get(cat.id)!;
    if (cat.parent_id) {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children.push(node);
      } else {
        rootCategories.push(node);
      }
    } else {
      rootCategories.push(node);
    }
  });

  return rootCategories;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function generateUniqueSlug(name: string, excludeId: string | null = null): Promise<string> {
  const baseSlug = generateSlug(name);

  if (!baseSlug) {
    return 'category';
  }

  let slug = baseSlug;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    let query = supabase
      .from('categories')
      .select('id')
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;

    if (!data) {
      isUnique = true;
    } else {
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }

  return slug;
}

export async function checkSlugAvailability(name: string, excludeId: string | null = null): Promise<{ available: boolean; suggestedSlug: string }> {
  const baseSlug = generateSlug(name);

  let query = supabase
    .from('categories')
    .select('id')
    .eq('slug', baseSlug);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data } = await query.maybeSingle();
  const available = !data;
  const suggestedSlug = available ? baseSlug : await generateUniqueSlug(name, excludeId);

  return { available, suggestedSlug };
}
