import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft, ShoppingCart } from 'lucide-react';
import { getProductById, Product, ProductImage } from '../lib/products';
import { useCart } from '../contexts/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await getProductById(id!);
      if (data) {
        setProduct(data);
        if (data.product_images && data.product_images.length > 0) {
          const sortedImages = [...data.product_images].sort((a, b) => a.sort_order - b.sort_order);
          setImages(sortedImages);
        } else if (data.main_image_url) {
          setImages([{
            id: 'main',
            product_id: data.id,
            image_url: data.main_image_url,
            alt_text: data.name,
            sort_order: 0,
            created_at: data.created_at
          }]);
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      const imageUrl = images[0]?.image_url || product.main_image_url || '';

      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        discount_price: product.discount_price,
        quantity: 1,
        image_url: imageUrl,
        sku: product.sku,
        stock_quantity: product.stock_quantity
      });

      navigate('/cart');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Товар не знайдено</p>
          <button
            onClick={() => navigate('/')}
            className="text-yellow-400 hover:text-yellow-300 underline"
          >
            Повернутись до каталогу
          </button>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const displayPrice = hasDiscount ? product.discount_price : product.price;
  const specifications = product.specifications ? Object.entries(product.specifications).map(([key, value]) => ({
    label: key,
    value: String(value)
  })) : [];

  return (
    <div className="min-h-screen bg-slate-900 py-6 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft size={20} />
          <span className="text-sm sm:text-base">Назад до каталогу</span>
        </button>

        <div className="bg-white/95 rounded-xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8">
            <div className="relative">
              <div className="relative aspect-square bg-slate-200 rounded-lg overflow-hidden">
                {images.length > 0 ? (
                  <img
                    src={images[currentImageIndex].image_url}
                    alt={images[currentImageIndex].alt_text || product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    Немає зображення
                  </div>
                )}

                {hasDiscount && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white font-bold px-4 py-2 text-sm rounded-lg shadow-lg">
                    РОЗПРОДАЖ
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-900 p-2 sm:p-3 rounded-full transition-all duration-200 shadow-lg"
                    >
                      <ChevronLeft size={20} className="sm:hidden" />
                      <ChevronLeft size={24} className="hidden sm:block" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-900 p-2 sm:p-3 rounded-full transition-all duration-200 shadow-lg"
                    >
                      <ChevronRight size={20} className="sm:hidden" />
                      <ChevronRight size={24} className="hidden sm:block" />
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 sm:gap-3 mt-4 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-yellow-400 scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={image.alt_text || `${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
                {product.name}
              </h1>

              {product.brand && (
                <p className="text-sm text-slate-500 mb-2">Бренд: {product.brand}</p>
              )}

              <p className="text-base sm:text-lg text-slate-600 mb-4 sm:mb-6">
                {product.description}
              </p>

              <div className="mb-6 sm:mb-8">
                {hasDiscount ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-red-600">
                      {displayPrice!.toLocaleString('uk-UA')} ₴
                    </span>
                    <span className="text-xl sm:text-2xl text-slate-400 line-through">
                      {product.price.toLocaleString('uk-UA')} ₴
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
                    {displayPrice.toLocaleString('uk-UA')} ₴
                  </span>
                )}
              </div>

              {product.stock_quantity > 0 ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-3 sm:py-4 px-6 rounded-lg transition-colors duration-200 mb-6 sm:mb-8 text-base sm:text-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    Додати до кошика
                  </button>
                  <p className="text-sm text-green-600 mb-6">
                    В наявності: {product.stock_quantity} шт.
                  </p>
                </>
              ) : (
                <div className="mb-6 sm:mb-8">
                  <p className="text-red-600 font-semibold">Немає в наявності</p>
                </div>
              )}

              {specifications.length > 0 && (
                <div className="border-t border-slate-200 pt-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                    Характеристики
                  </h2>
                  <dl className="space-y-3">
                    {specifications.map((spec, index) => (
                      <div
                        key={index}
                        className="flex justify-between py-2 border-b border-slate-100 text-sm sm:text-base"
                      >
                        <dt className="text-slate-600 font-medium">{spec.label}</dt>
                        <dd className="text-slate-900 font-semibold">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {product.full_description && (
                <div className="border-t border-slate-200 pt-6 mt-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                    Опис товару
                  </h2>
                  <p className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                    {product.full_description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
