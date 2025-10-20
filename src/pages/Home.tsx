import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import PromotionalTiles from '../components/PromotionalTiles';
import FeaturedProducts from '../components/FeaturedProducts';

const Home = () => {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [submittedQuery, setSubmittedQuery] = useState<string>('');

  useEffect(() => {
    if (location.state) {
      if ((location.state as any).selectedCategory) {
        setSelectedCategory((location.state as any).selectedCategory);
        setSubmittedQuery('');
      }
      if ((location.state as any).searchQuery) {
        setSubmittedQuery((location.state as any).searchQuery);
        setSelectedCategory(null);
      }
    }
  }, [location.state]);

  const handleSearchSubmit = (query: string) => {
    setSubmittedQuery(query);
    if (query.trim()) {
      setSelectedCategory(null);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSubmittedQuery('');
  };

  return (
    <>
      <Header onCategorySelect={handleCategorySelect} onSearchSubmit={handleSearchSubmit} />
      <Hero onCategorySelect={handleCategorySelect} />
      <PromotionalTiles onCategorySelect={handleCategorySelect} />
      <FeaturedProducts selectedCategory={selectedCategory} searchQuery={submittedQuery} />

      <footer className="bg-slate-900/70 backdrop-blur-md py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              © 2025 Всі права захищені
            </p>
            <Link
              to="/admin/login"
              className="text-[10px] text-slate-600/40 hover:text-slate-500/60 transition-colors"
            >
              •
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;
