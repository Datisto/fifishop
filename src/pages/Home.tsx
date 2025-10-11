import { useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import PromotionalTiles from '../components/PromotionalTiles';
import FeaturedProducts from '../components/FeaturedProducts';

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <>
      <Header />
      <Hero />
      <PromotionalTiles onCategorySelect={setSelectedCategory} />
      <FeaturedProducts selectedCategory={selectedCategory} />
    </>
  );
};

export default Home;
