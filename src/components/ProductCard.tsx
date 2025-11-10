import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../lib/products';
import { useCart } from '../contexts/CartContext';
import { useImageFallback } from '../hooks/useImageFallback';

interface ProductCardProps {
  product: Product & {
    product_images?: Array<{ image_url: string }>
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const displayPrice = hasDiscount ? product.discount_price : product.price;
  const rawImageUrl = product.product_images && product.product_images.length > 0
    ? product.product_images[0].image_url
    : product.main_image_url || '';
  const { src: imageUrl } = useImageFallback(rawImageUrl);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (product.stock_quantity <= 0) {
      alert('Товар відсутній на складі');
      return;
    }

    const categoryId = product.product_categories && product.product_categories.length > 0
      ? product.product_categories[0].category_id
      : undefined;

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      discount_price: product.discount_price,
      quantity: 1,
      image_url: imageUrl,
      sku: product.sku,
      stock_quantity: product.stock_quantity,
      description: product.description,
      category_id: categoryId
    });

    navigate('/cart');
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white/95 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group relative cursor-pointer">
      <div className="relative h-28 sm:h-32 overflow-hidden bg-slate-200">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
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

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex-1">
            {hasDiscount ? (
              <div className="flex items-center gap-1.5 flex-wrap">
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

          {product.stock_quantity > 0 && (
            <button
              onClick={handleAddToCart}
              className="flex-shrink-0 p-1.5 sm:p-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-lg transition-colors shadow-md hover:shadow-lg"
              title="Додати до кошика"
            >
              <ShoppingCart size={16} className="sm:hidden" />
              <ShoppingCart size={18} className="hidden sm:block" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
