import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  async function fetchCart() {
    const r = await axios.get('/api/cart');
    setCart(r.data);
  }

  async function addToCart(productId, qty = 1) {
    const r = await axios.post('/api/cart', { productId, qty });
    setCart(r.data);
  }

  async function updateQty(productId, qty) {
    const r = await axios.put(`/api/cart/${productId}`, { qty });
    setCart(r.data);
  }

  async function removeFromCart(productId) {
    const r = await axios.delete(`/api/cart/${productId}`);
    setCart(r.data);
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, total, fetchCart, addToCart, updateQty, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
