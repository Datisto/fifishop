import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import { Package, FolderTree, ShoppingCart, Tag, TrendingUp, Database, Download, Upload } from 'lucide-react';
import {
  exportDatabase,
  importDatabase,
  downloadBackup,
  uploadBackup,
  exportDatabaseWithImages,
  importDatabaseWithImages,
  downloadZipBackup,
  uploadZipBackup
} from '../../lib/database';

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
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 100, message: '' });
  const [importProgress, setImportProgress] = useState({ current: 0, total: 100, message: '' });

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

  const handleExport = async (includeImages: boolean = false) => {
    setExporting(true);
    setExportProgress({ current: 0, total: 100, message: '' });
    try {
      if (includeImages) {
        const zipBlob = await exportDatabaseWithImages(
          (current, total, message) => {
            setExportProgress({ current, total, message });
          }
        );
        downloadZipBackup(zipBlob);
        alert('Базу даних з зображеннями успішно експортовано!');
      } else {
        const backup = await exportDatabase();
        downloadBackup(backup);
        alert('Базу даних успішно експортовано!');
      }
    } catch (error) {
      console.error('Error exporting database:', error);
      alert('Помилка експорту бази даних');
    } finally {
      setExporting(false);
      setExportProgress({ current: 0, total: 100, message: '' });
    }
  };

  const handleImport = async (withImages: boolean = false) => {
    if (!confirm('УВАГА: Це видалить всі поточні дані та замінить їх даними з файлу. Продовжити?')) {
      return;
    }

    setImporting(true);
    setImportProgress({ current: 0, total: 100, message: '' });
    try {
      if (withImages) {
        const zipFile = await uploadZipBackup();
        await importDatabaseWithImages(
          zipFile,
          (current, total, message) => {
            setImportProgress({ current, total, message });
          }
        );
        alert('Базу даних з зображеннями успішно імпортовано!');
      } else {
        const backup = await uploadBackup();
        await importDatabase(backup);
        alert('Базу даних успішно імпортовано!');
      }
      fetchStats();
    } catch (error) {
      console.error('Error importing database:', error);
      alert('Помилка імпорту бази даних: ' + (error as Error).message);
    } finally {
      setImporting(false);
      setImportProgress({ current: 0, total: 100, message: '' });
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

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-2 rounded-lg">
              <Database className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Управління базою даних</h2>
          </div>

          <p className="text-slate-600 mb-6">
            Експортуйте або імпортуйте дані бази даних. Імпорт видалить всі поточні дані.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Експорт</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleExport(false)}
                  disabled={exporting || importing}
                  className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-6 h-6 text-blue-600" />
                    <div className="text-left">
                      <p className="font-semibold text-slate-900 group-hover:text-blue-600">
                        Тільки дані (JSON)
                      </p>
                      <p className="text-sm text-slate-600">Швидкий експорт без зображень</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport(true)}
                  disabled={exporting || importing}
                  className="p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-6 h-6 text-green-600" />
                    <div className="text-left">
                      <p className="font-semibold text-slate-900 group-hover:text-green-600">
                        Повний бекап (ZIP)
                      </p>
                      <p className="text-sm text-slate-600">Дані + всі зображення</p>
                    </div>
                  </div>
                </button>
              </div>

              {exporting && exportProgress.message && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-blue-900">{exportProgress.message}</p>
                    <p className="text-sm text-blue-700">{exportProgress.current}%</p>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress.current}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Імпорт</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleImport(false)}
                  disabled={importing || exporting}
                  className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <Upload className="w-6 h-6 text-orange-600" />
                    <div className="text-left">
                      <p className="font-semibold text-slate-900 group-hover:text-orange-600">
                        Тільки дані (JSON)
                      </p>
                      <p className="text-sm text-slate-600">Відновити дані без зображень</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleImport(true)}
                  disabled={importing || exporting}
                  className="p-4 border-2 border-red-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <Upload className="w-6 h-6 text-red-600" />
                    <div className="text-left">
                      <p className="font-semibold text-slate-900 group-hover:text-red-600">
                        Повний імпорт (ZIP)
                      </p>
                      <p className="text-sm text-slate-600">Дані + зображення</p>
                    </div>
                  </div>
                </button>
              </div>

              {importing && importProgress.message && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-red-900">{importProgress.message}</p>
                    <p className="text-sm text-red-700">{importProgress.current}%</p>
                  </div>
                  <div className="w-full bg-red-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress.current}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Увага:</strong> Імпорт видалить всі поточні дані та замінить їх даними з файлу. Переконайтеся, що у вас є резервна копія перед імпортом.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
