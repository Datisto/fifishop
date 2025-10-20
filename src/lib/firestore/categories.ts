import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { supabase } from '../supabase';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  is_published?: boolean;
  show_in_header: boolean;
  icon_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export async function getCategories(activeOnly: boolean = false) {
  let query = supabase
    .from('categories')
    .select('*')
    .order('sort_order');

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data || [];
}

export async function getCategoryById(id: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }

  return data;
}

export async function createCategory(category: Partial<Category>) {
  const slug = generateSlug(category.name || '');

  const { data, error } = await supabase
    .from('categories')
    .insert({
      ...category,
      slug
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  return data;
}

export async function updateCategory(id: string, category: Partial<Category>) {
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }

  return data;
}

export async function deleteCategory(id: string) {
  const { error: productCategoriesError } = await supabase
    .from('product_categories')
    .delete()
    .eq('category_id', id);

  if (productCategoriesError) {
    console.error('Error deleting product categories:', productCategoriesError);
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

export async function updateCategorySortOrder(categories: { id: string; sort_order: number }[]) {
  for (const category of categories) {
    await supabase
      .from('categories')
      .update({ sort_order: category.sort_order })
      .eq('id', category.id);
  }
}

export async function getHeaderCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('show_in_header', true)
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    console.error('Error fetching header categories:', error);
    throw error;
  }

  return data || [];
}

export async function toggleCategoryPublished(id: string, isPublished: boolean) {
  const { data, error } = await supabase
    .from('categories')
    .update({ is_published: isPublished })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling category published:', error);
    throw error;
  }

  return data;
}

export async function uploadCategoryIcon(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const storageRef = ref(storage, `category-icons/${fileName}`);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
}

export async function updateCategoriesOrder(categories: Array<{ id: string; sort_order: number; parent_id?: string | null }>) {
  for (const cat of categories) {
    await supabase
      .from('categories')
      .update({
        sort_order: cat.sort_order,
        parent_id: cat.parent_id || null
      })
      .eq('id', cat.id);
  }
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
