import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';
import { supabase } from '../supabase';

export interface Banner {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  mobile_image_url?: string;
  link_url?: string;
  category_id?: string;
  placement: string;
  sort_order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export async function getBanners(activeOnly: boolean = false) {
  let query = supabase
    .from('banners')
    .select('*')
    .order('sort_order');

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching banners:', error);
    throw error;
  }

  return data || [];
}

export async function getBannerById(id: string) {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching banner:', error);
    return null;
  }

  return data;
}

export async function createBanner(banner: Partial<Banner>) {
  const { data, error } = await supabase
    .from('banners')
    .insert(banner)
    .select()
    .single();

  if (error) {
    console.error('Error creating banner:', error);
    throw error;
  }

  return data;
}

export async function updateBanner(id: string, banner: Partial<Banner>) {
  const { data, error } = await supabase
    .from('banners')
    .update(banner)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating banner:', error);
    throw error;
  }

  return data;
}

export async function deleteBanner(id: string) {
  const banner = await getBannerById(id);

  if (banner?.image_url && banner.image_url.includes('firebase')) {
    try {
      const imagePath = decodeURIComponent(banner.image_url.split('/o/')[1].split('?')[0]);
      const imageStorageRef = ref(storage, imagePath);
      await deleteObject(imageStorageRef);
    } catch (error) {
      console.error('Error deleting banner image from Firebase storage:', error);
    }
  }

  if (banner?.mobile_image_url && banner.mobile_image_url.includes('firebase')) {
    try {
      const imagePath = decodeURIComponent(banner.mobile_image_url.split('/o/')[1].split('?')[0]);
      const imageStorageRef = ref(storage, imagePath);
      await deleteObject(imageStorageRef);
    } catch (error) {
      console.error('Error deleting mobile banner image from Firebase storage:', error);
    }
  }

  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting banner:', error);
    throw error;
  }
}

export async function uploadBannerImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const storageRef = ref(storage, `banners/${fileName}`);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
}

export async function updateBannerSortOrder(banners: { id: string; sort_order: number }[]) {
  for (const banner of banners) {
    await supabase
      .from('banners')
      .update({ sort_order: banner.sort_order })
      .eq('id', banner.id);
  }
}

export async function toggleBannerActive(id: string, isActive: boolean) {
  const { data, error } = await supabase
    .from('banners')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling banner active:', error);
    throw error;
  }

  return data;
}

export async function updateBannersOrder(banners: { id: string; sort_order: number }[]) {
  return updateBannerSortOrder(banners);
}
