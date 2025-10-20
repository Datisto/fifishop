import { supabase } from '../supabase';

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  telegram_username?: string;
  telegram_chat_id?: string;
  delivery_address: string;
  delivery_city: string;
  delivery_method: string;
  payment_method: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  total_amount: number;
  promo_code?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export async function createOrder(orderData: Partial<Order>, items: Partial<OrderItem>[]) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      ...orderData,
      status: 'pending'
    })
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    throw orderError;
  }

  const orderItems = [];
  for (const item of items) {
    const { data: orderItem, error: itemError } = await supabase
      .from('order_items')
      .insert({
        ...item,
        order_id: order.id
      })
      .select()
      .single();

    if (itemError) {
      console.error('Error creating order item:', itemError);
      throw itemError;
    }

    orderItems.push(orderItem);
  }

  return {
    order,
    items: orderItems
  };
}

export async function getOrders(
  page: number = 1,
  pageSize: number = 20,
  statusFilter?: string
) {
  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  return {
    orders: data || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
}

export async function getOrderById(id: string) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (orderError) {
    console.error('Error fetching order:', orderError);
    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', id);

  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
  }

  return {
    ...order,
    items: items || []
  };
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  notes?: string
) {
  const updateData: any = { status };

  if (notes !== undefined) {
    updateData.notes = notes;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }

  return data;
}

export async function getOrderStats() {
  const { data, error } = await supabase
    .from('orders')
    .select('*');

  if (error) {
    console.error('Error fetching order stats:', error);
    throw error;
  }

  const orders = data || [];

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    revenue: orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total_amount, 0)
  };

  return stats;
}

export async function sendTelegramNotification(orderId: string) {
  try {
    const order = await getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/send-telegram-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({ orderId })
    });

    if (!response.ok) {
      throw new Error('Failed to send Telegram notification');
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    throw error;
  }
}
