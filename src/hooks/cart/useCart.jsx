import { useCallback } from "react";
import useGetCart from "./useGetCart";
import useGetCartCount from "./useGetCartCount";
import useAddCart from "./useAddCart";
import useUpdateCartItem from "./useUpdateCartItem";
import useDeleteCart from "./useDeleteCart";
import useAddMultipleCart from "./useAddMultipleCart";
import useClearCart from "./useClearCart";
import useApplyCoupon from "./useApplyCoupon";
import useRemoveCoupon from "./useRemoveCoupon";
import CartService from "../../services/api/cart";

/**
 * Comprehensive cart hook that provides all cart operations
 * @returns {Object} Cart state and operations
 */
const useCart = () => {
  // Get cart data
  const {
    data: cartData,
    isLoading: isCartLoading,
    isError: isCartError,
    refetch: refetchCart,
  } = useGetCart();

  // Get cart count
  const {
    count: cartCount,
    isLoading: isCountLoading,
    refetch: refetchCount,
  } = useGetCartCount();

  // Mutations
  const { addCartMutate, isPending: isAdding } = useAddCart();
  const { updateCartItemMutate, isPending: isUpdating } = useUpdateCartItem();
  const { deleteCartMutate, isPending: isDeleting } = useDeleteCart();
  const { addMultipleCartMutate, isPending: isAddingMultiple } = useAddMultipleCart();
  const { clearCartMutate, isPending: isClearing } = useClearCart();
  const { applyCouponMutate, isPending: isApplyingCoupon } = useApplyCoupon();
  const { removeCouponMutate, isPending: isRemovingCoupon } = useRemoveCoupon();

  // Cart calculations
  const cartTotals = useCallback(() => {
    if (!cartData?.items) return null;
    return CartService.calculateCartTotals(cartData.items);
  }, [cartData?.items]);

  // Helper functions
  const addToCart = useCallback((productId, productType, quantity = 1) => {
    console.log("🛒 useCart: Adding item to cart", { productId, productType, quantity });
    addCartMutate({
      product_id: productId,
      product_type: productType,
      quantity: quantity,
    });
  }, [addCartMutate]);

  const updateQuantity = useCallback((itemId, newQuantity) => {
    console.log("🛒 useCart: Updating item quantity", { itemId, newQuantity });
    if (newQuantity <= 0) {
      deleteCartMutate({ id: itemId });
    } else {
      updateCartItemMutate({ id: itemId, quantity: newQuantity });
    }
  }, [updateCartItemMutate, deleteCartMutate]);

  const removeItem = useCallback((itemId) => {
    console.log("🛒 useCart: Removing item from cart", { itemId });
    deleteCartMutate({ id: itemId });
  }, [deleteCartMutate]);

  const addMultipleItems = useCallback((items) => {
    console.log("🛒 useCart: Adding multiple items to cart", { itemCount: items.length });
    addMultipleCartMutate({ items });
  }, [addMultipleCartMutate]);

  const clearCart = useCallback(() => {
    console.log("🛒 useCart: Clearing cart");
    clearCartMutate();
  }, [clearCartMutate]);

  const applyCoupon = useCallback((couponCode) => {
    console.log("🛒 useCart: Applying coupon", { couponCode });
    applyCouponMutate({ coupon_code: couponCode });
  }, [applyCouponMutate]);

  const removeCoupon = useCallback(() => {
    console.log("🛒 useCart: Removing coupon");
    removeCouponMutate();
  }, [removeCouponMutate]);

  const incrementQuantity = useCallback((itemId) => {
    const item = cartData?.items?.find(item => item.id === itemId);
    if (item) {
      updateQuantity(itemId, (item.quantity || 1) + 1);
    }
  }, [cartData?.items, updateQuantity]);

  const decrementQuantity = useCallback((itemId) => {
    const item = cartData?.items?.find(item => item.id === itemId);
    if (item) {
      updateQuantity(itemId, (item.quantity || 1) - 1);
    }
  }, [cartData?.items, updateQuantity]);

  const getItemById = useCallback((itemId) => {
    return cartData?.items?.find(item => item.id === itemId) || null;
  }, [cartData?.items]);

  const isItemInCart = useCallback((productId, productType) => {
    return cartData?.items?.some(item =>
      item.product_id === productId && item.product_type === productType
    ) || false;
  }, [cartData?.items]);

  const getItemQuantity = useCallback((productId, productType) => {
    const item = cartData?.items?.find(item =>
      item.product_id === productId && item.product_type === productType
    );
    return item?.quantity || 0;
  }, [cartData?.items]);

  // Refresh cart data
  const refreshCart = useCallback(() => {
    console.log("🛒 useCart: Refreshing cart data");
    refetchCart();
    refetchCount();
  }, [refetchCart, refetchCount]);

  return {
    // Cart data
    cartData,
    items: cartData?.items || [],
    user: cartData?.user,
    cartCount,
    totals: cartTotals(),

    // Loading states
    isLoading: isCartLoading || isCountLoading,
    isCartLoading,
    isCountLoading,
    isError: isCartError,

    // Mutation states
    isAdding,
    isUpdating,
    isDeleting,
    isAddingMultiple,
    isClearing,
    isApplyingCoupon,
    isRemovingCoupon,
    isProcessing: isAdding || isUpdating || isDeleting || isAddingMultiple || isClearing || isApplyingCoupon || isRemovingCoupon,

    // Cart operations
    addToCart,
    updateQuantity,
    removeItem,
    addMultipleItems,
    clearCart,
    applyCoupon,
    removeCoupon,
    incrementQuantity,
    decrementQuantity,
    refreshCart,

    // Helper functions
    getItemById,
    isItemInCart,
    getItemQuantity,

    // Computed values
    isEmpty: !cartData?.items || cartData.items.length === 0,
    itemCount: cartData?.items?.length || 0,
    totalQuantity: cartData?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0,
    hasItems: cartData?.items && cartData.items.length > 0,

    // Raw mutation functions (for advanced use cases)
    mutations: {
      addCartMutate,
      updateCartItemMutate,
      deleteCartMutate,
      addMultipleCartMutate,
      clearCartMutate,
      applyCouponMutate,
      removeCouponMutate,
    },
  };
};

export default useCart;
