import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, MessageSquare, Tag, AlertCircle } from 'lucide-react';
import { getOrderById, updateOrderStatus } from '../../lib/orders';

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getOrderById(id!);
      setOrder(result.order);
      setItems(result.items);
      setPromoCodes(result.promoCodes);
    } catch (err) {
      console.error('Error loading order:', err);
      setError('Помилка завантаження замовлення');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;

    try {
      setUpdating(true);
      await updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Помилка оновлення статусу');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      new: { label: 'Нове', className: 'bg-blue-100 text-blue-800' },
      processing: { label: 'В обробці', className: 'bg-yellow-100 text-yellow-800' },
      shipped: { label: 'Відправлено', className: 'bg-purple-100 text-purple-800' },
      delivered: { label: 'Доставлено', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Скасовано', className: 'bg-red-100 text-red-800' },
      pending: { label: 'Очікує', className: 'bg-slate-100 text-slate-800' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-slate-100 text-slate-800' };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Завантаження замовлення...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад до замовлень
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <p>{error || 'Замовлення не знайдено'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Назад до замовлень
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Замовлення {order.order_number}
            </h1>
            <p className="text-sm text-slate-600">
              Створено: {formatDate(order.created_at)}
            </p>
          </div>
          <div>{getStatusBadge(order.status)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 mb-1">Інформація про покупця</h3>
                <p className="text-sm text-slate-600">
                  Ім'я: {order.first_name && order.last_name
                    ? `${order.first_name} ${order.last_name}`
                    : order.customer_name || 'N/A'}
                </p>
                <p className="text-sm text-slate-600">
                  Email: {order.email || order.customer_email || 'N/A'}
                </p>
                <p className="text-sm text-slate-600">
                  Телефон: {order.phone || order.customer_phone || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-slate-900 mb-1">Адреса доставки</h3>
                <p className="text-sm text-slate-600">
                  {order.city && order.address
                    ? `${order.city}, ${order.address}${order.postal_code ? ', ' + order.postal_code : ''}`
                    : order.shipping_address || 'N/A'}
                </p>
              </div>
            </div>

            {order.comment && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 mb-1">Коментар</h3>
                  <p className="text-sm text-slate-600">{order.comment}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 mb-3">Змінити статус</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStatusChange('new')}
                  disabled={updating || order.status === 'new'}
                  className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Нове
                </button>
                <button
                  onClick={() => handleStatusChange('processing')}
                  disabled={updating || order.status === 'processing'}
                  className="px-3 py-2 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  В обробці
                </button>
                <button
                  onClick={() => handleStatusChange('shipped')}
                  disabled={updating || order.status === 'shipped'}
                  className="px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Відправлено
                </button>
                <button
                  onClick={() => handleStatusChange('delivered')}
                  disabled={updating || order.status === 'delivered'}
                  className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Доставлено
                </button>
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={updating || order.status === 'cancelled'}
                  className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed col-span-2"
                >
                  Скасувати
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Товари в замовленні
          </h3>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {index + 1}. {item.product_name}
                      </p>
                      <p className="text-sm text-slate-600">Артикул: {item.product_sku}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="text-slate-600">
                      Ціна: {item.discount_price && item.discount_price < item.price ? (
                        <>
                          <span className="line-through">{item.price} ₴</span>
                          {' → '}
                          <span className="text-green-600 font-medium">{item.discount_price} ₴</span>
                        </>
                      ) : (
                        `${item.price} ₴`
                      )}
                    </span>
                    <span className="text-slate-600">×</span>
                    <span className="text-slate-600">Кількість: {item.quantity}</span>
                    <span className="text-slate-600">=</span>
                    <span className="font-medium text-slate-900">{item.subtotal} ₴</span>
                  </div>
                  {item.is_on_sale && (
                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      Товар з розпродажу
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {promoCodes.length > 0 && (
          <div className="border-t border-slate-200 pt-6 mt-6">
            <h3 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Використані промокоди
            </h3>

            <div className="space-y-2">
              {promoCodes.map((promo) => (
                <div key={promo.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-800">{promo.promo_code_name}</p>
                    {promo.promo_code_description && (
                      <p className="text-sm text-green-600">{promo.promo_code_description}</p>
                    )}
                  </div>
                  <span className="font-medium text-green-800">-{promo.discount_amount} ₴</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 pt-6 mt-6">
          <div className="max-w-md ml-auto space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span>Сума без знижки:</span>
              <span>{order.subtotal_amount || order.total_amount} ₴</span>
            </div>

            {order.discount_amount > 0 && (
              <div className="flex items-center justify-between text-green-600 font-medium">
                <span>Знижка:</span>
                <span>-{order.discount_amount} ₴</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xl font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Разом:</span>
              <span>{order.total_amount} ₴</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
