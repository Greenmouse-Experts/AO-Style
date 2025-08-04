# Cart System Documentation

## Overview

This documentation covers the comprehensive cart system implementation for AO-Style. The system provides full CRUD operations for cart management with React Query hooks, context state management, and professional error handling.

## API Endpoints

Based on the API responses shown in the images, the following endpoints are implemented:

### Core Cart Operations
- **POST** `/cart/add` - Add item to cart
- **GET** `/cart` - Get cart details with all items
- **PUT** `/cart/item/{id}` - Update cart item quantity
- **DELETE** `/cart/item/{id}` - Remove item from cart

### Additional Operations
- **POST** `/cart/add-multiple` - Add multiple items to cart
- **DELETE** `/cart/clear` - Clear entire cart
- **GET** `/cart/count` - Get cart item count
- **POST** `/cart/apply-coupon` - Apply coupon to cart
- **DELETE** `/cart/remove-coupon` - Remove coupon from cart

## File Structure

```
src/
├── services/api/cart/
│   └── index.jsx                 # Cart API service
├── hooks/cart/
│   ├── index.jsx                 # Export all cart hooks
│   ├── useCart.jsx               # Comprehensive cart hook
│   ├── useGetCart.jsx            # Get cart data
│   ├── useGetCartCount.jsx       # Get cart count
│   ├── useAddCart.jsx            # Add item to cart
│   ├── useUpdateCartItem.jsx     # Update cart item
│   ├── useDeleteCart.jsx         # Remove cart item
│   ├── useAddMultipleCart.jsx    # Add multiple items
│   ├── useClearCart.jsx          # Clear entire cart
│   ├── useApplyCoupon.jsx        # Apply coupon
│   ├── useRemoveCoupon.jsx       # Remove coupon
│   ├── useCreatePayment.jsx      # Create payment
│   └── useVerifyPayment.jsx      # Verify payment
├── contexts/
│   └── CartContext.jsx           # Global cart state management
└── components/cart/
    └── CartComponent.jsx         # Sample cart UI component
```

## Cart Service API

### Import
```javascript
import CartService from '../../services/api/cart';
```

### Methods

#### Core Operations
```javascript
// Add item to cart
CartService.addToCart({
  product_id: "product-id",
  product_type: "STYLE", // or "COURSE"
  quantity: 1
});

// Get cart details
CartService.getCart();

// Update cart item quantity
CartService.updateCartItem({
  id: "cart-item-id",
  quantity: 2
});

// Remove item from cart
CartService.removeFromCart({
  id: "cart-item-id"
});
```

#### Bulk Operations
```javascript
// Add multiple items
CartService.addMultipleToCart({
  items: [
    { product_id: "id1", product_type: "STYLE", quantity: 1 },
    { product_id: "id2", product_type: "COURSE", quantity: 2 }
  ]
});

// Clear entire cart
CartService.clearCart();
```

#### Additional Features
```javascript
// Get cart count
CartService.getCartCount();

// Apply coupon
CartService.applyCoupon({
  coupon_code: "DISCOUNT10"
});

// Remove coupon
CartService.removeCoupon();

// Calculate totals
CartService.calculateCartTotals(cartItems);
```

## React Hooks Usage

### Individual Hooks

```javascript
import { 
  useGetCart, 
  useAddCart, 
  useUpdateCartItem, 
  useDeleteCart 
} from '../hooks/cart';

// In your component
const { data: cartData, isLoading } = useGetCart();
const { addCartMutate, isPending: isAdding } = useAddCart();
const { updateCartItemMutate } = useUpdateCartItem();
const { deleteCartMutate } = useDeleteCart();

// Add item to cart
const handleAddToCart = () => {
  addCartMutate({
    product_id: "product-123",
    product_type: "STYLE",
    quantity: 1
  });
};

// Update quantity
const handleUpdateQuantity = (itemId, newQuantity) => {
  updateCartItemMutate({
    id: itemId,
    quantity: newQuantity
  });
};

// Remove item
const handleRemoveItem = (itemId) => {
  deleteCartMutate({
    id: itemId
  });
};
```

### Comprehensive Cart Hook

```javascript
import { useCart } from '../hooks/cart';

const MyComponent = () => {
  const {
    // Cart data
    items,
    cartData,
    cartCount,
    totals,
    
    // Loading states
    isLoading,
    isProcessing,
    
    // Operations
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    
    // Helper functions
    isItemInCart,
    getItemQuantity,
    formatPrice,
    
    // Computed values
    isEmpty,
    itemCount,
    totalQuantity
  } = useCart();

  return (
    <div>
      <p>Cart has {itemCount} items</p>
      <p>Total: {formatPrice(totals?.total)}</p>
      
      <button 
        onClick={() => addToCart("product-123", "STYLE", 1)}
        disabled={isProcessing}
      >
        Add to Cart
      </button>
      
      {items.map(item => (
        <div key={item.id}>
          <span>{item.name}</span>
          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
            +
          </button>
          <span>{item.quantity}</span>
          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
            -
          </button>
          <button onClick={() => removeItem(item.id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};
```

## Context State Management

### Setup CartProvider

```javascript
import { CartProvider } from '../contexts/CartContext';

// Wrap your app or relevant components
function App() {
  return (
    <CartProvider>
      <YourAppComponents />
    </CartProvider>
  );
}
```

### Using Cart Context

```javascript
import { useCartContext } from '../contexts/CartContext';

const MyComponent = () => {
  const {
    // All cart data and operations
    items,
    cartSummary,
    isLoading,
    
    // UI state
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    
    // Enhanced operations
    addToCartWithFeedback,
    removeItemWithConfirmation,
    clearCartWithConfirmation,
    
    // Utility functions
    formatPrice,
    getItemTotal,
    isProductInCart,
    getProductQuantity
  } = useCartContext();

  return (
    <div>
      <button onClick={toggleCart}>
        Cart ({cartSummary.itemCount})
      </button>
      
      <button onClick={() => addToCartWithFeedback("product-123", "STYLE", 1)}>
        Add to Cart
      </button>
      
      {isProductInCart("product-123", "STYLE") && (
        <p>Quantity in cart: {getProductQuantity("product-123", "STYLE")}</p>
      )}
    </div>
  );
};
```

## Cart Data Structure

### Cart Response Format
```javascript
{
  "statusCode": 200,
  "data": {
    "id": "1b68626a-ec92-4c12-aca7-7213bb4a25d0",
    "user": {
      "id": "989daa32-12f5-4383-aa8d-c0ac3b560d92",
      "name": "green market customer26",
      "email": "greenmousedev+green-ct26@gmail.com",
      // ... other user fields
    },
    "created_at": "2025-07-04T10:44:12.912Z",
    "updated_at": "2025-07-04T10:44:12.912Z",
    "items": [
      {
        "id": "745280ac-f799-4c45-837c-4a959c9f2dd",
        "cart_id": "1b68626a-ec92-4c12-aca7-7213bb4a25d0",
        "product_id": "29fda084-4b4b-47ed-a9df-5ed8f909f688",
        "product_type": "STYLE",
        "quantity": 1,
        "price_at_time": "50000",
        "created_at": "2025-07-04T10:44:12.938Z",
        "updated_at": "2025-07-04T10:44:12.938Z",
        "deleted_at": null,
        "product": {
          "id": "29fda084-4b4b-47ed-a9df-5ed8f909f688",
          "name": "Test style 3",
          "description": "Test style description",
          "price": "50000",
          "type": "STYLE",
          "status": "PUBLISHED"
          // ... other product fields
        }
      }
    ],
    "count": 1
  }
}
```

### Cart Item Structure
```javascript
{
  "id": "cart-item-id",
  "cart_id": "cart-id",
  "product_id": "product-id",
  "product_type": "STYLE", // or "COURSE"
  "quantity": 1,
  "price_at_time": "50000",
  "created_at": "2025-07-04T10:44:12.938Z",
  "updated_at": "2025-07-04T10:44:12.938Z",
  "product": {
    "id": "product-id",
    "name": "Product Name",
    "description": "Product Description",
    "price": "50000",
    "type": "STYLE",
    "status": "PUBLISHED"
  }
}
```

## Error Handling

### Service Level
```javascript
// All service methods include try-catch with console logging
try {
  console.log("🛒 Adding item to cart:", payload);
  const response = await CaryBinApi.post(`/cart/add`, payload);
  console.log("✅ Item added to cart successfully:", response.data);
  return response;
} catch (error) {
  console.error("❌ Error adding item to cart:", error.response?.data || error.message);
  throw error;
}
```

### Hook Level
```javascript
// React Query hooks handle errors with toast notifications
onError: (error) => {
  if (!navigator.onLine) {
    toastError("No internet connection. Please check your network.");
    return;
  }

  if (Array.isArray(error?.data?.message)) {
    toastError(error?.data?.message[0]);
  } else {
    toastError(error?.data?.message || "Failed to add item to cart");
  }
}
```

## Features

### ✅ Implemented Features
- Add item to cart
- Get cart details
- Update item quantity
- Remove item from cart
- Add multiple items
- Clear entire cart
- Get cart count
- Apply/remove coupons
- Cart totals calculation
- React Query integration
- Context state management
- Error handling with toast notifications
- Loading states
- Offline detection
- Console logging for debugging

### 🛠️ Utility Functions
- **Price formatting**: Formats prices in Nigerian Naira (₦)
- **Cart calculations**: Subtotal, tax, shipping, total
- **Item helpers**: Check if item in cart, get quantities
- **Validation**: Online status, required fields

### 📱 UI Features
- Cart sidebar/drawer
- Item quantity controls
- Coupon application
- Cart summary
- Loading indicators
- Empty cart state
- Debug information (development only)

## Usage Examples

### Basic Cart Operations
```javascript
// Add item to cart
const handleAddToCart = async (productId, productType, quantity = 1) => {
  try {
    await CartService.addToCart({
      product_id: productId,
      product_type: productType,
      quantity: quantity
    });
    console.log("Item added successfully");
  } catch (error) {
    console.error("Failed to add item:", error);
  }
};

// Update item quantity
const handleUpdateQuantity = async (itemId, newQuantity) => {
  try {
    await CartService.updateCartItem({
      id: itemId,
      quantity: newQuantity
    });
    console.log("Quantity updated successfully");
  } catch (error) {
    console.error("Failed to update quantity:", error);
  }
};

// Remove item from cart
const handleRemoveItem = async (itemId) => {
  try {
    await CartService.removeFromCart({
      id: itemId
    });
    console.log("Item removed successfully");
  } catch (error) {
    console.error("Failed to remove item:", error);
  }
};
```

### Using with React Components
```javascript
import React from 'react';
import { useCart } from '../hooks/cart';

const ProductCard = ({ product }) => {
  const { addToCart, isItemInCart, getItemQuantity, isProcessing } = useCart();
  
  const inCart = isItemInCart(product.id, product.type);
  const quantity = getItemQuantity(product.id, product.type);

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p>₦{product.price}</p>
      
      {inCart ? (
        <p>In cart: {quantity}</p>
      ) : (
        <button 
          onClick={() => addToCart(product.id, product.type, 1)}
          disabled={isProcessing}
        >
          Add to Cart
        </button>
      )}
    </div>
  );
};
```

## Testing

### Test Data Structure
```javascript
// Sample add to cart payload
{
  "product_id": "7547be05-a01a-44a0-965d-67e00f6bcabf",
  "product_type": "COURSE",
  "quantity": 1
}

// Sample update payload
{
  "quantity": 2
}
```

### Console Logs
All operations include detailed console logging:
- 🛒 Cart operations
- ✅ Success messages
- ❌ Error messages
- 📊 Cart summaries
- 🔄 Loading states

## Migration Guide

### From Old System
If migrating from the old cart system:

1. **Update imports**:
   ```javascript
   // Old
   import CartService from '../services/api/cart';
   const response = await CartService.addCartProduct(payload);
   
   // New
   import CartService from '../services/api/cart';
   const response = await CartService.addToCart(payload);
   ```

2. **Use new hooks**:
   ```javascript
   // Old
   const { addCartMutate } = useAddCart();
   
   // New (still works for compatibility)
   const { addCartMutate } = useAddCart();
   // OR use the comprehensive hook
   const { addToCart } = useCart();
   ```

3. **Implement context** (optional but recommended):
   ```javascript
   // Wrap your app
   <CartProvider>
     <App />
   </CartProvider>
   ```

## Best Practices

1. **Use the comprehensive `useCart` hook** for most use cases
2. **Implement `CartProvider`** for global state management
3. **Handle loading states** in your UI
4. **Show appropriate error messages** to users
5. **Use console logs** for debugging in development
6. **Validate user input** before making API calls
7. **Implement optimistic updates** where appropriate
8. **Cache cart data** with React Query's built-in caching

## Troubleshooting

### Common Issues

1. **Cart not loading**:
   - Check network connection
   - Verify authentication token
   - Check console for API errors

2. **Items not updating**:
   - Ensure React Query cache invalidation
   - Check if mutations are properly configured
   - Verify API endpoint responses

3. **Context not working**:
   - Ensure `CartProvider` wraps your components
   - Check if `useCartContext` is called within provider

4. **Console errors**:
   - All operations include detailed logging
   - Check network tab for API response details
   - Verify payload structure matches API requirements

### Debug Mode
In development, the cart component shows debug information:
```javascript
{process.env.NODE_ENV === 'development' && (
  <div className="cart-debug">
    <details>
      <summary>Debug Info</summary>
      <pre>{JSON.stringify(cartSummary, null, 2)}</pre>
    </details>
  </div>
)}
```

## API Response Examples

### Successful Add to Cart
```json
{
  "statusCode": 200,
  "message": "Item saved in the cart"
}
```

### Successful Update
```json
{
  "statusCode": 200,
  "message": "Cart updated successfully."
}
```

### Successful Delete
```json
{
  "statusCode": 200,
  "message": "Item removed from cart successfully."
}
```

This cart system provides a robust, scalable, and user-friendly solution for managing shopping cart operations in the AO-Style application.