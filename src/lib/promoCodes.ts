import { supabase, logAdminAction } from './supabase';

export interface PromoCode {
  id: string;
  code: string;
  name: string;
  type: 'fixed' | 'percentage' | 'gift' | 'free_shipping';
  discount_value: number;
  gift_product_id?: string;
  min_order_amount: number;
  max_uses_total?: number;
  max_uses_per_user: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  allowed_categories?: string[];
  allowed_users?: string[];
  allow_multiple: boolean;
  created_at: string;
  created_by?: string;
  updated_at: string;
}

export interface PromoCodeUsage {
  id: string;
  promo_code_id: string;
  user_id?: string;
  order_id?: string;
  discount_amount: number;
  session_id: string;
  ip_address?: string;
  used_at: string;
  success: boolean;
  failure_reason?: string;
}

export interface PromoCodeAttempt {
  id: string;
  code: string;
  ip_address: string;
  session_id: string;
  attempted_at: string;
  success: boolean;
  failure_reason?: string;
}

export interface ValidatePromoCodeResult {
  valid: boolean;
  promoCode?: PromoCode;
  discountAmount?: number;
  error?: string;
  giftProduct?: any;
}

export interface CartItem {
  id: string;
  price: number;
  discount_price?: number;
  quantity: number;
  category_id?: string;
}

export async function getPromoCodes(
  page: number = 1,
  pageSize: number = 20,
  search?: string
) {
  let query = supabase
    .from('promo_codes')
    .select('*, gift_product:products(id, name)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return {
    promoCodes: data,
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getPromoCodeById(id: string) {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*, gift_product:products(id, name, price, main_image_url)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createPromoCode(promoCode: Partial<PromoCode>) {
  const { data, error } = await supabase
    .from('promo_codes')
    .insert(promoCode)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction('create_promo_code', 'promo_code', data.id, { code: promoCode.code });

  return data;
}

export async function updatePromoCode(id: string, promoCode: Partial<PromoCode>) {
  const { data, error } = await supabase
    .from('promo_codes')
    .update(promoCode)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction('update_promo_code', 'promo_code', id, { code: promoCode.code });

  return data;
}

export async function deletePromoCode(id: string) {
  const promoCode = await getPromoCodeById(id);

  const { error } = await supabase.from('promo_codes').delete().eq('id', id);

  if (error) throw error;

  await logAdminAction('delete_promo_code', 'promo_code', id, { code: promoCode?.code });
}

export async function togglePromoCodeActive(id: string, isActive: boolean) {
  const { data, error } = await supabase
    .from('promo_codes')
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  await logAdminAction(
    isActive ? 'activate_promo_code' : 'deactivate_promo_code',
    'promo_code',
    id,
    { code: data.code }
  );

  return data;
}

async function checkRateLimit(sessionId: string, ipAddress: string): Promise<boolean> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('promo_code_attempts')
    .select('id')
    .eq('session_id', sessionId)
    .gte('attempted_at', fiveMinutesAgo);

  if (error) throw error;

  return (data?.length || 0) < 10;
}

async function logAttempt(
  code: string,
  sessionId: string,
  ipAddress: string,
  success: boolean,
  failureReason?: string
) {
  await supabase.from('promo_code_attempts').insert({
    code,
    session_id: sessionId,
    ip_address: ipAddress,
    success,
    failure_reason: failureReason,
  });
}

export async function validatePromoCode(
  code: string,
  cartItems: CartItem[],
  sessionId: string,
  ipAddress: string = 'unknown'
): Promise<ValidatePromoCodeResult> {
  try {
    const canProceed = await checkRateLimit(sessionId, ipAddress);
    if (!canProceed) {
      await logAttempt(code, sessionId, ipAddress, false, 'Rate limit exceeded');
      return {
        valid: false,
        error: 'Забагато спроб. Спробуйте пізніше.',
      };
    }

    const { data: promoCode, error } = await supabase
      .from('promo_codes')
      .select('*, gift_product:products(id, name, price, main_image_url, sku, stock_quantity)')
      .eq('code', code.toUpperCase())
      .maybeSingle();

    if (error || !promoCode) {
      await logAttempt(code, sessionId, ipAddress, false, 'Code not found');
      return {
        valid: false,
        error: 'Промокод не знайдено',
      };
    }

    if (!promoCode.is_active) {
      await logAttempt(code, sessionId, ipAddress, false, 'Code inactive');
      return {
        valid: false,
        error: 'Промокод неактивний',
      };
    }

    const now = new Date();
    const validFrom = new Date(promoCode.valid_from);
    const validUntil = promoCode.valid_until ? new Date(promoCode.valid_until) : null;

    if (now < validFrom) {
      await logAttempt(code, sessionId, ipAddress, false, 'Code not yet valid');
      return {
        valid: false,
        error: 'Промокод ще не активний',
      };
    }

    if (validUntil && now > validUntil) {
      await logAttempt(code, sessionId, ipAddress, false, 'Code expired');
      return {
        valid: false,
        error: 'Термін дії промокоду закінчився',
      };
    }

    if (promoCode.max_uses_total) {
      const { data: usageData } = await supabase
        .from('promo_code_usage')
        .select('id')
        .eq('promo_code_id', promoCode.id)
        .eq('success', true);

      if (usageData && usageData.length >= promoCode.max_uses_total) {
        await logAttempt(code, sessionId, ipAddress, false, 'Max uses exceeded');
        return {
          valid: false,
          error: 'Перевищено ліміт використань промокоду',
        };
      }
    }

    const { data: userUsageData } = await supabase
      .from('promo_code_usage')
      .select('id')
      .eq('promo_code_id', promoCode.id)
      .eq('session_id', sessionId)
      .eq('success', true);

    if (userUsageData && userUsageData.length >= promoCode.max_uses_per_user) {
      await logAttempt(code, sessionId, ipAddress, false, 'Max uses per user exceeded');
      return {
        valid: false,
        error: 'Ви вже використали цей промокод максимальну кількість разів',
      };
    }


    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.discount_price || item.price;
      return sum + price * item.quantity;
    }, 0);

    if (subtotal < promoCode.min_order_amount) {
      await logAttempt(code, sessionId, ipAddress, false, 'Min amount not met');
      return {
        valid: false,
        error: `Мінімальна сума замовлення ${promoCode.min_order_amount} ₴`,
      };
    }

    if (promoCode.allowed_categories && promoCode.allowed_categories.length > 0) {
      const hasAllowedCategory = cartItems.some(
        (item) => item.category_id && promoCode.allowed_categories!.includes(item.category_id)
      );

      if (!hasAllowedCategory) {
        await logAttempt(code, sessionId, ipAddress, false, 'No allowed category in cart');
        return {
          valid: false,
          error: 'Промокод не застосовується до товарів у вашому кошику',
        };
      }
    }

    let discountAmount = 0;
    let giftProduct = null;

    switch (promoCode.type) {
      case 'fixed':
        discountAmount = promoCode.discount_value;
        break;
      case 'percentage':
        discountAmount = (subtotal * promoCode.discount_value) / 100;
        break;
      case 'gift':
        giftProduct = promoCode.gift_product;
        break;
      case 'free_shipping':
        discountAmount = 0;
        break;
    }

    await logAttempt(code, sessionId, ipAddress, true);

    return {
      valid: true,
      promoCode,
      discountAmount,
      giftProduct,
    };
  } catch (error) {
    console.error('Error validating promo code:', error);
    return {
      valid: false,
      error: 'Помилка перевірки промокоду',
    };
  }
}

export async function recordPromoCodeUsage(
  promoCodeId: string,
  discountAmount: number,
  sessionId: string,
  ipAddress: string = 'unknown',
  userId?: string,
  orderId?: string
) {
  const { data, error } = await supabase
    .from('promo_code_usage')
    .insert({
      promo_code_id: promoCodeId,
      user_id: userId,
      order_id: orderId,
      discount_amount: discountAmount,
      session_id: sessionId,
      ip_address: ipAddress,
      success: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPromoCodeUsageHistory(promoCodeId: string) {
  const { data, error } = await supabase
    .from('promo_code_usage')
    .select('*')
    .eq('promo_code_id', promoCodeId)
    .order('used_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPromoCodeStats(promoCodeId: string) {
  const { data: usageData } = await supabase
    .from('promo_code_usage')
    .select('discount_amount, success')
    .eq('promo_code_id', promoCodeId)
    .eq('success', true);

  const totalUses = usageData?.length || 0;
  const totalDiscount = usageData?.reduce((sum, usage) => sum + usage.discount_amount, 0) || 0;

  return {
    totalUses,
    totalDiscount,
  };
}
