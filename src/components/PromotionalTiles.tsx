import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getCategories, Category } from '../lib/firestore/categories';

interface PromotionalTilesProps {
  onCategorySelect: (category: string) => void;
}

const PromotionalTiles = ({ onCategorySelect }: PromotionalTilesProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories(true);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="container mx-auto px-3 sm:px-4 py-4 sm:py-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 sm:h-28 rounded-lg bg-slate-200 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  const displayedTiles = isExpanded ? categories : categories.slice(0, 5);

  const defaultImage = 'https://images.pexels.com/photos/3689772/pexels-photo-3689772.jpeg?auto=compress&cs=tinysrgb&w=800';

  return (
    <section className="container mx-auto px-3 sm:px-4 py-4 sm:py-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {displayedTiles.map((category) => (
          <div
            key={category.id}
            onClick={() => onCategorySelect(category.name.toUpperCase())}
            className="relative h-24 sm:h-28 rounded-lg overflow-hidden shadow-lg group cursor-pointer"
          >
            <div
              className="absolute inset-0 bg-cover transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage: `url('${category.icon_url || defaultImage}')`,
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent"></div>
            </div>

            <div className="relative h-full flex items-end p-2 sm:p-3">
              <h3 className="text-xs sm:text-sm font-bold text-white drop-shadow-lg uppercase">
                {category.name}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {categories.length > 5 && (
        <div className="flex justify-center mt-3 sm:mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 sm:gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 sm:px-6 sm:py-3 rounded-xl transition-all duration-200 shadow-lg text-sm sm:text-base"
          >
            {isExpanded ? (
              <>
                Показати менше <ChevronUp size={18} className="sm:hidden" /><ChevronUp size={20} className="hidden sm:block" />
              </>
            ) : (
              <>
                Показати більше (ще {categories.length - 5}) <ChevronDown size={18} className="sm:hidden" /><ChevronDown size={20} className="hidden sm:block" />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
};

export default PromotionalTiles;
