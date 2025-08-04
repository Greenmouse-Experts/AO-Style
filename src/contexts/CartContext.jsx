import React, { createContext, useContext, useEffect, useState } from 'react';
import useCart from '../hooks/cart/useCart';

// Create the Cart Context
const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const cart = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartInitialized, setCartInitialized] = useState(false);

  // Initialize cart on mount
  useEffect(() => {
    if (!cartInitialized && !cart.isLoading) {
      console.log('🛒 CartContext: Initializing cart...');
      cart.refreshCart();
      setCartInitialized(true);
    }
  }, [cart.isLoading, cartInitialized, cart.refreshCart]);

  // Log cart changes for debugging
  useEffect(() => {
    if (cart.cartData) {
      console.log('🛒 CartContext: Cart data updated:', {
        itemCount: cart.itemCount,
        totalQuantity: cart.totalQuantity,
        isEmpty: cart.isEmpty,
        totals: cart.totals,
      });
    }
  }, [cart.cartData, cart.itemCount, cart.totalQuantity, cart.isEmpty, cart.totals]);

  // Cart UI controls
  const openCart = () => {
    console.log('🛒 CartContext: Opening cart');
    setIsCartOpen(true);
  };

  const closeCart = () => {
    console.log('🛒 CartContext: Closing cart');
    setIsCartOpen(false);
  };

  const toggleCart = () => {
    console.log('🛒 CartContext: Toggling cart');
    setIsCartOpen(prev => !prev);
  };

  // Enhanced cart operations with UI feedback
  const addToCartWithFeedback = async (productId, productType, quantity = 1) => {
    try {
      console.log('🛒 CartContext: Adding item with feedback', { productId, productType, quantity });
      await cart.addToCart(productId, productType, quantity);
      // Optionally auto-open cart after adding item
      // openCart();
    } catch (error) {
      console.error('🛒 CartContext: Error adding item:', error);
    }
  };

  const removeItemWithConfirmation = async (itemId, itemName = 'item') => {
    try {
      console.log('🛒 CartContext: Removing item with confirmation', { itemId, itemName });
      // You can add a confirmation dialog here if needed
      await cart.removeItem(itemId);
    } catch (error) {
      console.error('🛒 CartContext: Error removing item:', error);
    }
  };

  const clearCartWithConfirmation = async () => {
    try {
      console.log('🛒 CartContext: Clearing cart with confirmation');
      // You can add a confirmation dialog here if needed
      await cart.clearCart();
      closeCart();
    } catch (error) {
      console.error('🛒 CartContext: Error clearing cart:', error);
    }
  };

  // Cart summary calculations
  const cartSummary = {
    subtotal: cart.totals?.subtotal || 0,
    tax: cart.totals?.tax || 0,
    shipping: cart.totals?.shipping || 0,
    total: cart.totals?.total || 0,
    itemCount: cart.itemCount,
    totalQuantity: cart.totalQuantity,
    isEmpty: cart.isEmpty,
    hasItems: cart.hasItems,
  };

  // Context value
  const contextValue = {
    // Cart data
    ...cart,

    // UI state
    isCartOpen,
    cartInitialized,

    // UI controls
    openCart,
    closeCart,
    toggleCart,

    // Enhanced operations
    addToCartWithFeedback,
    removeItemWithConfirmation,
    clearCartWithConfirmation,

    // Summary
    cartSummary,

    // Utility functions
    formatPrice: (price) => {
      const numPrice = parseFloat(price || 0);
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(numPrice);
    },

    // Cart item helpers
    getItemTotal: (item) => {
      const price = parseFloat(item.price || item.price_at_time || 0);
      const quantity = parseInt(item.quantity || 1);
      return price * quantity;
    },

    // Product availability check
    isProductInCart: (productId, productType) => {
      return cart.isItemInCart(productId, productType);
    },

    // Get product quantity in cart
    getProductQuantity: (productId, productType) => {
      return cart.getItemQuantity(productId, productType);
    },
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the Cart Context
export const useCartContext = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider');
  }

  return context;
};

// HOC for components that need cart access
export const withCart = (Component) => {
  return function CartWrappedComponent(props) {
    const cart = useCartContext();
    return <Component {...props} cart={cart} />;
  };
};

export default CartContext;
