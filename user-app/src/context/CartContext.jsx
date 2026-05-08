import { createContext, useContext, useReducer } from 'react';

const Ctx = createContext(null);

function reducer(state, { type, payload }) {
  switch (type) {
    case 'ADD': {
      const ex = state.find(i => i.productId === payload.productId);
      if (ex) return state.map(i => i.productId === payload.productId ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...payload, qty: 1 }];
    }
    case 'UPDATE': return state.map(i => i.productId === payload.productId ? { ...i, qty: payload.qty } : i)
                               .filter(i => i.qty > 0);
    case 'REMOVE': return state.filter(i => i.productId !== payload.productId);
    case 'CLEAR':  return [];
    default:       return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(reducer, []);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <Ctx.Provider value={{
      cart, total, count,
      add:    p => dispatch({ type: 'ADD',    payload: p }),
      update: (productId, qty) => dispatch({ type: 'UPDATE', payload: { productId, qty } }),
      remove: productId        => dispatch({ type: 'REMOVE', payload: { productId } }),
      clear:  ()               => dispatch({ type: 'CLEAR' }),
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => useContext(Ctx);
