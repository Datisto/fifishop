const Hero = () => {
  return (
    <section className="relative h-[480px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/30 via-slate-900/20 to-transparent"></div>

      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-2xl space-y-6">
          <div className="bg-yellow-500 text-slate-900 inline-block px-6 py-3 rounded-lg font-bold text-lg shadow-lg">
            FREE SHIPPING ON ORDERS OVER $200.00
          </div>

          <h2 className="text-6xl font-bold text-white drop-shadow-2xl leading-tight">
            SALE UP TO<br />
            <span className="text-yellow-400">50% OFF</span>
          </h2>

          <p className="text-xl text-white drop-shadow-lg max-w-lg">
            Premium fishing gear for every angler. Explore our collection of rods, reels, and accessories.
          </p>

          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105">
            Shop Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
