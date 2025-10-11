import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

const Hero = () => {
  const slides = [
    {
      image: '/f1.png'
    },
    {
      image: '/f2.png'
    },
    {
      image: '/f3.png'
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
    <section className="relative h-[280px] sm:h-[360px] md:h-[420px] lg:h-[480px] overflow-hidden">
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={`Банер ${index + 1}`}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}
        <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent pointer-events-none"></div>
      </div>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-200 backdrop-blur-sm z-10"
      >
        <ChevronRight size={20} className="sm:hidden" />
        <ChevronRight size={24} className="hidden sm:block" />
      </button>

      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
              index === currentSlide
                ? 'bg-yellow-400 w-6 sm:w-8'
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
