import Header from './components/Header';
import Hero from './components/Hero';
import PromotionalTiles from './components/PromotionalTiles';
import FeaturedProducts from './components/FeaturedProducts';

function App() {
  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/photo_2025-10-08_19-19-59.jpg')",
          zIndex: -1
        }}
      />
      <div className="relative backdrop-blur-sm">
        <Header />
        <Hero />
        <PromotionalTiles />
        <FeaturedProducts />
      </div>
    </div>
  );
}

export default App;
