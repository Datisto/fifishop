import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

interface ProductDetailData {
  id: number;
  name: string;
  description: string;
  price: number;
  images: string[];
  onSale: boolean;
  specifications: {
    label: string;
    value: string;
  }[];
  fullDescription: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const productData: { [key: string]: ProductDetailData } = {
    '1': {
      id: 1,
      name: 'Професійна Риболовна Вудка',
      description: 'Високопродуктивна вудка з вуглецевого волокна з виключною чутливістю',
      price: 5999,
      images: [
        'https://images.pexels.com/photos/842535/pexels-photo-842535.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/932638/pexels-photo-932638.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      onSale: false,
      specifications: [
        { label: 'Довжина', value: '2.7 м' },
        { label: 'Матеріал', value: 'Вуглецеве волокно' },
        { label: 'Тест', value: '10-30 г' },
        { label: 'Секції', value: '2' },
        { label: 'Вага', value: '145 г' },
        { label: 'Транспортна довжина', value: '140 см' }
      ],
      fullDescription: 'Преміальна риболовна вудка виготовлена з високоякісного вуглецевого волокна. Ідеально підходить для спінінгової ловлі. Чудова чутливість та міцність. Легка конструкція забезпечує комфорт під час тривалих сесій риболовлі. Оснащена якісними кільцями та надійним котушкотримачем.'
    },
    '2': {
      id: 2,
      name: 'Преміум Спінінгова Котушка',
      description: 'Плавна робота з вдосконаленою системою гальмування',
      price: 3599,
      images: [
        'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/932638/pexels-photo-932638.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/416179/pexels-photo-416179.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      onSale: true,
      specifications: [
        { label: 'Розмір', value: '3000' },
        { label: 'Підшипники', value: '10+1' },
        { label: 'Передавальне число', value: '5.2:1' },
        { label: 'Ємність шпулі', value: '0.25мм/240м' },
        { label: 'Вага', value: '265 г' },
        { label: 'Матеріал корпусу', value: 'Алюміній' }
      ],
      fullDescription: 'Професійна спінінгова котушка з плавним ходом. Надійна система фрикціону забезпечує точне налаштування. Високоякісні підшипники гарантують довговічність. Ідеально збалансована для тривалої ловлі. Алюмінієвий корпус та композитний ротор.'
    }
  };

  const product = productData[id || '1'];

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white text-xl">Товар не знайдено</p>
      </div>
    );
  }

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
                <img
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />

                {product.onSale && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white font-bold px-4 py-2 text-sm rounded-lg shadow-lg">
                    РОЗПРОДАЖ
                  </div>
                )}

                {product.images.length > 1 && (
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

              {product.images.length > 1 && (
                <div className="flex gap-2 sm:gap-3 mt-4 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-yellow-400 scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
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

              <p className="text-base sm:text-lg text-slate-600 mb-4 sm:mb-6">
                {product.description}
              </p>

              <div className="mb-6 sm:mb-8">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
                  {product.price.toLocaleString('uk-UA')} ₴
                </span>
              </div>

              <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-3 sm:py-4 px-6 rounded-lg transition-colors duration-200 mb-6 sm:mb-8 text-base sm:text-lg">
                Додати до кошика
              </button>

              <div className="border-t border-slate-200 pt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                  Характеристики
                </h2>
                <dl className="space-y-3">
                  {product.specifications.map((spec, index) => (
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

              <div className="border-t border-slate-200 pt-6 mt-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                  Опис товару
                </h2>
                <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                  {product.fullDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
