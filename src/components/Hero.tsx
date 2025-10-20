import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBanners, Banner } from '../lib/banners';

interface HeroProps {
  onCategorySelect?: (category: string) => void;
}

const Hero = ({ onCategorySelect }: HeroProps) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const data = await getBanners('home', true);
      if (data && data.length > 0) {
        setBanners(data);
      } else {
        setBanners([]);
      }
    } catch (error) {
      console.error('Error loading banners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  if (loading) {
    return (
      <section className="relative h-[280px] sm:h-[360px] md:h-[420px] lg:h-[480px] overflow-hidden bg-slate-200 animate-pulse">
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="relative h-[280px] sm:h-[360px] md:h-[420px] lg:h-[480px] overflow-hidden">
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}
        <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent pointer-events-none"></div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-transparent z-10"></div>

      <div className="absolute inset-0 z-20 container mx-auto px-3 sm:px-4 flex items-center">
        <div className="max-w-2xl">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0 absolute'
              }`}
            >
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white drop-shadow-2xl leading-tight">
                  {banner.title}
                </h2>

                {(banner.link_url || banner.category_id) && (
                  banner.category_id ? (
                    <button
                      onClick={() => {
                        onCategorySelect?.(banner.category_id!);
                        const productsSection = document.querySelector('[data-products-section]');
                        if (productsSection) {
                          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 text-sm sm:text-base inline-block"
                    >
                      Переглянути
                    </button>
                  ) : (
                    banner.link_url?.startsWith('http') || banner.link_url?.startsWith('//') ? (
                      <a
                        href={banner.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 text-sm sm:text-base inline-block"
                      >
                        Переглянути
                      </a>
                    ) : (
                      <Link
                        to={banner.link_url || '/'}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 text-sm sm:text-base inline-block"
                      >
                        Переглянути
                      </Link>
                    )
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-200 backdrop-blur-sm z-30"
          >
            <ChevronRight size={20} className="sm:hidden" />
            <ChevronRight size={24} className="hidden sm:block" />
          </button>

          <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-30">
            {banners.map((_, index) => (
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
        </>
      )}
    </section>
  );
};

export default Hero;
