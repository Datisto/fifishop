import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  createCategory,
  updateCategory,
  getCategoryById,
  getCategories,
  uploadCategoryIcon,
  Category,
} from '../../lib/firestore/categories';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';

export default function AdminCategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingHeader, setUploadingHeader] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    icon_url: '',
    header_icon_url: '',
    show_in_header: false,
    header_sort_order: 0,
    is_published: true,
    sort_order: 0,
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.filter((cat) => cat.id !== id));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const category = await getCategoryById(id!);
      if (category) {
        setFormData({
          name: category.name,
          description: category.description,
          parent_id: category.parent_id || '',
          icon_url: category.icon_url || '',
          header_icon_url: (category as any).header_icon_url || '',
          show_in_header: (category as any).show_in_header || false,
          header_sort_order: (category as any).header_sort_order || 0,
          is_published: category.is_published,
          sort_order: category.sort_order,
          seo_title: category.seo_title,
          seo_description: category.seo_description,
          seo_keywords: category.seo_keywords,
        });
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    } finally {
      setLoading(false);
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

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const iconUrl = await uploadCategoryIcon(file);
      setFormData((prev) => ({ ...prev, icon_url: iconUrl }));
    } catch (error) {
      console.error('Error uploading icon:', error);
      alert('Помилка завантаження іконки');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveIcon = () => {
    setFormData((prev) => ({ ...prev, icon_url: '' }));
  };

  const handleHeaderIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHeader(true);

    try {
      const iconUrl = await uploadCategoryIcon(file);
      setFormData((prev) => ({ ...prev, header_icon_url: iconUrl }));
    } catch (error) {
      console.error('Error uploading header icon:', error);
      alert('Помилка завантаження іконки хедеру');
    } finally {
      setUploadingHeader(false);
    }
  };

  const handleRemoveHeaderIcon = () => {
    setFormData((prev) => ({ ...prev, header_icon_url: '' }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const categoryData = {
        ...formData,
        parent_id: formData.parent_id || null,
        icon_url: formData.icon_url || null,
        header_icon_url: formData.header_icon_url || null,
      };

      if (isEdit) {
        await updateCategory(id!, categoryData);
      } else {
        await createCategory(categoryData);
      }

      navigate('/admin/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Помилка збереження категорії');
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
            onClick={() => navigate('/admin/categories')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEdit ? 'Редагувати категорію' : 'Нова категорія'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Основна інформація</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Назва категорії *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Батьківська категорія
                </label>
                <select
                  name="parent_id"
                  value={formData.parent_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Немає (кореневий рівень)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Порядок сортування
                </label>
                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Опис</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mt-6 space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Опублікувати категорію</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="show_in_header"
                  checked={formData.show_in_header}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Показувати в хедері</span>
              </label>
            </div>

            {formData.show_in_header && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Порядок в хедері
                </label>
                <input
                  type="number"
                  name="header_sort_order"
                  value={formData.header_sort_order}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-slate-600">
                  Порядок сортування категорії в хедері (менше число - вище в списку)
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Іконки</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Основна іконка категорії</h3>
                {formData.icon_url ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={formData.icon_url}
                      alt="Category icon"
                      className="w-24 h-24 object-cover rounded-lg border-2 border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveIcon}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Видалити іконку
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                      <Upload className="w-5 h-5 text-slate-600" />
                      <span className="text-slate-700">
                        {uploading ? 'Завантаження...' : 'Завантажити іконку'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-2 text-sm text-slate-600">
                      Рекомендований розмір: 128x128px. Формати: JPG, PNG, SVG
                    </p>
                  </div>
                )}
              </div>

              {formData.show_in_header && (
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Іконка для хедера</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Окрема іконка для відображення в хедері. Рекомендовано PNG з прозорим фоном.
                  </p>
                  {formData.header_icon_url ? (
                    <div className="flex items-center gap-4">
                      <img
                        src={formData.header_icon_url}
                        alt="Header icon"
                        className="w-24 h-24 object-contain rounded-lg border-2 border-slate-200 bg-slate-900"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveHeaderIcon}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        Видалити іконку хедера
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                        <Upload className="w-5 h-5 text-slate-600" />
                        <span className="text-slate-700">
                          {uploadingHeader ? 'Завантаження...' : 'Завантажити іконку для хедера'}
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/svg+xml"
                          onChange={handleHeaderIconUpload}
                          disabled={uploadingHeader}
                          className="hidden"
                        />
                      </label>
                      <p className="mt-2 text-sm text-slate-600">
                        Рекомендований розмір: 64x64px. Формат: PNG з альфа-каналом
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">SEO</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  name="seo_title"
                  value={formData.seo_title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  SEO Description
                </label>
                <textarea
                  name="seo_description"
                  value={formData.seo_description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  SEO Keywords
                </label>
                <input
                  type="text"
                  name="seo_keywords"
                  value={formData.seo_keywords}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

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
              onClick={() => navigate('/admin/categories')}
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
