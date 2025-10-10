import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

const Hero = () => {
  const slides = [
    {
      badge: 'FREE SHIPPING ON ORDERS OVER $200.00',
      title: 'SALE UP TO',
      highlight: '50% OFF',
      description: 'Premium fishing gear for every angler. Explore our collection of rods, reels, and accessories.',
      buttonText: 'Shop Now'
    },
    {
      badge: 'NEW ARRIVALS',
      title: 'DISCOVER THE',
      highlight: 'LATEST GEAR',
      description: 'Get your hands on the newest fishing equipment and accessories from top brands.',
      buttonText: 'Explore Now'
    },
    {
      badge: 'EXCLUSIVE DEALS',
      title: 'SAVE BIG ON',
      highlight: 'PRO EQUIPMENT',
      description: 'Professional-grade fishing tools at unbeatable prices. Limited time offers!',
      buttonText: 'View Deals'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };


  return (
    <section className="relative h-[480px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/30 via-slate-900/20 to-transparent rounded-b-3xl"></div>

      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-2xl h-[320px] flex items-center">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute w-full transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="space-y-6 max-w-2xl">
                <div className="bg-yellow-500 text-slate-900 inline-block px-6 py-3 rounded-2xl font-bold text-lg shadow-lg">
                  {slide.badge}
                </div>

                <h2 className="text-6xl font-bold text-white drop-shadow-2xl leading-tight">
                  {slide.title}<br />
                  <span className="text-yellow-400">{slide.highlight}</span>
                </h2>

                <p className="text-xl text-white drop-shadow-lg max-w-lg">
                  {slide.description}
                </p>

                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105">
                  {slide.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm"
        >
          <ChevronRight size={24} />
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-yellow-400 w-8'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
