import { supabase, logAdminAction } from './supabase';

export interface Banner {
  id: string;
  title: string;
  image_url: string;
  mobile_image_url: string | null;
  link_url: string | null;
  placement: 'home' | 'category' | 'promo';
  category_id: string | null;
  is_active: boolean;
  sort_order: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export async function getBanners(placement?: string, isActive?: boolean) {
  let query = supabase
    .from('banners')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (placement) {
    query = query.eq('placement', placement);
  }

  if (isActive !== undefined) {
    query = query.eq('is_active', isActive);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getBannerById(id: string) {
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createBanner(banner: Partial<Banner>) {
  const { data, error } = await supabase
    .from('banners')
    .insert(banner)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction('create_banner', 'banner', data.id, { title: banner.title });

  return data;
}

export async function updateBanner(id: string, banner: Partial<Banner>) {
  const { data, error } = await supabase
    .from('banners')
    .update(banner)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction('update_banner', 'banner', id, { title: banner.title });

  return data;
}

export async function deleteBanner(id: string) {
  const banner = await getBannerById(id);

  const { error } = await supabase.from('banners').delete().eq('id', id);

  if (error) throw error;

  await logAdminAction('delete_banner', 'banner', id, { title: banner?.title });
}

export async function toggleBannerActive(id: string, isActive: boolean) {
  const { data, error } = await supabase
    .from('banners')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction(
    isActive ? 'activate_banner' : 'deactivate_banner',
    'banner',
    id,
    { title: data.title }
  );

  return data;
}

export async function uploadBannerImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `banner_${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
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

export async function updateBannersOrder(banners: Array<{ id: string; sort_order: number }>) {
  for (const banner of banners) {
    await supabase
      .from('banners')
      .update({ sort_order: banner.sort_order })
      .eq('id', banner.id);
  }

  await logAdminAction('reorder_banners', 'banner', null, { count: banners.length });
}
