import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import PromotionalTiles from '../components/PromotionalTiles';
import FeaturedProducts from '../components/FeaturedProducts';

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [submittedQuery, setSubmittedQuery] = useState<string>('');

  const handleSearchSubmit = (query: string) => {
    setSubmittedQuery(query);
  };

  return (
    <>
      <Header onCategorySelect={setSelectedCategory} onSearchSubmit={handleSearchSubmit} />
      <Hero />
      <PromotionalTiles onCategorySelect={setSelectedCategory} />
      <FeaturedProducts selectedCategory={selectedCategory} searchQuery={submittedQuery} />

      <footer className="bg-slate-900/70 backdrop-blur-md py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <Link
            to="/admin/login"
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
            title="Логін: ADMIN, Пароль: ADMIN"
          >
            admin
          </Link>
        </div>
      </footer>
    </>
  );
};

export default Home;
