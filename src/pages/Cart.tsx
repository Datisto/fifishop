import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Minus, Plus, Trash2, Undo2, ShoppingBag } from 'lucide-react';
import Header from '../components/Header';

export default function Cart() {
  const { items, updateQuantity, removeItem, getTotalPrice, undoAction, undo, clearUndo } =
    useCart();
  const navigate = useNavigate();

  const handleCategorySelect = (category: string) => {
    navigate('/', { state: { selectedCategory: category } });
  };

  const handleSearchSubmit = (query: string) => {
    navigate('/', { state: { searchQuery: query } });
  };

  if (items.length === 0 && !undoAction) {
    return (
      <>
        <Header onCategorySelect={handleCategorySelect} onSearchSubmit={handleSearchSubmit} />
        <div className="min-h-screen bg-slate-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl p-12 shadow-2xl">
              <ShoppingBag className="w-24 h-24 mx-auto text-slate-300 mb-6" />
              <h1 className="text-3xl font-bold text-slate-900 mb-4">Кошик порожній</h1>
              <p className="text-slate-600 mb-8">
                Додайте товари до кошика, щоб оформити замовлення
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-lg transition-colors shadow-lg"
              >
                Перейти до покупок
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header onCategorySelect={handleCategorySelect} onSearchSubmit={handleSearchSubmit} />
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Кошик</h1>

          {undoAction && (
            <div className="max-w-4xl mb-6 p-4 bg-white border border-slate-200 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <p className="text-slate-700">
                  {undoAction.type === 'remove' ? 'Товар видалено з кошика' : 'Кількість змінено'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={undo}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold rounded-lg transition-colors"
                  >
                    <Undo2 className="w-4 h-4" />
                    Скасувати
                  </button>
                  <button
                    onClick={clearUndo}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <span className="text-slate-600 text-xl">×</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-xl transition-shadow shadow-lg"
                >
                  <div className="flex gap-6">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-slate-200 rounded-lg flex items-center justify-center">
                        <span className="text-slate-400">Без фото</span>
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3
                            className="text-lg font-bold text-slate-900 mb-1 cursor-pointer hover:text-yellow-600 transition-colors"
                            onClick={() => navigate(`/product/${item.id}`)}
                          >
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-sm text-slate-600 mb-2 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Видалити"
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-lg font-medium w-12 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                            disabled={item.quantity >= item.stock_quantity}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          {item.discount_price ? (
                            <div>
                              <p className="text-2xl font-bold text-green-600">
                                {(item.discount_price * item.quantity).toFixed(2)} ₴
                              </p>
                              <p className="text-sm text-slate-500 line-through">
                                {(item.price * item.quantity).toFixed(2)} ₴
                              </p>
                              <p className="text-xs text-slate-400 mt-1">Арт: {item.sku}</p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-2xl font-bold text-slate-900">
                                {(item.price * item.quantity).toFixed(2)} ₴
                              </p>
                              <p className="text-xs text-slate-400 mt-1">Арт: {item.sku}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {item.quantity >= item.stock_quantity && (
                        <p className="text-sm text-orange-600 mt-2">
                          Досягнуто максимальну кількість на складі
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-4 shadow-lg">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Підсумок замовлення</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Товарів:</span>
                    <span>{items.reduce((sum, item) => sum + item.quantity, 0)} шт</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Сума:</span>
                    <span>{getTotalPrice().toFixed(2)} ₴</span>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between text-xl font-bold text-slate-900">
                      <span>Разом:</span>
                      <span>{getTotalPrice().toFixed(2)} ₴</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-lg transition-colors mb-3 shadow-md hover:shadow-lg"
                >
                  Оформити замовлення
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 border-2 border-slate-700 hover:bg-slate-900 hover:text-white text-slate-900 font-semibold rounded-lg transition-colors"
                >
                  Продовжити покупки
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
