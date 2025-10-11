import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

const Hero = () => {
  const slides = [
    {
      
      badge: 'БЕЗКОШТОВНА ДОСТАВКА НА ЗАМОВЛЕННЯ ПОНАД $200.00',
      title: 'РОЗПРОДАЖ ДО',
      highlight: '50% ЗНИЖКИ',
      description: 'Преміум спорядження для риболовлі для кожного рибалки. Досліджуйте нашу колекцію вудок, котушок та аксесуарів.',
      buttonText: 'Купити зараз',
      image: '/f1.png'
    },
    {
      
      badge: 'НОВІ НАДХОДЖЕННЯ',
      title: 'ВІДКРИЙТЕ',
      highlight: 'НОВІТНЄ СПОРЯДЖЕННЯ',
      description: 'Отримайте найновіше риболовне обладнання та аксесуари від провідних брендів.',
      buttonText: 'Переглянути зараз',
      image: '/f2.png'
    },
    {
      
      badge: 'ЕКСКЛЮЗИВНІ ПРОПОЗИЦІЇ',
      title: 'ЕКОНОМТЕ НА',
      highlight: 'ПРОФЕСІЙНОМУ СПОРЯДЖЕННІ',
      description: 'Професійні риболовні інструменти за неперевершеними цінами. Обмежена пропозиція!',
      buttonText: 'Переглянути пропозиції',
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

      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-transparent z-10"></div>

      <div className="absolute inset-0 z-20 container mx-auto px-3 sm:px-4 flex items-center">
        <div className="max-w-2xl">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0 absolute'
              }`}
            >
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="bg-yellow-500 text-slate-900 inline-block px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm md:text-base lg:text-lg shadow-lg">
                  {slide.badge}
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white drop-shadow-2xl leading-tight">
                  {slide.title}<br />
                  <span className="text-yellow-400">{slide.highlight}</span>
                </h2>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white drop-shadow-lg max-w-lg">
                  {slide.description}
                </p>

                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 text-sm sm:text-base">
                  {slide.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-200 backdrop-blur-sm z-30"
      >
        <ChevronRight size={20} className="sm:hidden" />
        <ChevronRight size={24} className="hidden sm:block" />
      </button>

      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-30">
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
