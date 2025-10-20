import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getPromoCodes,
  deletePromoCode,
  togglePromoCodeActive,
  getPromoCodeStats,
  PromoCode,
} from '../../lib/promoCodes';
import { Plus, Edit, Trash2, Search, Power } from 'lucide-react';

export default function AdminPromoCodes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<Record<string, { totalUses: number; totalDiscount: number }>>({});

  useEffect(() => {
    fetchPromoCodes();
  }, [search, location.key]);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const { promoCodes: data } = await getPromoCodes(1, 100, search);
      setPromoCodes(data);

      const statsData: Record<string, { totalUses: number; totalDiscount: number }> = {};
      for (const promo of data) {
        const promoStats = await getPromoCodeStats(promo.id);
        statsData[promo.id] = promoStats;
      }
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Видалити промокод?')) return;

    try {
      await deletePromoCode(id);
      fetchPromoCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
      alert('Помилка видалення промокоду');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await togglePromoCodeActive(id, !isActive);
      fetchPromoCodes();
    } catch (error) {
      console.error('Error toggling promo code:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      fixed: 'Фіксована',
      percentage: 'Відсоток',
      gift: 'Подарунок',
      free_shipping: 'Безкоштовна доставка',
    };
    return types[type] || type;
  };

  const isExpired = (validUntil?: string) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  const isNotYetActive = (validFrom: string) => {
    return new Date(validFrom) > new Date();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Промокоди</h1>
          <button
            onClick={() => navigate('/admin/promo-codes/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Новий промокод
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук за кодом або назвою..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {promoCodes.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Промокоди не знайдено
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Код
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Назва
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Тип
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Знижка
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Термін дії
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Використання
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Дії
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {promoCodes.map((promo) => (
                      <tr key={promo.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-sm text-blue-600">
                            {promo.code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900">{promo.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-600">
                            {getTypeLabel(promo.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-900">
                            {promo.type === 'fixed'
                              ? `${promo.discount_value} ₴`
                              : promo.type === 'percentage'
                              ? `${promo.discount_value}%`
                              : promo.type === 'free_shipping'
                              ? 'Доставка'
                              : 'Подарунок'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-slate-600">
                            <div>
                              з {new Date(promo.valid_from).toLocaleString('uk-UA')}
                            </div>
                            {promo.valid_until && (
                              <div>
                                до {new Date(promo.valid_until).toLocaleString('uk-UA')}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600">
                            <div>{stats[promo.id]?.totalUses || 0} / {promo.max_uses_total || '∞'}</div>
                            <div className="text-xs text-slate-500">
                              −{stats[promo.id]?.totalDiscount.toFixed(0) || 0} ₴
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isExpired(promo.valid_until) ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Закінчився
                            </span>
                          ) : isNotYetActive(promo.valid_from) ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Очікує
                            </span>
                          ) : promo.is_active ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Активний
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">
                              Неактивний
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleActive(promo.id, promo.is_active)}
                              className={`p-2 rounded-lg transition-colors ${
                                promo.is_active
                                  ? 'hover:bg-slate-100 text-slate-600'
                                  : 'hover:bg-green-50 text-green-600'
                              }`}
                              title={promo.is_active ? 'Деактивувати' : 'Активувати'}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/promo-codes/${promo.id}`)}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                              title="Редагувати"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(promo.id)}
                              className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                              title="Видалити"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
