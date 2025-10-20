import { supabase } from '../supabase';

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getPromoCodes() {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching promo codes:', error);
    throw error;
  }

  return data || [];
}

export async function getPromoCodeById(id: string) {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching promo code:', error);
    return null;
  }

  return data;
}

export async function getPromoCodeByCode(code: string) {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .maybeSingle();

  if (error) {
    console.error('Error fetching promo code by code:', error);
    return null;
  }

  return data;
}

export async function validatePromoCode(code: string, orderAmount: number) {
  const promoCode = await getPromoCodeByCode(code);

  if (!promoCode) {
    return { valid: false, error: 'Промокод не знайдено' };
  }

  if (!promoCode.is_active) {
    return { valid: false, error: 'Промокод неактивний' };
  }

  const now = new Date();
  const validFrom = new Date(promoCode.valid_from);
  const validUntil = new Date(promoCode.valid_until);

  if (now < validFrom) {
    return { valid: false, error: 'Промокод ще не активний' };
  }

  if (now > validUntil) {
    return { valid: false, error: 'Промокод прострочений' };
  }

  if (promoCode.usage_limit && promoCode.used_count >= promoCode.usage_limit) {
    return { valid: false, error: 'Промокод вичерпано' };
  }

  if (promoCode.min_order_amount && orderAmount < promoCode.min_order_amount) {
    return {
      valid: false,
      error: `Мінімальна сума замовлення: ${promoCode.min_order_amount} грн`
    };
  }

  let discountAmount = 0;

  if (promoCode.discount_type === 'percentage') {
    discountAmount = (orderAmount * promoCode.discount_value) / 100;

    if (promoCode.max_discount_amount && discountAmount > promoCode.max_discount_amount) {
      discountAmount = promoCode.max_discount_amount;
    }
  } else {
    discountAmount = promoCode.discount_value;
  }

  return {
    valid: true,
    promoCode,
    discountAmount: Math.min(discountAmount, orderAmount)
  };
}

export async function createPromoCode(promoCode: Partial<PromoCode>) {
  const code = promoCode.code?.toUpperCase() || '';

  const existing = await getPromoCodeByCode(code);
  if (existing) {
    throw new Error('Промокод з таким кодом вже існує');
  }

  const { data, error } = await supabase
    .from('promo_codes')
    .insert({
      ...promoCode,
      code,
      used_count: 0
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating promo code:', error);
    throw error;
  }

  return data;
}

export async function updatePromoCode(id: string, promoCode: Partial<PromoCode>) {
  if (promoCode.code) {
    const code = promoCode.code.toUpperCase();
    const existing = await getPromoCodeByCode(code);
    if (existing && existing.id !== id) {
      throw new Error('Промокод з таким кодом вже існує');
    }
    promoCode.code = code;
  }

  const { data, error } = await supabase
    .from('promo_codes')
    .update(promoCode)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating promo code:', error);
    throw error;
  }

  return data;
}

export async function deletePromoCode(id: string) {
  const { error } = await supabase
    .from('promo_codes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting promo code:', error);
    throw error;
  }
}

export async function incrementPromoCodeUsage(code: string) {
  const promoCode = await getPromoCodeByCode(code);

  if (!promoCode) {
    throw new Error('Промокод не знайдено');
  }

  const { error } = await supabase.rpc('increment_promo_code_usage', {
    promo_code_id: promoCode.id
  });

  if (error) {
    console.error('Error incrementing promo code usage:', error);
    throw error;
  }
}

export async function togglePromoCodeActive(id: string, isActive: boolean) {
  const { data, error } = await supabase
    .from('promo_codes')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling promo code active:', error);
    throw error;
  }

  return data;
}

export async function getPromoCodeStats() {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*');

  if (error) {
    console.error('Error fetching promo code stats:', error);
    throw error;
  }

  const promoCodes = data || [];

  const stats = {
    total: promoCodes.length,
    active: promoCodes.filter(p => p.is_active).length,
    expired: promoCodes.filter(p => new Date(p.valid_until) < new Date()).length,
    used: promoCodes.filter(p => p.used_count > 0).length,
    totalUsageCount: promoCodes.reduce((sum, p) => sum + p.used_count, 0)
  };

  return stats;
}
