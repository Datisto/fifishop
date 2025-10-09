const PromotionalTiles = () => {
  const tiles = [
    {
      title: 'TOP SELLERS',
      image: 'https://images.pexels.com/photos/3689772/pexels-photo-3689772.jpeg?auto=compress&cs=tinysrgb&w=800',
      position: 'center'
    },
    {
      title: 'FLY-FISHING RODS',
      image: 'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=800',
      position: 'center'
    },
    {
      title: 'NEW LINE FISHING BOATS',
      image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800',
      position: 'center bottom'
    }
  ];

  return (
    <section className="container mx-auto px-4 py-16 bg-slate-900/20 backdrop-blur-lg rounded-3xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiles.map((tile, index) => (
          <div
            key={index}
            className="relative h-80 rounded-lg overflow-hidden shadow-xl group cursor-pointer"
          >
            <div
              className="absolute inset-0 bg-cover transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage: `url('${tile.image}')`,
                backgroundPosition: tile.position
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/30 to-transparent"></div>
            </div>

            <div className="relative h-full flex items-end p-6">
              <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                {tile.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PromotionalTiles;
