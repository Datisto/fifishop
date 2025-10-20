import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';
import { supabase } from '../supabase';

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
    .select('*, product_images(id, image_url, alt_text, sort_order)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (published !== undefined) {
    query = query.eq('is_published', published);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return {
    products: data || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getProductById(id: string) {
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (productError) {
    console.error('Error fetching product:', productError);
    return null;
  }

  const { data: product_images } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', id)
    .order('sort_order');

  const { data: product_categories } = await supabase
    .from('product_categories')
    .select('category_id')
    .eq('product_id', id);

  return {
    ...product,
    product_images: product_images || [],
    product_categories: product_categories || []
  };
}

export async function createProduct(product: Partial<Product>) {
  const slug = generateSlug(product.name || '');

  const { data, error } = await supabase
    .from('products')
    .insert({
      ...product,
      slug,
      specifications: product.specifications || {}
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return data;
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return data;
}

export async function deleteProduct(id: string) {
  const product = await getProductById(id);

  if (product?.product_images) {
    for (const image of product.product_images) {
      await deleteProductImage(image.id);
    }
  }

  const { error: categoriesError } = await supabase
    .from('product_categories')
    .delete()
    .eq('product_id', id);

  if (categoriesError) {
    console.error('Error deleting product categories:', categoriesError);
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

export async function toggleProductPublished(id: string, isPublished: boolean) {
  const { data, error } = await supabase
    .from('products')
    .update({ is_published: isPublished })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling product published:', error);
    throw error;
  }

  return data;
}

export async function uploadProductImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const storageRef = ref(storage, `product-images/${fileName}`);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
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
      sort_order: sortOrder
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding product image:', error);
    throw error;
  }

  return data;
}

export async function deleteProductImage(imageId: string) {
  const { data: imageData, error: fetchError } = await supabase
    .from('product_images')
    .select('image_url')
    .eq('id', imageId)
    .single();

  if (!fetchError && imageData?.image_url && imageData.image_url.includes('firebase')) {
    try {
      const imagePath = decodeURIComponent(imageData.image_url.split('/o/')[1].split('?')[0]);
      const imageStorageRef = ref(storage, imagePath);
      await deleteObject(imageStorageRef);
    } catch (error) {
      console.error('Error deleting image from Firebase storage:', error);
    }
  }

  const { error } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId);

  if (error) {
    console.error('Error deleting product image:', error);
    throw error;
  }
}

export async function setProductCategories(productId: string, categoryIds: string[]) {
  await supabase
    .from('product_categories')
    .delete()
    .eq('product_id', productId);

  if (categoryIds.length > 0) {
    const inserts = categoryIds.map(category_id => ({
      product_id: productId,
      category_id: category_id
    }));

    const { error } = await supabase
      .from('product_categories')
      .insert(inserts);

    if (error) {
      console.error('Error setting product categories:', error);
      throw error;
    }
  }
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
