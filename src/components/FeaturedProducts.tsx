import { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import { collection, query, where, orderBy as firestoreOrderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface FeaturedProductsProps {
  selectedCategory: string | null;
  searchQuery?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  main_image_url?: string;
  sku: string;
  stock_quantity: number;
  product_images?: Array<{
    image_url: string;
    sort_order: number;
  }>;
  product_categories?: Array<{
    categories: {
      name: string;
    };
  }>;
}

const FeaturedProducts = ({ selectedCategory, searchQuery }: FeaturedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchQuery && searchQuery.trim() && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchQuery]);

  const loadProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef,
        where('is_published', '==', true),
        firestoreOrderBy('created_at', 'desc')
      );

      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      const productsWithDetails = await Promise.all(
        productsData.map(async (product) => {
          const imagesRef = collection(db, 'product_images');
          const imagesQuery = query(
            imagesRef,
            where('product_id', '==', product.id),
            firestoreOrderBy('sort_order')
          );
          const imagesSnapshot = await getDocs(imagesQuery);
          const product_images = imagesSnapshot.docs.map(doc => doc.data());

          const categoriesRef = collection(db, 'product_categories');
          const categoriesQuery = query(categoriesRef, where('product_id', '==', product.id));
          const categoriesSnapshot = await getDocs(categoriesQuery);

          const product_categories = await Promise.all(
            categoriesSnapshot.docs.map(async (catDoc) => {
              const categoryId = catDoc.data().category_id;
              const categoryRef = collection(db, 'categories');
              const categorySnapshot = await getDocs(query(categoryRef, where('__name__', '==', categoryId)));
              if (!categorySnapshot.empty) {
                const categoryData = categorySnapshot.docs[0].data();
                return {
                  categories: {
                    name: categoryData.name
                  }
                };
              }
              return null;
            })
          );

          return {
            ...product,
            product_images,
            product_categories: product_categories.filter(Boolean)
          };
        })
      );

      setProducts(productsWithDetails);
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

  const allProducts = products.map(p => {
    const firstImage = p.product_images && p.product_images.length > 0
      ? p.product_images[0].image_url
      : p.main_image_url;

    return {
      ...p,
      image: firstImage || 'https://images.pexels.com/photos/842535/pexels-photo-842535.jpeg?auto=compress&cs=tinysrgb&w=400',
      onSale: !!p.discount_price,
      category: p.product_categories?.[0]?.categories?.name?.toUpperCase() || ''
    };
  });

  let filteredProducts = selectedCategory
    ? allProducts.filter(product => product.category === selectedCategory)
    : allProducts;

  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
  }

  const displayProducts = filteredProducts.slice(0, 8);

  return (
    <section ref={sectionRef} data-products-section className="relative bg-gradient-to-b from-slate-400/0 via-slate-400/20 to-slate-400/60 py-6 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white inline-block relative drop-shadow-lg px-2">
            {searchQuery && searchQuery.trim() ? 'РЕЗУЛЬТАТИ ПОШУКУ' : (selectedCategory || 'РЕКОМЕНДОВАНІ ТОВАРИ')}
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
