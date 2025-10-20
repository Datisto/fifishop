import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

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
  const orderNumber = await generateOrderNumber();

  const newOrder = {
    ...orderData,
    order_number: orderNumber,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const orderRef = await addDoc(collection(db, 'orders'), newOrder);
  const orderId = orderRef.id;

  const orderItems = [];
  for (const item of items) {
    const newItem = {
      ...item,
      order_id: orderId,
      created_at: new Date().toISOString()
    };
    const itemRef = await addDoc(collection(db, 'order_items'), newItem);
    orderItems.push({
      id: itemRef.id,
      ...newItem
    });
  }

  return {
    order: {
      id: orderId,
      ...newOrder
    },
    items: orderItems
  };
}

export async function getOrders(
  page: number = 1,
  pageSize: number = 20,
  statusFilter?: string
) {
  const ordersRef = collection(db, 'orders');
  let q = query(ordersRef, orderBy('created_at', 'desc'));

  if (statusFilter && statusFilter !== 'all') {
    q = query(ordersRef, where('status', '==', statusFilter), orderBy('created_at', 'desc'));
  }

  const snapshot = await getDocs(q);
  const allOrders = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Order[];

  const totalCount = allOrders.length;
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const paginatedOrders = allOrders.slice(from, to);

  return {
    orders: paginatedOrders,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize)
  };
}

export async function getOrderById(id: string) {
  const orderRef = doc(db, 'orders', id);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) {
    return null;
  }

  const order = {
    id: orderSnap.id,
    ...orderSnap.data()
  } as Order;

  const itemsRef = collection(db, 'order_items');
  const itemsQuery = query(itemsRef, where('order_id', '==', id));
  const itemsSnapshot = await getDocs(itemsQuery);
  const items = itemsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as OrderItem[];

  return {
    ...order,
    items
  };
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  notes?: string
) {
  const orderRef = doc(db, 'orders', orderId);

  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  };

  if (notes !== undefined) {
    updateData.notes = notes;
  }

  await updateDoc(orderRef, updateData);

  const orderSnap = await getDoc(orderRef);
  return {
    id: orderSnap.id,
    ...orderSnap.data()
  };
}

export async function getOrderStats() {
  const ordersRef = collection(db, 'orders');
  const snapshot = await getDocs(ordersRef);
  const orders = snapshot.docs.map(doc => doc.data()) as Order[];

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

async function generateOrderNumber(): Promise<string> {
  const ordersRef = collection(db, 'orders');
  const snapshot = await getDocs(ordersRef);
  const orderCount = snapshot.size;

  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const sequence = String(orderCount + 1).padStart(4, '0');

  return `ORD-${year}${month}${day}-${sequence}`;
}

export async function sendTelegramNotification(orderId: string) {
  try {
    const order = await getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const message = formatTelegramMessage(order);

    return { success: true };
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    throw error;
  }
}

function formatTelegramMessage(order: any): string {
  let message = `🛍️ *Нове замовлення #${order.order_number}*\n\n`;
  message += `👤 Клієнт: ${order.customer_name}\n`;

  if (order.customer_email) {
    message += `📧 Email: ${order.customer_email}\n`;
  }
  if (order.customer_phone) {
    message += `📱 Телефон: ${order.customer_phone}\n`;
  }
  if (order.telegram_username) {
    message += `✈️ Telegram: @${order.telegram_username}\n`;
  }

  message += `\n📦 Товари:\n`;
  order.items.forEach((item: OrderItem, index: number) => {
    message += `${index + 1}. ${item.product_name} x${item.quantity} - ${item.total_price} грн\n`;
  });

  message += `\n💰 Сума: ${order.total_amount} грн\n`;

  if (order.discount_amount > 0) {
    message += `🎁 Знижка: ${order.discount_amount} грн\n`;
  }

  message += `\n📍 Доставка:\n`;
  message += `Метод: ${order.delivery_method}\n`;
  message += `Місто: ${order.delivery_city}\n`;
  message += `Адреса: ${order.delivery_address}\n`;

  message += `\n💳 Оплата: ${order.payment_method}\n`;

  return message;
}
