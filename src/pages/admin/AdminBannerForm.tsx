import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  createBanner,
  updateBanner,
  getBannerById,
  uploadBannerImage,
} from '../../lib/banners';
import { getCategories, Category } from '../../lib/categories';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';

export default function AdminBannerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    mobile_image_url: '',
    link_url: '',
    placement: 'home',
    category_id: '',
    link_type: 'url' as 'url' | 'category',
    is_active: true,
    sort_order: 0,
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchBanner();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBanner = async () => {
    try {
      setLoading(true);
      const banner = await getBannerById(id!);
      if (banner) {
        setFormData({
          title: banner.title,
          image_url: banner.image_url,
          mobile_image_url: banner.mobile_image_url || '',
          link_url: banner.link_url || '',
          placement: banner.placement,
          category_id: banner.category_id || '',
          link_type: banner.category_id ? 'category' : 'url',
          is_active: banner.is_active,
          sort_order: banner.sort_order,
          start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
          end_date: banner.end_date ? banner.end_date.split('T')[0] : '',
        });
      }
    } catch (error) {
      console.error('Error fetching banner:', error);
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

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isMobile: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isMobile) {
      setUploadingMobile(true);
    } else {
      setUploading(true);
    }

    try {
      const imageUrl = await uploadBannerImage(file);
      setFormData((prev) => ({
        ...prev,
        [isMobile ? 'mobile_image_url' : 'image_url']: imageUrl,
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Помилка завантаження зображення');
    } finally {
      if (isMobile) {
        setUploadingMobile(false);
      } else {
        setUploading(false);
      }
    }
  };

  const handleRemoveImage = (isMobile: boolean = false) => {
    setFormData((prev) => ({
      ...prev,
      [isMobile ? 'mobile_image_url' : 'image_url']: '',
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.image_url) {
      alert('Будь ласка, завантажте основне зображення');
      return;
    }

    setLoading(true);

    try {
      const bannerData = {
        title: formData.title,
        image_url: formData.image_url,
        mobile_image_url: formData.mobile_image_url || null,
        link_url: formData.link_type === 'url' ? (formData.link_url || null) : null,
        placement: formData.placement,
        category_id: formData.link_type === 'category' ? (formData.category_id || null) : null,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      if (isEdit) {
        await updateBanner(id!, bannerData);
      } else {
        await createBanner(bannerData);
      }

      navigate('/admin/banners');
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Помилка збереження банера');
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
            onClick={() => navigate('/admin/banners')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEdit ? 'Редагувати банер' : 'Новий банер'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Основна інформація</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Назва банера *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Розміщення *
                </label>
                <select
                  name="placement"
                  value={formData.placement}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="home">Головна сторінка</option>
                  <option value="category">Сторінка категорії</option>
                  <option value="promo">Промо-сторінка</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Тип посилання
                </label>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="link_type"
                      value="url"
                      checked={formData.link_type === 'url'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-slate-700">URL посилання</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="link_type"
                      value="category"
                      checked={formData.link_type === 'category'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-slate-700">Категорія товарів</span>
                  </label>
                </div>

                {formData.link_type === 'url' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Посилання (URL) <span className="text-slate-500 font-normal">(необов'язково)</span>
                    </label>
                    <input
                      type="text"
                      name="link_url"
                      value={formData.link_url}
                      onChange={handleChange}
                      placeholder="https://example.com або залиште пустим для інформаційного банера"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Виберіть категорію
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Оберіть категорію...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Активний банер</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Зображення</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Основне зображення (Desktop) *
                </label>
                {formData.image_url ? (
                  <div className="space-y-4">
                    <img
                      src={formData.image_url}
                      alt="Banner"
                      className="w-full max-w-2xl h-auto rounded-lg border-2 border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(false)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Видалити зображення
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                      <Upload className="w-6 h-6 text-slate-600" />
                      <span className="text-slate-700">
                        {uploading ? 'Завантаження...' : 'Завантажити зображення'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, false)}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-2 text-sm text-slate-600">
                      Рекомендований розмір: 1920x600px для слайдера
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Мобільне зображення (опціонально)
                </label>
                {formData.mobile_image_url ? (
                  <div className="space-y-4">
                    <img
                      src={formData.mobile_image_url}
                      alt="Mobile Banner"
                      className="w-full max-w-md h-auto rounded-lg border-2 border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Видалити мобільне зображення
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                      <Upload className="w-6 h-6 text-slate-600" />
                      <span className="text-slate-700">
                        {uploadingMobile ? 'Завантаження...' : 'Завантажити мобільне зображення'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        disabled={uploadingMobile}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-2 text-sm text-slate-600">
                      Рекомендований розмір: 768x600px для мобільних пристроїв
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Період відображення (опціонально)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Дата початку
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Дата закінчення
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
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
              onClick={() => navigate('/admin/banners')}
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
