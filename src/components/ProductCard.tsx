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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="relative h-64 overflow-hidden bg-slate-200">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        {product.onSale && (
          <div className="absolute top-4 right-4 bg-red-600 text-white font-bold px-4 py-2 rounded-lg shadow-lg">
            SALE
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          {product.name}
        </h3>

        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-slate-900">
            ${product.price.toFixed(2)}
          </span>

          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg">
            VIEW
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
