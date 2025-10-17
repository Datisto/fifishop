import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Eye, Calendar, AlertCircle } from 'lucide-react';
import { getOrders } from '../../lib/orders';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getOrders(currentPage, 20, search, statusFilter);
      setOrders(result.orders || []);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Помилка завантаження замовлень');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadOrders();
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && orders.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Завантаження замовлень...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Замовлення</h1>
              <p className="text-sm text-slate-600">Управління замовленнями клієнтів</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Пошук за іменем, email або номером замовлення..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Пошук
                </button>
              </div>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Всі статуси</option>
                <option value="new">Нові</option>
                <option value="processing">В обробці</option>
                <option value="shipped">Відправлені</option>
                <option value="delivered">Доставлені</option>
                <option value="cancelled">Скасовані</option>
                <option value="pending">Очікують</option>
              </select>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Замовлення не знайдено</h3>
              <p className="text-slate-600">Спробуйте змінити фільтри або параметри пошуку</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Номер</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Дата</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Клієнт</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Сума</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Статус</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Дії</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{order.order_number}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4" />
                            {formatDate(order.created_at)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-900">
                            {order.first_name && order.last_name
                              ? `${order.first_name} ${order.last_name}`
                              : order.customer_name || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-slate-600">
                            {order.email || order.customer_email || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{order.total_amount} ₴</div>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/admin/orders/${order.id}`)}
                              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                              title="Переглянути деталі"
                            >
                              <Eye className="w-4 h-4 text-slate-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Попередня
                  </button>

                  <span className="text-sm text-slate-600">
                    Сторінка {currentPage} з {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Наступна
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
