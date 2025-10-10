import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import PromotionalTiles from './components/PromotionalTiles';
import FeaturedProducts from './components/FeaturedProducts';

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/photo_2025-10-08_19-19-59.jpg')",
          zIndex: -1
        }}
      />
      <div className="relative backdrop-blur-lg">
        <Header />
        <Hero />
        <PromotionalTiles onCategorySelect={setSelectedCategory} />
        <FeaturedProducts selectedCategory={selectedCategory} />
      </div>
    </div>
  );
}

export default App;
