import { useNavigate } from 'react-router-dom';
import { Product } from '../lib/products';

interface ProductCardProps {
  product: Product & {
    product_images?: Array<{ image_url: string }>
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const displayPrice = hasDiscount ? product.discount_price : product.price;
  const imageUrl = product.product_images && product.product_images.length > 0
    ? product.product_images[0].image_url
    : product.main_image_url || '';

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white/95 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
      <div className="relative h-28 sm:h-32 overflow-hidden bg-slate-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
            Немає фото
          </div>
        )}
        {hasDiscount && (
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
          {hasDiscount ? (
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-lg font-bold text-red-600 block">
                {displayPrice.toLocaleString('uk-UA')} ₴
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                {product.price.toLocaleString('uk-UA')} ₴
              </span>
            </div>
          ) : (
            <span className="text-sm sm:text-lg font-bold text-slate-900 block">
              {displayPrice.toLocaleString('uk-UA')} ₴
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
