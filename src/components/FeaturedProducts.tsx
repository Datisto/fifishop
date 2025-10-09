import ProductCard from './ProductCard';

const FeaturedProducts = () => {
  const products = [
    {
      id: 1,
      name: 'Professional Fishing Rod',
      description: 'High-performance carbon fiber rod with exceptional sensitivity',
      price: 149.99,
      image: 'https://images.pexels.com/photos/842535/pexels-photo-842535.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: false
    },
    {
      id: 2,
      name: 'Premium Spinning Reel',
      description: 'Smooth operation with advanced drag system',
      price: 89.99,
      image: 'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: true
    },
    {
      id: 3,
      name: 'Tackle Box Deluxe',
      description: 'Organized storage for all your fishing essentials',
      price: 45.99,
      image: 'https://images.pexels.com/photos/7657988/pexels-photo-7657988.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: false
    },
    {
      id: 4,
      name: 'Braided Fishing Line',
      description: 'Ultra-strong 30lb test line for big catches',
      price: 24.99,
      image: 'https://images.pexels.com/photos/932638/pexels-photo-932638.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: true
    },
    {
      id: 5,
      name: 'Lure Collection Set',
      description: 'Assorted lures for freshwater and saltwater fishing',
      price: 34.99,
      image: 'https://images.pexels.com/photos/416179/pexels-photo-416179.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: false
    },
    {
      id: 6,
      name: 'Fishing Vest Pro',
      description: 'Comfortable vest with multiple pockets and ventilation',
      price: 79.99,
      image: 'https://images.pexels.com/photos/235725/pexels-photo-235725.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: true
    }
  ];

  return (
    <section className="relative bg-gradient-to-b from-slate-800/0 via-slate-900/20 to-slate-900/60 py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white inline-block relative drop-shadow-lg">
            FEATURED PRODUCTS
            <div className="absolute -bottom-3 left-0 right-0 h-1.5 bg-yellow-400 rounded-full shadow-lg"></div>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
