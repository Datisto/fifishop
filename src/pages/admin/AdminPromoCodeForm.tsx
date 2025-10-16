import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  createPromoCode,
  updatePromoCode,
  getPromoCodeById,
  getPromoCodeUsageHistory,
} from '../../lib/promoCodes';
import { getCategories, Category } from '../../lib/categories';
import { getProducts } from '../../lib/products';
import { Save, ArrowLeft, History } from 'lucide-react';

export default function AdminPromoCodeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [usageHistory, setUsageHistory] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'fixed' as 'fixed' | 'percentage' | 'gift' | 'free_shipping',
    discount_value: '',
    gift_product_id: '',
    min_order_amount: '0',
    max_uses_total: '',
    max_uses_per_user: '1',
    valid_from: '',
    valid_until: '',
    is_active: true,
    allow_multiple: false,
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    if (isEdit) {
      fetchPromoCode();
      fetchUsageHistory();
    } else {
      setDefaultDates();
    }
  }, [id]);

  const setDefaultDates = () => {
    const now = new Date();
    const validFrom = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    const oneMonthLater = new Date(now);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    const validUntil = new Date(oneMonthLater.getTime() - oneMonthLater.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    setFormData((prev) => ({
      ...prev,
      valid_from: validFrom,
      valid_until: validUntil,
    }));
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { products: data } = await getProducts(1, 100);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchPromoCode = async () => {
    try {
      setLoading(true);
      const promo = await getPromoCodeById(id!);
      if (promo) {
        const validFromDate = new Date(promo.valid_from);
        const year = validFromDate.getFullYear();
        const month = String(validFromDate.getMonth() + 1).padStart(2, '0');
        const day = String(validFromDate.getDate()).padStart(2, '0');
        const hours = String(validFromDate.getHours()).padStart(2, '0');
        const minutes = String(validFromDate.getMinutes()).padStart(2, '0');
        const validFromLocal = `${year}-${month}-${day}T${hours}:${minutes}`;

        let validUntilLocal = '';
        if (promo.valid_until) {
          const validUntilDate = new Date(promo.valid_until);
          const yearEnd = validUntilDate.getFullYear();
          const monthEnd = String(validUntilDate.getMonth() + 1).padStart(2, '0');
          const dayEnd = String(validUntilDate.getDate()).padStart(2, '0');
          const hoursEnd = String(validUntilDate.getHours()).padStart(2, '0');
          const minutesEnd = String(validUntilDate.getMinutes()).padStart(2, '0');
          validUntilLocal = `${yearEnd}-${monthEnd}-${dayEnd}T${hoursEnd}:${minutesEnd}`;
        }

        setFormData({
          code: promo.code,
          name: promo.name,
          type: promo.type,
          discount_value: promo.discount_value?.toString() || '',
          gift_product_id: promo.gift_product_id || '',
          min_order_amount: promo.min_order_amount?.toString() || '0',
          max_uses_total: promo.max_uses_total?.toString() || '',
          max_uses_per_user: promo.max_uses_per_user?.toString() || '1',
          valid_from: validFromLocal,
          valid_until: validUntilLocal,
          is_active: promo.is_active,
          allow_multiple: promo.allow_multiple,
        });

        setSelectedCategories(promo.allowed_categories || []);
      }
    } catch (error) {
      console.error('Error fetching promo code:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageHistory = async () => {
    try {
      const history = await getPromoCodeUsageHistory(id!);
      setUsageHistory(history);
    } catch (error) {
      console.error('Error fetching usage history:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const promoData = {
        ...formData,
        code: formData.code.toUpperCase(),
        discount_value: parseFloat(formData.discount_value) || 0,
        gift_product_id: formData.gift_product_id || undefined,
        min_order_amount: parseFloat(formData.min_order_amount) || 0,
        max_uses_total: formData.max_uses_total ? parseInt(formData.max_uses_total) : undefined,
        max_uses_per_user: parseInt(formData.max_uses_per_user) || 1,
        valid_until: formData.valid_until || undefined,
        allowed_categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      };

      if (isEdit) {
        await updatePromoCode(id!, promoData);
      } else {
        await createPromoCode(promoData);
      }

      navigate('/admin/promo-codes');
    } catch (error) {
      console.error('Error saving promo code:', error);
      alert('Помилка збереження промокоду');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/promo-codes')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEdit ? 'Редагувати промокод' : 'Новий промокод'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Основна інформація</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Код промокоду *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    maxLength={20}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase font-mono"
                    placeholder="PROMO2024"
                  />
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                    >
                      Генерувати
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Назва акції *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Новорічна знижка"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Тип знижки *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="fixed">Фіксована сума</option>
                  <option value="percentage">Відсоток</option>
                  <option value="gift">Подарунок</option>
                  <option value="free_shipping">Безкоштовна доставка</option>
                </select>
              </div>

              {(formData.type === 'fixed' || formData.type === 'percentage') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {formData.type === 'fixed' ? 'Сума знижки (₴) *' : 'Відсоток знижки (%) *'}
                  </label>
                  <input
                    type="number"
                    name="discount_value"
                    value={formData.discount_value}
                    onChange={handleChange}
                    required
                    min="0"
                    step={formData.type === 'fixed' ? '0.01' : '1'}
                    max={formData.type === 'percentage' ? '100' : undefined}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {formData.type === 'gift' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Товар-подарунок *
                  </label>
                  <select
                    name="gift_product_id"
                    value={formData.gift_product_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Оберіть товар</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Мінімальна сума замовлення (₴)
                </label>
                <input
                  type="number"
                  name="min_order_amount"
                  value={formData.min_order_amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Обмеження використання</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Максимальна кількість використань (загальна)
                </label>
                <input
                  type="number"
                  name="max_uses_total"
                  value={formData.max_uses_total}
                  onChange={handleChange}
                  min="1"
                  placeholder="Необмежено"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Залиште порожнім для необмеженої кількості
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Максимальна кількість на користувача *
                </label>
                <input
                  type="number"
                  name="max_uses_per_user"
                  value={formData.max_uses_per_user}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Дата початку дії *
                </label>
                <input
                  type="datetime-local"
                  name="valid_from"
                  value={formData.valid_from}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Дата завершення дії
                </label>
                <input
                  type="datetime-local"
                  name="valid_until"
                  value={formData.valid_until}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Залиште порожнім для необмеженого терміну
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Обмеження за категоріями</h2>
            <p className="text-sm text-slate-600 mb-4">
              Оберіть категорії, до яких застосовується промокод (якщо не обрано жодної - застосовується до всіх)
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Налаштування</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">Активний промокод</span>
                  <p className="text-xs text-slate-500">
                    Неактивні промокоди не можна використати
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="allow_multiple"
                  checked={formData.allow_multiple}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">
                    Дозволити комбінувати з іншими промокодами
                  </span>
                  <p className="text-xs text-slate-500">
                    Користувачі зможуть застосувати кілька промокодів одночасно
                  </p>
                </div>
              </label>
            </div>
          </div>

          {isEdit && usageHistory.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-slate-600" />
                <h2 className="text-xl font-bold text-slate-900">Історія використання</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">
                        Дата
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">
                        Знижка
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-700">
                        Статус
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {usageHistory.slice(0, 10).map((usage) => (
                      <tr key={usage.id}>
                        <td className="px-4 py-2 text-slate-600">
                          {new Date(usage.used_at).toLocaleString('uk-UA')}
                        </td>
                        <td className="px-4 py-2 text-slate-900 font-medium">
                          −{usage.discount_amount.toFixed(2)} ₴
                        </td>
                        <td className="px-4 py-2">
                          {usage.success ? (
                            <span className="text-green-600">Успішно</span>
                          ) : (
                            <span className="text-red-600">{usage.failure_reason}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Збереження...' : 'Зберегти'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/promo-codes')}
              className="px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors"
            >
              Скасувати
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
