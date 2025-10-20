import { supabase, logAdminAction } from './supabase';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  full_description: string;
  specifications: Record<string, any>;
  price: number;
  discount_price?: number;
  stock_quantity: number;
  is_published: boolean;
  main_image_url?: string;
  brand: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  created_at: string;
}

export interface ProductCategory {
  product_id: string;
  category_id: string;
}

export async function getProducts(
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  published?: boolean
) {
  let query = supabase
    .from('products')
    .select('*, product_images(id, image_url, sort_order)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
  }

  if (published !== undefined) {
    query = query.eq('is_published', published);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return {
    products: data,
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(*),
      product_categories(category_id)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createProduct(product: Partial<Product>) {
  const slug = generateSlug(product.name || '');

  const { data, error } = await supabase
    .from('products')
    .insert({
      ...product,
      slug,
    })
    .select()
    .single();

  if (error) throw error;

  await logAdminAction('create_product', 'product', data.id, { name: product.name });

  return data;
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction('update_product', 'product', id, { name: product.name });

  return data;
}

export async function deleteProduct(id: string) {
  const product = await getProductById(id);

  if (product?.product_images) {
    for (const image of product.product_images) {
      await deleteProductImage(image.id);
    }
  }

  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) throw error;

  await logAdminAction('delete_product', 'product', id, { name: product?.name });
}

export async function toggleProductPublished(id: string, isPublished: boolean) {
  const { data, error } = await supabase
    .from('products')
    .update({ is_published: isPublished })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction(
    isPublished ? 'publish_product' : 'unpublish_product',
    'product',
    id,
    { name: data.name }
  );

  return data;
}

export async function uploadProductImage(file: File): Promise<string> {
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

export async function addProductImage(
  productId: string,
  imageUrl: string,
  altText: string = '',
  sortOrder: number = 0
) {
  const { data, error } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      image_url: imageUrl,
      alt_text: altText,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProductImage(imageId: string) {
  const { data: image } = await supabase
    .from('product_images')
    .select('image_url')
    .eq('id', imageId)
    .maybeSingle();

  if (image?.image_url) {
    const path = image.image_url.split('/').pop();
    if (path) {
      await supabase.storage.from('product-images').remove([path]);
    }
  }

  const { error } = await supabase.from('product_images').delete().eq('id', imageId);

  if (error) throw error;
}

export async function setProductCategories(productId: string, categoryIds: string[]) {
  await supabase.from('product_categories').delete().eq('product_id', productId);

  if (categoryIds.length > 0) {
    const inserts = categoryIds.map((categoryId) => ({
      product_id: productId,
      category_id: categoryId,
    }));

    const { error } = await supabase.from('product_categories').insert(inserts);

    if (error) throw error;
  }
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
