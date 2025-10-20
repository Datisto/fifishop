import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderItem {
  product_name: string;
  product_sku: string;
  price: number;
  discount_price?: number;
  quantity: number;
  subtotal: number;
  is_on_sale: boolean;
}

interface PromoCode {
  promo_code_name: string;
  promo_code_description?: string;
  discount_amount: number;
}

interface OrderData {
  order_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  postal_code?: string;
  comment?: string;
  items: OrderItem[];
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  promo_codes: PromoCode[];
}

function formatOrderMessage(order: OrderData): string {
  let message = `🛒 <b>НОВЕ ЗАМОВЛЕННЯ #${order.order_number}</b>\n\n`;

  message += `👤 <b>ІНФОРМАЦІЯ ПРО ПОКУПЦЯ:</b>\n`;
  message += `Ім'я: ${order.first_name} ${order.last_name}\n`;
  message += `Email: ${order.email}\n`;
  message += `Телефон: ${order.phone}\n\n`;

  message += `📍 <b>АДРЕСА ДОСТАВКИ:</b>\n`;
  const addressParts = [order.city, order.address];
  if (order.postal_code) {
    addressParts.push(order.postal_code);
  }
  message += addressParts.join(', ') + '\n\n';

  if (order.comment) {
    message += `💬 <b>КОМЕНТАР ПОКУПЦЯ:</b>\n`;
    message += `${order.comment}\n\n`;
  }

  message += `📦 <b>ТОВАРИ:</b>\n`;
  order.items.forEach((item, index) => {
    message += `\n${index + 1}. <b>${item.product_name}</b>\n`;
    message += `   Артикул: ${item.product_sku}\n`;

    if (item.discount_price && item.discount_price < item.price) {
      message += `   Ціна: <s>${item.price.toFixed(2)} ₴</s> → ${item.discount_price.toFixed(2)} ₴\n`;
    } else {
      message += `   Ціна за 1 шт: ${item.price.toFixed(2)} ₴\n`;
    }

    message += `   Кількість: ${item.quantity}\n`;
    message += `   Сума: ${item.subtotal.toFixed(2)} ₴\n`;

    if (item.is_on_sale) {
      message += `   ⚡ <i>Товар з розпродажу</i>\n`;
    }
  });

  message += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;

  message += `💰 <b>РОЗРАХУНОК:</b>\n`;
  message += `Сума без знижки: ${order.subtotal_amount.toFixed(2)} ₴\n`;

  if (order.promo_codes && order.promo_codes.length > 0) {
    message += `\n🎁 <b>ВИКОРИСТАНІ ПРОМОКОДИ:</b>\n`;
    order.promo_codes.forEach((promo) => {
      message += `\n• <b>${promo.promo_code_name}</b>\n`;
      if (promo.promo_code_description) {
        message += `  ${promo.promo_code_description}\n`;
      }
      message += `  Знижка: -${promo.discount_amount.toFixed(2)} ₴\n`;
    });
  }

  if (order.items.some(item => item.is_on_sale)) {
    message += `\n⚡ <i>Зауваження: деякі товари куплені за акційною ціною</i>\n`;
  }

  if (order.discount_amount > 0) {
    message += `\n<b>Загальна знижка: -${order.discount_amount.toFixed(2)} ₴</b>\n`;
  }

  message += `\n💳 <b>ПІДСУМОК: ${order.total_amount.toFixed(2)} ₴</b>`;

  return message;
}

async function sendTelegramMessage(botToken: string, chatId: string, message: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Telegram API error:', data);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const botToken = '8352381824:AAFT27jGPvqvam8_tOq6_LDu45uiazDz8eY';
    const chatId = '1993682286';

    if (!botToken || !chatId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Telegram credentials not configured'
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const orderData: OrderData = await req.json();

    const message = formatOrderMessage(orderData);
    const success = await sendTelegramMessage(botToken, chatId, message);

    return new Response(
      JSON.stringify({ success }),
      {
        status: success ? 200 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in send-telegram-notification:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});