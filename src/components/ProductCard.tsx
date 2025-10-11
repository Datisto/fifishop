interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  onSale: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="bg-white/95 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="relative h-28 sm:h-32 overflow-hidden bg-slate-200">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        {product.onSale && (
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-red-600 text-white font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs rounded-lg shadow-lg backdrop-blur-sm">
            РОЗПРОДАЖ
          </div>
        )}
      </div>

      <div className="p-2 sm:p-3 flex flex-col h-[calc(100%-7rem)] sm:h-[calc(100%-8rem)]">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
          {product.name}
        </h3>

        <p className="text-slate-600 text-[10px] sm:text-xs mb-1.5 sm:mb-2 line-clamp-2 flex-grow">
          {product.description}
        </p>

        <div className="mt-auto">
          <span className="text-sm sm:text-lg font-bold text-slate-900 block">
            {product.price.toLocaleString('uk-UA')} ₴
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
