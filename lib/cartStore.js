import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addToCart: (product) => {
        const items = get().items;
        const existingItem = items.find((item) => item._id === product._id);

        if (existingItem) {
          const updatedItems = items.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          set({
            items: updatedItems,
            total: get().total + product.price,
          });
        } else {
          set({
            items: [...items, { ...product, quantity: 1 }],
            total: get().total + product.price,
          });
        }
      },
      removeFromCart: (productId) => {
        const items = get().items;
        const itemToRemove = items.find((item) => item._id === productId);

        if (itemToRemove) {
          const updatedItems = items.filter((item) => item._id !== productId);
          set({
            items: updatedItems,
            total: get().total - itemToRemove.price * itemToRemove.quantity,
          });
        }
      },
      updateQuantity: (productId, newQuantity) => {
        const items = get().items;
        const item = items.find((item) => item._id === productId);
        
        if (item && newQuantity > 0) {
          const quantityDiff = newQuantity - item.quantity;
          const updatedItems = items.map((item) =>
            item._id === productId
              ? { ...item, quantity: newQuantity }
              : item
          );
          set({
            items: updatedItems,
            total: get().total + (item.price * quantityDiff),
          });
        } else if (newQuantity <= 0) {
          get().removeFromCart(productId);
        }
      },
      increaseQuantity: (productId) => {
        const items = get().items;
        const item = items.find((item) => item._id === productId);
        if (item) {
          get().updateQuantity(productId, item.quantity + 1);
        }
      },
      decreaseQuantity: (productId) => {
        const items = get().items;
        const item = items.find((item) => item._id === productId);
        if (item) {
          get().updateQuantity(productId, item.quantity - 1);
        }
      },
      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'cart-storage', // unique name
    }
  )
);

export default useCartStore;
