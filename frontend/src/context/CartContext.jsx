import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('neo_basket');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastAdded, setLastAdded] = useState(null);

  useEffect(() => {
    localStorage.setItem('neo_basket', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (med) => {
    // Logic: Strictly ensure the medicine object is valid
    if (!med || !med.id) return;

    setCart(prev => {
      const exists = prev.find(i => i.id === med.id);
      if (exists) {
        return prev.map(i => i.id === med.id ? { ...i, quantity: i.quantity + (med.quantity || 1) } : i);
      }
      return [...prev, { ...med, quantity: med.quantity || 1 }];
    });
    
    // Trigger visual alert & Toast strictly
    setLastAdded({ name: med.name, id: Date.now() });
    
    // Clear animation state after 3 seconds
    setTimeout(() => setLastAdded(null), 3000);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id, q) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, q) } : i));
  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, i) => sum + (parseFloat(i.price) * i.quantity), 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount, lastAdded }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);