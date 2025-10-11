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
      <div className="relative h-32 overflow-hidden bg-slate-200">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        {product.onSale && (
          <div className="absolute top-2 right-2 bg-red-600 text-white font-bold px-2 py-1 text-xs rounded-lg shadow-lg backdrop-blur-sm">
            РОЗПРОДАЖ
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col h-[calc(100%-8rem)]">
        <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <p className="text-slate-600 text-xs mb-2 line-clamp-2 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-base font-bold text-slate-900 whitespace-nowrap">
            {product.price.toLocaleString('uk-UA')} ₴
          </span>

          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2 py-1 text-xs rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg whitespace-nowrap">
            ДИВИТИСЬ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
