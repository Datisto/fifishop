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
      price: 149.99,
      image: 'https://images.pexels.com/photos/842535/pexels-photo-842535.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: false,
      category: 'FLY-FISHING RODS'
    },
    {
      id: 2,
      name: 'Преміум Спінінгова Котушка',
      description: 'Плавна робота з вдосконаленою системою гальмування',
      price: 89.99,
      image: 'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: true,
      category: 'SPINNING REELS'
    },
    {
      id: 3,
      name: 'Коробка для Приманок Делюкс',
      description: 'Організоване зберігання для всіх риболовних потреб',
      price: 45.99,
      image: 'https://images.pexels.com/photos/7657988/pexels-photo-7657988.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: false,
      category: 'TACKLE BOXES'
    },
    {
      id: 4,
      name: 'Плетена Волосінь',
      description: 'Ультраміцна волосінь 30 фунтів для великого улову',
      price: 24.99,
      image: 'https://images.pexels.com/photos/932638/pexels-photo-932638.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: true,
      category: 'FISHING LINES'
    },
    {
      id: 5,
      name: 'Набір Приманок',
      description: 'Асортимент приманок для прісноводної та морської риболовлі',
      price: 34.99,
      image: 'https://images.pexels.com/photos/416179/pexels-photo-416179.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: false,
      category: 'LURES & BAITS'
    },
    {
      id: 6,
      name: 'Риболовний Жилет Про',
      description: 'Зручний жилет з багатьма кишенями та вентиляцією',
      price: 79.99,
      image: 'https://images.pexels.com/photos/235725/pexels-photo-235725.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: true,
      category: 'FISHING VESTS'
    },
    {
      id: 7,
      name: 'Вудка з Вуглецевого Волокна',
      description: 'Легка та міцна для тривалих сесій закидання',
      price: 129.99,
      image: 'https://images.pexels.com/photos/842535/pexels-photo-842535.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: false,
      category: 'FLY-FISHING RODS'
    },
    {
      id: 8,
      name: 'Аксесуари для Риболовного Човна',
      description: 'Повний набір для вашого риболовного човна',
      price: 299.99,
      image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: true,
      category: 'FISHING BOATS'
    },
    {
      id: 9,
      name: 'Набір Гачків',
      description: 'Різні розміри для різних потреб риболовлі',
      price: 19.99,
      image: 'https://images.pexels.com/photos/416179/pexels-photo-416179.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: false,
      category: 'ACCESSORIES'
    },
    {
      id: 10,
      name: 'Сумка для Спорядження',
      description: 'Міцна сумка з багатьма відділеннями',
      price: 54.99,
      image: 'https://images.pexels.com/photos/932638/pexels-photo-932638.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: false,
      category: 'TACKLE & GEAR'
    },
    {
      id: 11,
      name: 'Риболовна Сітка Про',
      description: 'Міцна сітка для вилову великого улову',
      price: 39.99,
      image: 'https://images.pexels.com/photos/3689772/pexels-photo-3689772.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: true,
      category: 'FISHING NETS'
    },
    {
      id: 12,
      name: 'Вейдерси Делюкс',
      description: 'Водонепроникні вейдерси для комфорту на весь день',
      price: 159.99,
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
    <section className="relative bg-gradient-to-b from-slate-400/0 via-slate-400/20 to-slate-400/60 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white inline-block relative drop-shadow-lg">
            {selectedCategory || 'РЕКОМЕНДОВАНІ ТОВАРИ'}
            <div className="absolute -bottom-3 left-0 right-0 h-1.5 bg-yellow-400 rounded-full shadow-lg"></div>
          </h2>
        </div>

        {finalProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {finalProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-2xl text-white drop-shadow-lg">
              Товари в цій категорії не знайдено
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
