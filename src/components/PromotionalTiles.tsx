import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PromotionalTilesProps {
  onCategorySelect: (category: string) => void;
}

const PromotionalTiles = ({ onCategorySelect }: PromotionalTilesProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
      title: 'FISHING BOATS',
      image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=800',
      position: 'center bottom'
    },
    {
      title: 'ACCESSORIES',
      image: 'https://images.pexels.com/photos/416179/pexels-photo-416179.jpeg?auto=compress&cs=tinysrgb&w=800',
      position: 'center'
    },
    {
      title: 'TACKLE & GEAR',
      image: 'https://images.pexels.com/photos/932638/pexels-photo-932638.jpeg?auto=compress&cs=tinysrgb&w=800',
      position: 'center'
    },
    {
      title: 'SPINNING REELS',
      image: 'https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&w=800',
      position: 'center'
    },
    {
      title: 'FISHING LINES',
      image: 'https://images.pexels.com/photos/932638/pexels-photo-932638.jpeg?auto=compress&cs=tinysrgb&w=800',
      position: 'center'
    },
    {
      title: 'LURES & BAITS',
      image: 'https://images.pexels.com/photos/416179/pexels-photo-416179.jpeg?auto=compress&cs=tinysrgb&w=800',
      position: 'center'
    },
    {
      title: 'FISHING VESTS',
      image: 'https://images.pexels.com/photos/235725/pexels-photo-235725.jpeg?auto=compress&cs=tinysrgb&w=800',
      position: 'center'
    },
    {
      title: 'TACKLE BOXES',
      image: 'https://images.pexels.com/photos/7657988/pexels-photo-7657988.jpeg?auto=compress&cs=tinysrgb&w=800',
      position: 'center'
    },
    {
      title: 'FISHING NETS',
      image: 'https://images.pexels.com/photos/3689772/pexels-photo-3689772.jpeg?auto=compress&cs=tinysrgb&w=800',
      position: 'center'
    },
    {
      title: 'WADERS',
      image: 'https://images.pexels.com/photos/235725/pexels-photo-235725.jpeg?auto=compress&cs=tinysrgb&w=800',
      position: 'center'
    }
  ];

  const displayedTiles = isExpanded ? tiles : tiles.slice(0, 5);

  return (
    <section className="container mx-auto px-4 py-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {displayedTiles.map((tile, index) => (
          <div
            key={index}
            onClick={() => onCategorySelect(tile.title)}
            className="relative h-28 rounded-lg overflow-hidden shadow-lg group cursor-pointer"
          >
            <div
              className="absolute inset-0 bg-cover transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage: `url('${tile.image}')`,
                backgroundPosition: tile.position
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent"></div>
            </div>

            <div className="relative h-full flex items-end p-3">
              <h3 className="text-sm font-bold text-white drop-shadow-lg">
                {tile.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {tiles.length > 5 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg"
          >
            {isExpanded ? (
              <>
                Show Less <ChevronUp size={20} />
              </>
            ) : (
              <>
                Show More ({tiles.length - 5} more) <ChevronDown size={20} />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
};

export default PromotionalTiles;
