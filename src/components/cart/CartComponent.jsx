import React, { useState } from 'react';
import { useCartContext } from '../../contexts/CartContext';

const CartComponent = () => {
  const {
    items,
    cartSummary,
    isLoading,
    isProcessing,
    addToCartWithFeedback,
    removeItemWithConfirmation,
    incrementQuantity,
    decrementQuantity,
    clearCartWithConfirmation,
    applyCoupon,
    removeCoupon,
    formatPrice,
    getItemTotal,
    isCartOpen,
    closeCart,
  } = useCartContext();

  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      applyCoupon(couponCode.trim());
      setCouponCode('');
    }
  };

  const handleAddSampleItem = () => {
    // Example of adding a sample item
    addToCartWithFeedback(
      'sample-product-id',
      'STYLE',
      1
    );
  };

  if (isLoading) {
    return (
      <div className="cart-loading">
        <div className="loading-spinner"></div>
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className={`cart-component ${isCartOpen ? 'cart-open' : ''}`}>
      {/* Cart Header */}
      <div className="cart-header">
        <h2>Shopping Cart ({cartSummary.itemCount})</h2>
        <button
          className="cart-close-btn"
          onClick={closeCart}
          aria-label="Close cart"
        >
          ✕
        </button>
      </div>

      {/* Cart Content */}
      <div className="cart-content">
        {cartSummary.isEmpty ? (
          <div className="cart-empty">
            <p>Your cart is empty</p>
            <button onClick={handleAddSampleItem} className="add-sample-btn">
              Add Sample Item
            </button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <h4>{item.name || `Product ${item.product_id}`}</h4>
                    <p className="item-type">{item.product_type}</p>
                    <p className="item-price">{formatPrice(item.price || item.price_at_time)}</p>
                  </div>

                  <div className="item-quantity">
                    <button
                      onClick={() => decrementQuantity(item.id)}
                      disabled={isProcessing}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      onClick={() => incrementQuantity(item.id)}
                      disabled={isProcessing}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    {formatPrice(getItemTotal(item))}
                  </div>

                  <button
                    onClick={() => removeItemWithConfirmation(item.id, item.name)}
                    disabled={isProcessing}
                    className="remove-btn"
                    aria-label="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="cart-coupon">
              <div className="coupon-input">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="coupon-field"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={isProcessing || !couponCode.trim()}
                  className="apply-coupon-btn"
                >
                  Apply
                </button>
              </div>
              <button
                onClick={removeCoupon}
                disabled={isProcessing}
                className="remove-coupon-btn"
              >
                Remove Coupon
              </button>
            </div>

            {/* Cart Summary */}
            <div className="cart-summary">
              <div className="summary-line">
                <span>Subtotal:</span>
                <span>{formatPrice(cartSummary.subtotal)}</span>
              </div>
              <div className="summary-line">
                <span>Tax:</span>
                <span>{formatPrice(cartSummary.tax)}</span>
              </div>
              <div className="summary-line">
                <span>Shipping:</span>
                <span>{formatPrice(cartSummary.shipping)}</span>
              </div>
              <div className="summary-line total">
                <span>Total:</span>
                <span>{formatPrice(cartSummary.total)}</span>
              </div>
            </div>

            {/* Cart Actions */}
            <div className="cart-actions">
              <button
                onClick={clearCartWithConfirmation}
                disabled={isProcessing}
                className="clear-cart-btn"
              >
                Clear Cart
              </button>
              <button
                disabled={isProcessing}
                className="checkout-btn"
              >
                {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="cart-debug">
          <details>
            <summary>Debug Info</summary>
            <pre>{JSON.stringify(cartSummary, null, 2)}</pre>
          </details>
        </div>
      )}

      <style jsx>{`
        .cart-component {
          position: fixed;
          top: 0;
          right: -400px;
          width: 400px;
          height: 100vh;
          background: white;
          box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
          transition: right 0.3s ease;
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }

        .cart-open {
          right: 0;
        }

        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }

        .cart-close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        .cart-content {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .cart-empty {
          text-align: center;
          padding: 2rem;
        }

        .add-sample-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 1rem;
        }

        .cart-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid #eee;
        }

        .item-info {
          flex: 1;
        }

        .item-info h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
        }

        .item-type {
          font-size: 0.8rem;
          color: #666;
          margin: 0;
        }

        .item-price {
          font-weight: bold;
          margin: 0.5rem 0 0 0;
        }

        .item-quantity {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quantity-btn {
          width: 30px;
          height: 30px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          border-radius: 4px;
        }

        .quantity-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quantity {
          min-width: 20px;
          text-align: center;
        }

        .item-total {
          font-weight: bold;
          min-width: 80px;
          text-align: right;
        }

        .remove-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          font-size: 1.2rem;
        }

        .remove-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cart-coupon {
          margin: 1rem 0;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .coupon-input {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .coupon-field {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .apply-coupon-btn, .remove-coupon-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .apply-coupon-btn {
          background: #28a745;
          color: white;
        }

        .remove-coupon-btn {
          background: #dc3545;
          color: white;
          width: 100%;
        }

        .apply-coupon-btn:disabled, .remove-coupon-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cart-summary {
          margin: 1rem 0;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .summary-line {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .summary-line.total {
          font-weight: bold;
          font-size: 1.1rem;
          border-top: 1px solid #ddd;
          padding-top: 0.5rem;
          margin-top: 0.5rem;
        }

        .cart-actions {
          display: flex;
          gap: 0.5rem;
        }

        .clear-cart-btn {
          flex: 1;
          padding: 1rem;
          border: 1px solid #dc3545;
          background: white;
          color: #dc3545;
          border-radius: 4px;
          cursor: pointer;
        }

        .checkout-btn {
          flex: 2;
          padding: 1rem;
          border: none;
          background: #28a745;
          color: white;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }

        .clear-cart-btn:disabled, .checkout-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .cart-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .cart-debug {
          padding: 1rem;
          border-top: 1px solid #eee;
          background: #f8f9fa;
          font-size: 0.8rem;
        }

        .cart-debug pre {
          max-height: 200px;
          overflow-y: auto;
          background: white;
          padding: 0.5rem;
          border-radius: 4px;
          margin: 0.5rem 0 0 0;
        }

        @media (max-width: 480px) {
          .cart-component {
            width: 100vw;
            right: -100vw;
          }

          .cart-open {
            right: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default CartComponent;
