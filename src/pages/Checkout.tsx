import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ShoppingBag, CheckCircle, Tag, X, ArrowLeft } from 'lucide-react';
import { validatePromoCode, PromoCode } from '../lib/promoCodes';

const CheckoutItemImage = ({ imageUrl, name }: { imageUrl: string | undefined; name: string }) => {
  const [src, setSrc] = React.useState(imageUrl || 'https://images.pexels.com/photos/842535/pexels-photo-842535.jpeg?auto=compress&cs=tinysrgb&w=800');

  React.useEffect(() => {
    if (!imageUrl) {
      setSrc('https://images.pexels.com/photos/842535/pexels-photo-842535.jpeg?auto=compress&cs=tinysrgb&w=800');
      return;
    }

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setSrc(imageUrl);
    img.onerror = () => setSrc('https://images.pexels.com/photos/842535/pexels-photo-842535.jpeg?auto=compress&cs=tinysrgb&w=800');
  }, [imageUrl]);

  return <img src={src} alt={name} className="w-full h-full object-cover rounded-lg" />;
};

export default function Checkout() {
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    postalCode: '',
    comment: '',
  });

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [appliedPromoCodes, setAppliedPromoCodes] = useState<
    Array<{
      code: PromoCode;
      discount: number;
      message: string;
    }>
  >([]);
  const [promoError, setPromoError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getSessionId = () => {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      localStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  };

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      setPromoError('Введіть промокод');
      return;
    }

    setValidatingPromo(true);
    setPromoError('');

    try {
      const sessionId = getSessionId();
      const result = await validatePromoCode(
        promoCodeInput.toUpperCase(),
        items as any,
        sessionId
      );

      if (result.valid && result.promoCode) {
        if (!result.promoCode.allow_multiple && appliedPromoCodes.length > 0) {
          setPromoError('Цей промокод не можна комбінувати з іншими');
          return;
        }

        const alreadyApplied = appliedPromoCodes.find(
          (p) => p.code.id === result.promoCode!.id
        );

        if (alreadyApplied) {
          setPromoError('Цей промокод вже застосовано');
          return;
        }

        let message = '';
        if (result.promoCode.type === 'fixed') {
          message = `Знижка −${result.discountAmount} ₴`;
        } else if (result.promoCode.type === 'percentage') {
          message = `Знижка −${result.promoCode.discount_value}%`;
        } else if (result.promoCode.type === 'free_shipping') {
          message = 'Безкоштовна доставка';
        } else if (result.promoCode.type === 'gift') {
          message = `Подарунок: ${result.giftProduct?.name || 'товар'}`;
        }

        setAppliedPromoCodes((prev) => [
          ...prev,
          {
            code: result.promoCode!,
            discount: result.discountAmount || 0,
            message,
          },
        ]);

        setPromoCodeInput('');
      } else {
        setPromoError(result.error || 'Невірний промокод');
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      setPromoError('Помилка застосування промокоду');
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromoCode = (codeId: string) => {
    setAppliedPromoCodes((prev) => prev.filter((p) => p.code.id !== codeId));
  };

  const getTotalDiscount = () => {
    return appliedPromoCodes.reduce((sum, promo) => sum + promo.discount, 0);
  };

  const getFinalTotal = () => {
    const subtotal = getTotalPrice();
    const discount = getTotalDiscount();
    return Math.max(0, subtotal - discount);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const subtotalAmount = getTotalPrice();
      const discountAmount = getTotalDiscount();
      const totalAmount = getFinalTotal();

      const orderNumber = `ORD-${Date.now()}`;

      const orderItems = items.map((item) => ({
        product_name: item.name,
        product_sku: item.sku,
        price: item.price,
        discount_price: item.discount_price || undefined,
        quantity: item.quantity,
        subtotal: (item.discount_price || item.price) * item.quantity,
        is_on_sale: !!item.discount_price && item.discount_price < item.price,
      }));

      const orderPromoCodes = appliedPromoCodes.map((promo) => ({
        promo_code_name: promo.code.name,
        promo_code_description: promo.message,
        discount_amount: promo.discount,
      }));

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const apiUrl = `${supabaseUrl}/functions/v1/send-telegram-notification`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          order_number: orderNumber,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          address: formData.address,
          postal_code: formData.postalCode,
          comment: formData.comment,
          items: orderItems,
          subtotal_amount: subtotalAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          promo_codes: orderPromoCodes,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error('Failed to send notification');
      }

      setOrderComplete(true);
      clearCart();

      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Помилка оформлення замовлення. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="w-24 h-24 mx-auto text-slate-300 mb-6" />
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Кошик порожній</h1>
            <p className="text-slate-600 mb-8">
              Додайте товари до кошика перед оформленням замовлення
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Перейти до покупок
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="w-24 h-24 mx-auto text-green-500 mb-6" />
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Замовлення оформлено!</h1>
            <p className="text-slate-600 mb-2">Дякуємо за ваше замовлення</p>
            <p className="text-slate-600 mb-8">
              Ми зв'яжемось з вами найближчим часом для підтвердження
            </p>
            <p className="text-sm text-slate-500">Перенаправлення на головну сторінку...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            title="Повернутися до кошика"
          >
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Оформлення замовлення</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Контактні дані</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ім'я *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Прізвище *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+380"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Адреса доставки</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Місто *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Адреса *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="Вулиця, будинок, квартира"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Поштовий індекс
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Коментар до замовлення
                    </label>
                    <textarea
                      name="comment"
                      value={formData.comment}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Оформлення...' : 'Підтвердити замовлення'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Ваше замовлення</h2>

              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b border-slate-200">
                    <div className="w-16 h-16">
                      <CheckoutItemImage imageUrl={item.image_url} name={item.name} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-slate-900">{item.name}</h3>
                      <p className="text-sm text-slate-600">
                        {item.quantity} × {item.discount_price || item.price} ₴
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Промокод
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => {
                        setPromoCodeInput(e.target.value.toUpperCase());
                        setPromoError('');
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyPromoCode();
                        }
                      }}
                      placeholder="Введіть код"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromoCode}
                      disabled={validatingPromo}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Tag className="w-4 h-4" />
                      {validatingPromo ? '...' : 'Застосувати'}
                    </button>
                  </div>
                  {promoError && (
                    <p className="text-sm text-red-600">{promoError}</p>
                  )}
                </div>

                {appliedPromoCodes.length > 0 && (
                  <div className="space-y-2 border-t border-slate-200 pt-3">
                    {appliedPromoCodes.map((promo) => (
                      <div
                        key={promo.code.id}
                        className="flex items-center justify-between bg-green-50 p-2 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">
                            {promo.code.name}
                          </p>
                          <p className="text-xs text-green-600">{promo.message}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePromoCode(promo.code.id)}
                          className="p-1 hover:bg-green-100 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-green-700" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-slate-200 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Товарів:</span>
                    <span>{items.reduce((sum, item) => sum + item.quantity, 0)} шт</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Підсумок:</span>
                    <span className={getTotalDiscount() > 0 ? 'line-through text-slate-400' : ''}>
                      {getTotalPrice().toFixed(2)} ₴
                    </span>
                  </div>

                  {getTotalDiscount() > 0 && (
                    <>
                      <div className="flex items-center justify-between text-green-600 font-medium">
                        <span>Знижка:</span>
                        <span>−{getTotalDiscount().toFixed(2)} ₴</span>
                      </div>
                      <div className="flex items-center justify-between text-lg font-semibold text-blue-600">
                        <span>Ціна зі знижкою:</span>
                        <span>{getFinalTotal().toFixed(2)} ₴</span>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Доставка:</span>
                    <span>
                      {appliedPromoCodes.some((p) => p.code.type === 'free_shipping')
                        ? 'Безкоштовно'
                        : 'За тарифами'}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between text-xl font-bold text-slate-900">
                      <span>Разом:</span>
                      <span>{getFinalTotal().toFixed(2)} ₴</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
