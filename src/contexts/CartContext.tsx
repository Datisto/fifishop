import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  discount_price?: number;
  quantity: number;
  image_url?: string;
  sku: string;
  stock_quantity: number;
}

interface UndoAction {
  type: 'remove' | 'update';
  item: CartItem;
  previousQuantity?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  undoAction: UndoAction | null;
  undo: () => void;
  clearUndo: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'shopping_cart';
const UNDO_TIMEOUT = 5000;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [undoAction, setUndoAction] = useState<UndoAction | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const clearUndoTimeout = () => {
    if (undoTimeout) {
      clearTimeout(undoTimeout);
      setUndoTimeout(null);
    }
  };

  const setUndoWithTimeout = (action: UndoAction) => {
    clearUndoTimeout();
    setUndoAction(action);

    const timeout = setTimeout(() => {
      setUndoAction(null);
    }, UNDO_TIMEOUT);

    setUndoTimeout(timeout);
  };

  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);

      if (existingItem) {
        if (existingItem.quantity + item.quantity > item.stock_quantity) {
          alert('Недостатньо товару на складі');
          return prevItems;
        }

        return prevItems.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }

      if (item.quantity > item.stock_quantity) {
        alert('Недостатньо товару на складі');
        return prevItems;
      }

      return [...prevItems, item];
    });
  };

  const removeItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      setUndoWithTimeout({ type: 'remove', item });
      setItems((prevItems) => prevItems.filter((i) => i.id !== id));
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    const item = items.find((i) => i.id === id);

    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    if (item) {
      if (quantity > item.stock_quantity) {
        alert('Недостатньо товару на складі');
        return;
      }

      setUndoWithTimeout({
        type: 'update',
        item,
        previousQuantity: item.quantity,
      });

      setItems((prevItems) =>
        prevItems.map((i) =>
          i.id === id ? { ...i, quantity } : i
        )
      );
    }
  };

  const clearCart = () => {
    setItems([]);
    clearUndoTimeout();
    setUndoAction(null);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.discount_price || item.price;
      return total + price * item.quantity;
    }, 0);
  };

  const undo = () => {
    if (!undoAction) return;

    if (undoAction.type === 'remove') {
      setItems((prevItems) => [...prevItems, undoAction.item]);
    } else if (undoAction.type === 'update' && undoAction.previousQuantity !== undefined) {
      setItems((prevItems) =>
        prevItems.map((i) =>
          i.id === undoAction.item.id
            ? { ...i, quantity: undoAction.previousQuantity! }
            : i
        )
      );
    }

    clearUndoTimeout();
    setUndoAction(null);
  };

  const clearUndo = () => {
    clearUndoTimeout();
    setUndoAction(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        undoAction,
        undo,
        clearUndo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
