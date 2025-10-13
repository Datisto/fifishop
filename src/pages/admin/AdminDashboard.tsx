import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import { Package, FolderTree, ShoppingCart, Tag, TrendingUp } from 'lucide-react';

interface Stats {
  totalProducts: number;
  publishedProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalPromoCodes: number;
  activePromoCodes: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    publishedProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalPromoCodes: 0,
    activePromoCodes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [products, categories, orders, promoCodes] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('promo_codes').select('*', { count: 'exact', head: true }),
      ]);

      const publishedProducts = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      const activePromoCodes = await supabase
        .from('promo_codes')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setStats({
        totalProducts: products.count || 0,
        publishedProducts: publishedProducts.count || 0,
        totalCategories: categories.count || 0,
        totalOrders: orders.count || 0,
        totalPromoCodes: promoCodes.count || 0,
        activePromoCodes: activePromoCodes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Товари',
      value: stats.totalProducts,
      subtitle: `${stats.publishedProducts} опубліковано`,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Категорії',
      value: stats.totalCategories,
      subtitle: 'Всього категорій',
      icon: FolderTree,
      color: 'bg-green-500',
    },
    {
      title: 'Замовлення',
      value: stats.totalOrders,
      subtitle: 'Всього замовлень',
      icon: ShoppingCart,
      color: 'bg-orange-500',
    },
    {
      title: 'Промокоди',
      value: stats.totalPromoCodes,
      subtitle: `${stats.activePromoCodes} активних`,
      icon: Tag,
      color: 'bg-purple-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Дашборд</h1>
          <p className="text-slate-600 mt-2">Огляд основних показників магазину</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 animate-pulse">
                <div className="h-12 w-12 bg-slate-200 rounded-lg mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow"
                >
                  <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">{card.value}</h3>
                  <p className="text-sm text-slate-600">{card.title}</p>
                  <p className="text-xs text-slate-500 mt-2">{card.subtitle}</p>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Швидкий доступ</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/admin/products"
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <Package className="w-6 h-6 text-slate-600 group-hover:text-blue-600 mb-2" />
              <p className="font-semibold text-slate-900 group-hover:text-blue-600">Додати товар</p>
            </a>

            <a
              href="/admin/categories"
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
            >
              <FolderTree className="w-6 h-6 text-slate-600 group-hover:text-green-600 mb-2" />
              <p className="font-semibold text-slate-900 group-hover:text-green-600">Додати категорію</p>
            </a>

            <a
              href="/admin/banners"
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
            >
              <Package className="w-6 h-6 text-slate-600 group-hover:text-orange-600 mb-2" />
              <p className="font-semibold text-slate-900 group-hover:text-orange-600">Додати банер</p>
            </a>

            <a
              href="/admin/promo-codes"
              className="p-4 border-2 border-slate-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
            >
              <Tag className="w-6 h-6 text-slate-600 group-hover:text-purple-600 mb-2" />
              <p className="font-semibold text-slate-900 group-hover:text-purple-600">Додати промокод</p>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
