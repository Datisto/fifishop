import ProductCard from './ProductCard';

interface FeaturedProductsProps {
  selectedCategory: string | null;
}

const FeaturedProducts = ({ selectedCategory }: FeaturedProductsProps) => {
  const allProducts = [
    {
      id: 1,
      name: 'Професійна Риболовна Вудка',
      description: 'Високопродуктивна вудка з вуглецевого волокна з виключною чутливістю',
      price: 5999,
      image: 'https://images.pexels.com/photos/842535/pexels-photo-842535.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: false,
      category: 'FLY-FISHING RODS'
    },
    {
      id: 2,
      name: 'Преміум Спінінгова Котушка',
      description: 'Плавна робота з вдосконаленою системою гальмування',
      price: 3599,
      image: 'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: true,
      category: 'SPINNING REELS'
    },
    {
      id: 3,
      name: 'Коробка для Приманок Делюкс',
      description: 'Організоване зберігання для всіх риболовних потреб',
      price: 1849,
      image: 'https://images.pexels.com/photos/7657988/pexels-photo-7657988.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: false,
      category: 'TACKLE BOXES'
    },
    {
      id: 4,
      name: 'Плетена Волосінь',
      description: 'Ультраміцна волосінь 30 фунтів для великого улову',
      price: 999,
      image: 'https://images.pexels.com/photos/932638/pexels-photo-932638.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: true,
      category: 'FISHING LINES'
    },
    {
      id: 5,
      name: 'Набір Приманок',
      description: 'Асортимент приманок для прісноводної та морської риболовлі',
      price: 1399,
      image: 'https://images.pexels.com/photos/416179/pexels-photo-416179.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: false,
      category: 'LURES & BAITS'
    },
    {
      id: 6,
      name: 'Риболовний Жилет Про',
      description: 'Зручний жилет з багатьма кишенями та вентиляцією',
      price: 3199,
      image: 'https://images.pexels.com/photos/235725/pexels-photo-235725.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: true,
      category: 'FISHING VESTS'
    },
    {
      id: 7,
      name: 'Вудка з Вуглецевого Волокна',
      description: 'Легка та міцна для тривалих сесій закидання',
      price: 5199,
      image: 'https://images.pexels.com/photos/842535/pexels-photo-842535.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: false,
      category: 'FLY-FISHING RODS'
    },
    {
      id: 8,
      name: 'Аксесуари для Риболовного Човна',
      description: 'Повний набір для вашого риболовного човна',
      price: 11999,
      image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: true,
      category: 'FISHING BOATS'
    },
    {
      id: 9,
      name: 'Набір Гачків',
      description: 'Різні розміри для різних потреб риболовлі',
      price: 799,
      image: 'https://images.pexels.com/photos/416179/pexels-photo-416179.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: false,
      category: 'ACCESSORIES'
    },
    {
      id: 10,
      name: 'Сумка для Спорядження',
      description: 'Міцна сумка з багатьма відділеннями',
      price: 2199,
      image: 'https://images.pexels.com/photos/932638/pexels-photo-932638.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: false,
      category: 'TACKLE & GEAR'
    },
    {
      id: 11,
      name: 'Риболовна Сітка Про',
      description: 'Міцна сітка для вилову великого улову',
      price: 1599,
      image: 'https://images.pexels.com/photos/3689772/pexels-photo-3689772.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: true,
      category: 'FISHING NETS'
    },
    {
      id: 12,
      name: 'Вейдерси Делюкс',
      description: 'Водонепроникні вейдерси для комфорту на весь день',
      price: 6399,
      image: 'https://images.pexels.com/photos/235725/pexels-photo-235725.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: false,
      category: 'WADERS'
    }
  ];

  const filteredProducts = selectedCategory
    ? allProducts.filter(product => product.category === selectedCategory)
    : allProducts;

  const displayProducts = filteredProducts.slice(0, 8);

  const topSellingProducts = [1, 2, 3, 4, 5, 6, 7, 8];
  const topProducts = selectedCategory === 'TOP SELLERS'
    ? allProducts.filter(p => topSellingProducts.includes(p.id)).slice(0, 8)
    : displayProducts;

  const finalProducts = selectedCategory === 'TOP SELLERS' ? topProducts : displayProducts;

  return (
    <section className="relative bg-gradient-to-b from-slate-400/0 via-slate-400/20 to-slate-400/60 py-6 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white inline-block relative drop-shadow-lg px-2">
            {selectedCategory || 'РЕКОМЕНДОВАНІ ТОВАРИ'}
            <div className="absolute -bottom-2 sm:-bottom-3 left-0 right-0 h-1 sm:h-1.5 bg-yellow-400 rounded-full shadow-lg"></div>
          </h2>
        </div>

        {finalProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
            {finalProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <p className="text-lg sm:text-xl md:text-2xl text-white drop-shadow-lg px-4">
              Товари в цій категорії не знайдено
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
