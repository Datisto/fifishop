import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { supabase } from '../lib/supabase';

interface FeaturedProductsProps {
  selectedCategory: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  main_image_url?: string;
  product_categories?: Array<{
    categories: {
      name: string;
    };
  }>;
}

const FeaturedProducts = ({ selectedCategory }: FeaturedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          discount_price,
          main_image_url,
          product_categories (
            categories (
              name
            )
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="relative bg-gradient-to-b from-slate-400/0 via-slate-400/20 to-slate-400/60 py-6 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white inline-block relative drop-shadow-lg px-2">
              РЕКОМЕНДОВАНІ ТОВАРИ
              <div className="absolute -bottom-2 sm:-bottom-3 left-0 right-0 h-1 sm:h-1.5 bg-yellow-400 rounded-full shadow-lg"></div>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-slate-200 rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const allProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.main_image_url || 'https://images.pexels.com/photos/842535/pexels-photo-842535.jpeg?auto=compress&cs=tinysrgb&w=400',
    onSale: !!p.discount_price,
    category: p.product_categories?.[0]?.categories?.name?.toUpperCase() || ''
  }));

  const filteredProducts = selectedCategory
    ? allProducts.filter(product => product.category === selectedCategory)
    : allProducts;

  const displayProducts = filteredProducts.slice(0, 8);

  return (
    <section className="relative bg-gradient-to-b from-slate-400/0 via-slate-400/20 to-slate-400/60 py-6 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white inline-block relative drop-shadow-lg px-2">
            {selectedCategory || 'РЕКОМЕНДОВАНІ ТОВАРИ'}
            <div className="absolute -bottom-2 sm:-bottom-3 left-0 right-0 h-1 sm:h-1.5 bg-yellow-400 rounded-full shadow-lg"></div>
          </h2>
        </div>

        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3">
            {displayProducts.map((product) => (
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
