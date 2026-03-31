import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('rlm_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('rlm_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1, variation = '') => {
    setItems(prev => {
      const key = `${product.id}-${variation}`;
      const existing = prev.find(i => `${i.product_id}-${i.variation}` === key);
      if (existing) {
        return prev.map(i =>
          `${i.product_id}-${i.variation}` === key
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        compare_price: product.compare_price,
        image: product.images?.[0] || '',
        quantity,
        variation,
        slug: product.slug,
        free_shipping: product.free_shipping,
      }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId, variation = '') => {
    setItems(prev => prev.filter(i => !(`${i.product_id}-${i.variation}` === `${productId}-${variation}`)));
  };

  const updateQuantity = (productId, variation, quantity) => {
    if (quantity < 1) return removeItem(productId, variation);
    setItems(prev =>
      prev.map(i =>
        `${i.product_id}-${i.variation}` === `${productId}-${variation}`
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      itemCount, subtotal, isOpen, setIsOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);