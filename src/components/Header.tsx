import { Search, Fish } from 'lucide-react';

const Header = () => {
  const navItems = ['Аксесуари', 'Приманки', 'Вудки та Котушки', 'Човни', 'Одяг', 'Воблери'];

  return (
    <header className="bg-slate-900/70 backdrop-blur-md text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Fish className="w-10 h-10" strokeWidth={1.5} />
            <h1 className="text-2xl font-bold tracking-wide">Магазин Риболовлі</h1>
          </div>

          <div className="relative w-80">
            <input
              type="text"
              placeholder="Пошук…"
              className="w-full px-4 py-2 pl-10 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        <nav className="border-t border-slate-700 pt-3">
          <ul className="flex space-x-8 justify-center">
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
        </nav>
      </div>
    </header>
  );
};

export default Header;
