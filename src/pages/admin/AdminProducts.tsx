import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  getProducts,
  deleteProduct,
  toggleProductPublished,
  Product,
} from '../../lib/products';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();

  const pageSize = 10;

  useEffect(() => {
    fetchProducts();
  }, [currentPage, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await getProducts(currentPage, pageSize, search);
      setProducts(result.products as any);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    try {
      await toggleProductPublished(id, !currentStatus);
      fetchProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      fetchProducts();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Товари</h1>
            <p className="text-slate-600 mt-2">Всього товарів: {totalCount}</p>
          </div>
          <button
            onClick={() => navigate('/admin/products/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Додати товар
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Пошук за назвою або артикулом..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12">
            <div className="text-center">
              <p className="text-slate-600 text-lg">Товарів не знайдено</p>
              <button
                onClick={() => navigate('/admin/products/new')}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Додати перший товар
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Фото
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Назва
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Артикул
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Ціна
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Залишок
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Статус
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                        Дії
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {products.map((product: any) => (
                      <tr key={product.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          {product.main_image_url ? (
                            <img
                              src={product.main_image_url}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                              <span className="text-slate-400 text-xs">Без фото</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">{product.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-600">{product.sku}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-900 font-medium">{product.price} ₴</p>
                          {product.discount_price && (
                            <p className="text-sm text-green-600">
                              {product.discount_price} ₴
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p
                            className={`${
                              product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {product.stock_quantity}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              product.is_published
                                ? 'bg-green-100 text-green-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {product.is_published ? 'Опубліковано' : 'Чернетка'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                handleTogglePublished(product.id, product.is_published)
                              }
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              title={
                                product.is_published ? 'Зняти з публікації' : 'Опублікувати'
                              }
                            >
                              {product.is_published ? (
                                <EyeOff className="w-5 h-5 text-slate-600" />
                              ) : (
                                <Eye className="w-5 h-5 text-slate-600" />
                              )}
                            </button>
                            <button
                              onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Редагувати"
                            >
                              <Edit className="w-5 h-5 text-blue-600" />
                            </button>
                            {deleteConfirm === product.id ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                                >
                                  Так
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm rounded transition-colors"
                                >
                                  Ні
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(product.id)}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Видалити"
                              >
                                <Trash2 className="w-5 h-5 text-red-600" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-600">
                  Сторінка {currentPage} з {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
