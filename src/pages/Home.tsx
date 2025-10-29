import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import PromotionalTiles from '../components/PromotionalTiles';
import FeaturedProducts from '../components/FeaturedProducts';
import Footer from '../components/Footer';

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
      <Footer />
    </>
  );
};

export default Home;
