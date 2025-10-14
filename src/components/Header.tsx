import { Search, Fish, Menu, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const navItems = ['Аксесуари', 'Приманки', 'Вудки та Котушки', 'Човни', 'Одяг', 'Воблери'];

  const totalItems = getTotalItems();

  return (
    <header className="bg-slate-900/70 backdrop-blur-md text-white shadow-lg relative z-50">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <Fish className="w-7 h-7 sm:w-10 sm:h-10" strokeWidth={1.5} />
            <h1 className="text-lg sm:text-2xl font-bold tracking-wide">Магазин Риболовлі</h1>
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

        <nav className="border-t border-slate-700 pt-3">
          <ul className="hidden lg:flex space-x-8 justify-center">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className="text-sm font-medium hover:text-yellow-400 transition-colors duration-200"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>

          {isMenuOpen && (
            <ul className="lg:hidden flex flex-col space-y-2">
              {navItems.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="block text-sm font-medium hover:text-yellow-400 transition-colors duration-200 py-2 hover:bg-slate-700/50 px-3 rounded-lg"
                  >
                    {item}
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
