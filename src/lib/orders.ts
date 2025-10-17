import { supabase } from './supabase';

export interface Order {
  id: string;
  order_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  postal_code?: string;
  comment?: string;
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  price: number;
  discount_price?: number;
  quantity: number;
  subtotal: number;
  is_on_sale: boolean;
}

export interface OrderPromoCode {
  id?: string;
  order_id?: string;
  promo_code_id: string;
  promo_code_name: string;
  promo_code_description?: string;
  discount_amount: number;
}

export interface CreateOrderData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  postal_code?: string;
  comment?: string;
  items: OrderItem[];
  promo_codes: OrderPromoCode[];
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
}

export async function createOrder(orderData: CreateOrderData): Promise<Order> {
  const orderInsert = {
    first_name: orderData.first_name,
    last_name: orderData.last_name,
    email: orderData.email,
    phone: orderData.phone,
    city: orderData.city,
    address: orderData.address,
    postal_code: orderData.postal_code || '',
    comment: orderData.comment || null,
    subtotal_amount: orderData.subtotal_amount,
    discount_amount: orderData.discount_amount,
    total_amount: orderData.total_amount,
    status: 'new',
    customer_name: `${orderData.first_name} ${orderData.last_name}`,
    customer_email: orderData.email,
    customer_phone: orderData.phone,
    shipping_address: `${orderData.city}, ${orderData.address}${orderData.postal_code ? ', ' + orderData.postal_code : ''}`,
    shipping_method: 'standard',
    payment_method: 'cash',
  };

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderInsert)
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  const orderItemsInsert = orderData.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product_name,
    product_sku: item.product_sku,
    price: item.price,
    discount_price: item.discount_price || null,
    quantity: item.quantity,
    subtotal: item.subtotal,
    is_on_sale: item.is_on_sale,
    total: item.subtotal,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsInsert);

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    throw new Error(`Failed to create order items: ${itemsError.message}`);
  }

  if (orderData.promo_codes.length > 0) {
    const promoCodesInsert = orderData.promo_codes.map((promo) => ({
      order_id: order.id,
      promo_code_id: promo.promo_code_id,
      promo_code_name: promo.promo_code_name,
      promo_code_description: promo.promo_code_description || null,
      discount_amount: promo.discount_amount,
    }));

    const { error: promoError } = await supabase
      .from('order_promo_codes')
      .insert(promoCodesInsert);

    if (promoError) {
      console.error('Error creating order promo codes:', promoError);
    }
  }

  return order;
}

export async function sendTelegramNotification(order: Order, items: OrderItem[], promoCodes: OrderPromoCode[]): Promise<boolean> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const apiUrl = `${supabaseUrl}/functions/v1/send-telegram-notification`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_number: order.order_number,
        first_name: order.first_name,
        last_name: order.last_name,
        email: order.email,
        phone: order.phone,
        city: order.city,
        address: order.address,
        postal_code: order.postal_code,
        comment: order.comment,
        items: items.map((item) => ({
          product_name: item.product_name,
          product_sku: item.product_sku,
          price: item.price,
          discount_price: item.discount_price,
          quantity: item.quantity,
          subtotal: item.subtotal,
          is_on_sale: item.is_on_sale,
        })),
        subtotal_amount: order.subtotal_amount,
        discount_amount: order.discount_amount,
        total_amount: order.total_amount,
        promo_codes: promoCodes.map((promo) => ({
          promo_code_name: promo.promo_code_name,
          promo_code_description: promo.promo_code_description,
          discount_amount: promo.discount_amount,
        })),
      }),
    });

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

export async function getOrders(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  status?: string
) {
  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,order_number.ilike.%${search}%`
    );
  }

  if (status) {
    query = query.eq('status', status);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return {
    orders: data,
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

export async function getOrderById(id: string) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError) throw orderError;

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  if (itemsError) throw itemsError;

  const { data: promoCodes, error: promoError } = await supabase
    .from('order_promo_codes')
    .select('*')
    .eq('order_id', id);

  if (promoError) throw promoError;

  return {
    order,
    items: items || [],
    promoCodes: promoCodes || [],
  };
}

export async function updateOrderStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data;
}
