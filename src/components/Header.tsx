import { Search, Fish, Menu, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getCategories, Category } from '../lib/categories';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { getTotalItems } = useCart();
  const navigate = useNavigate();

  const totalItems = getTotalItems();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories(true);
      const headerCategories = data
        .filter((cat: any) => cat.show_in_header)
        .sort((a: any, b: any) => a.header_sort_order - b.header_sort_order)
        .slice(0, 8);
      setCategories(headerCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  return (
    <header className="bg-slate-900/70 backdrop-blur-md text-white shadow-lg relative z-50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/invertInverticon.png" alt="Logo" className="w-7 h-7 sm:w-17 sm:h-17" />
            <h1 className="text-lg sm:text-2xl font-bold tracking-wide">Fishing Lab</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="hidden lg:block relative w-80">
                <input
                  type="text"
                  placeholder="Пошук…"
                  className="w-full px-4 py-2 pl-10 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

        <div className="lg:hidden mb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Пошук…"
              className="w-full px-3 py-2 pl-9 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 text-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        <nav className="border-t border-slate-700 pt-4">
          <ul className="hidden lg:flex gap-6 justify-center items-center">
            {categories.map((category) => (
              <li key={category.id}>
                <a
                  href={`#category-${category.slug}`}
                  className="flex flex-col items-center gap-2 group hover:scale-105 transition-transform duration-200"
                >
                  {((category as any).header_icon_url || category.icon_url) ? (
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img
                        src={(category as any).header_icon_url || category.icon_url}
                        alt={category.name}
                        className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center">
                      <Fish className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <span className="text-xs font-medium text-slate-300 group-hover:text-yellow-400 transition-colors text-center">
                    {category.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {isMenuOpen && (
            <ul className="lg:hidden grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <li key={category.id}>
                  <a
                    href={`#category-${category.slug}`}
                    className="flex items-center gap-3 p-3 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    {((category as any).header_icon_url || category.icon_url) ? (
                      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <img
                          src={(category as any).header_icon_url || category.icon_url}
                          alt={category.name}
                          className="w-full h-full object-contain opacity-90"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Fish className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-300">
                      {category.name}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
