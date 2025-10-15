import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  createProduct,
  updateProduct,
  getProductById,
  uploadProductImage,
  addProductImage,
  deleteProductImage,
  setProductCategories,
} from '../../lib/products';
import { getCategories, Category } from '../../lib/categories';
import { Save, ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    full_description: '',
    price: '',
    discount_price: '',
    stock_quantity: '',
    brand: '',
    is_published: true,
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [mainImageUrl, setMainImageUrl] = useState<string>('');

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    } else {
      generateSku();
    }
  }, [id]);

  const generateSku = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    setFormData(prev => ({ ...prev, sku: `${timestamp}${random}` }));
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const product = await getProductById(id!);
      if (product) {
        setFormData({
          name: product.name,
          sku: product.sku,
          description: product.description,
          full_description: product.full_description,
          price: product.price.toString(),
          discount_price: product.discount_price?.toString() || '',
          stock_quantity: product.stock_quantity.toString(),
          brand: product.brand,
          is_published: product.is_published,
          seo_title: product.seo_title,
          seo_description: product.seo_description,
          seo_keywords: product.seo_keywords,
        });

        setMainImageUrl(product.main_image_url || '');
        setImages(product.product_images || []);
        setSelectedCategories(
          product.product_categories?.map((pc: any) => pc.category_id) || []
        );
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: newValue,
      };

      if (name === 'name') {
        updated.seo_title = newValue as string;
      }
      if (name === 'description') {
        updated.seo_description = newValue as string;
      }

      return updated;
    });
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const updated = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId];

      updateSeoKeywords(updated);
      return updated;
    });
  };

  const updateSeoKeywords = (categoryIds: string[]) => {
    const selectedCategoryNames = categories
      .filter(cat => categoryIds.includes(cat.id))
      .map(cat => cat.name)
      .join(', ');

    setFormData(prev => ({
      ...prev,
      seo_keywords: selectedCategoryNames
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = await uploadProductImage(file);

        if (isEdit) {
          const newImage = await addProductImage(id!, imageUrl, '', images.length + i);
          setImages((prev) => [...prev, newImage]);

          if (!mainImageUrl) {
            setMainImageUrl(imageUrl);
            await updateProduct(id!, { main_image_url: imageUrl });
          }
        } else {
          setImages((prev) => [
            ...prev,
            {
              id: `temp-${Date.now()}-${i}`,
              image_url: imageUrl,
              sort_order: prev.length + i,
            },
          ]);

          if (!mainImageUrl) {
            setMainImageUrl(imageUrl);
          }
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Помилка завантаження фото');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    try {
      if (!imageId.startsWith('temp-')) {
        await deleteProductImage(imageId);
      }

      setImages((prev) => prev.filter((img) => img.id !== imageId));

      if (mainImageUrl === imageUrl) {
        const remainingImages = images.filter((img) => img.id !== imageId);
        const newMainImage = remainingImages[0]?.image_url || '';
        setMainImageUrl(newMainImage);

        if (isEdit) {
          await updateProduct(id!, { main_image_url: newMainImage });
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleSetMainImage = async (imageUrl: string) => {
    setMainImageUrl(imageUrl);
    if (isEdit) {
      await updateProduct(id!, { main_image_url: imageUrl });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price
          ? parseFloat(formData.discount_price)
          : undefined,
        stock_quantity: parseInt(formData.stock_quantity),
        main_image_url: mainImageUrl,
      };

      let productId = id;

      if (isEdit) {
        await updateProduct(id!, productData);
      } else {
        const newProduct = await createProduct(productData);
        productId = newProduct.id;

        for (let i = 0; i < images.length; i++) {
          await addProductImage(productId, images[i].image_url, '', i);
        }
      }

      await setProductCategories(productId as string, selectedCategories);

      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Помилка збереження товару');
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
            onClick={() => navigate('/admin/products')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isEdit ? 'Редагувати товар' : 'Новий товар'}
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Основна інформація</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Назва товару *
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
                  Артикул *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                  readOnly={!isEdit}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                  placeholder="Генерується автоматично"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Бренд</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Залишок на складі *
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ціна *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ціна зі знижкою
                </label>
                <input
                  type="number"
                  name="discount_price"
                  value={formData.discount_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Короткий опис
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Повний опис
              </label>
              <textarea
                name="full_description"
                value={formData.full_description}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mt-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700">Опублікувати товар</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Фотографії</h2>

            <div className="mb-4">
              <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                <Upload className="w-5 h-5 text-slate-600" />
                <span className="text-slate-700">
                  {uploading ? 'Завантаження...' : 'Завантажити фото'}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className={`relative group rounded-lg overflow-hidden border-2 ${
                      mainImageUrl === image.image_url
                        ? 'border-blue-500'
                        : 'border-slate-200'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt=""
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {mainImageUrl !== image.image_url && (
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(image.image_url)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                        >
                          Головне
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image.id, image.image_url)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {mainImageUrl === image.image_url && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                        Головне
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {images.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p>Фотографії не завантажені</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Категорії</h2>

            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-slate-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">SEO</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  SEO Title
                  <span className="text-xs text-slate-500 ml-2">(автоматично з "Назва товару")</span>
                </label>
                <input
                  type="text"
                  name="seo_title"
                  value={formData.seo_title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                  placeholder="Автоматично заповниться з назви товару"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  SEO Description
                  <span className="text-xs text-slate-500 ml-2">(автоматично з "Короткий опис")</span>
                </label>
                <textarea
                  name="seo_description"
                  value={formData.seo_description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                  placeholder="Автоматично заповниться з короткого опису"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  SEO Keywords
                  <span className="text-xs text-slate-500 ml-2">(автоматично з категорій)</span>
                </label>
                <input
                  type="text"
                  name="seo_keywords"
                  value={formData.seo_keywords}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                  placeholder="Автоматично заповниться з обраних категорій"
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
              onClick={() => navigate('/admin/products')}
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
