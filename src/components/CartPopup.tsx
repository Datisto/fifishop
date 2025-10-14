import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { X, Minus, Plus, Trash2, Undo2 } from 'lucide-react';
import { useEffect } from 'react';

interface CartPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartPopup({ isOpen, onClose }: CartPopupProps) {
  const { items, updateQuantity, removeItem, getTotalPrice, undoAction, undo, clearUndo } =
    useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Кошик</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {undoAction && (
          <div className="p-4 bg-slate-100 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-700">
                {undoAction.type === 'remove' ? 'Товар видалено' : 'Кількість змінено'}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={undo}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  <Undo2 className="w-4 h-4" />
                  Скасувати
                </button>
                <button
                  onClick={clearUndo}
                  className="p-1 hover:bg-slate-200 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-slate-600 text-lg mb-2">Кошик порожній</p>
              <p className="text-slate-500 text-sm">Додайте товари для оформлення замовлення</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center">
                      <span className="text-slate-400 text-xs">Без фото</span>
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 text-sm mb-1">{item.name}</h3>
                    <p className="text-xs text-slate-600 mb-2">Артикул: {item.sku}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                          disabled={item.quantity >= item.stock_quantity}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      {item.discount_price ? (
                        <>
                          <span className="text-sm font-bold text-green-600">
                            {item.discount_price} ₴
                          </span>
                          <span className="text-xs text-slate-500 line-through">
                            {item.price} ₴
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-slate-900">{item.price} ₴</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Разом:</span>
              <span>{getTotalPrice().toFixed(2)} ₴</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Оформити замовлення
            </button>

            <button
              onClick={handleViewCart}
              className="w-full py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
            >
              Переглянути кошик
            </button>
          </div>
        )}
      </div>
    </>
  );
}
