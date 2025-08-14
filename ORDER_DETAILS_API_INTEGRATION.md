# Order Details API Integration Documentation

## Overview
This document describes the integration of the `/orders/details/:id` endpoint into the vendor (fabric) and tailor order details pages. The integration utilizes the existing `useGetSingleOrder` hook with enhanced data processing and UI improvements.

## API Endpoint Structure

### Endpoint
```
GET /orders/details/:id
```

### Response Structure
```json
{
  "statusCode": 200,
  "data": {
    "id": "18fd8b95-0ef1-4ec3-892a-fb2c92fecaf5",
    "user_id": "9894aa32-12f5-4383-aa8d-c0a63b560d92",
    "status": "SHIPPED",
    "total_amount": "10000",
    "payment_id": "a50be37d-e4fb-4754-8d18-9901f207cf72",
    "created_at": "2025-07-17T01:23:54.089Z",
    "updated_at": "2025-07-17T02:28:03.945Z",
    "deleted_at": null,
    "payment": {
      "id": "a50be37d-e4fb-4754-8d18-9901f207cf72",
      "user_id": "9894aa32-12f5-4383-aa8d-c0a63b560d92",
      "purchase_type": "PRODUCT",
      "purchase_id": null,
      "amount": "10000",
      "discount_applied": "0",
      "payment_status": "SUCCESS",
      "transaction_id": "5cmwdgp56x",
      "payment_method": "PAYSTACK",
      "created_at": "2025-07-16T22:55:45.174Z",
      "updated_at": "2025-07-17T01:23:53.987Z",
      "deleted_at": null,
      "billing_at_payment": null,
      "billing_id": null,
      "interval": null,
      "currency": "NGN",
      "auto_renew": false,
      "is_renewal": false,
      "is_upgrade": false,
      "metadata": null,
      "purchase": {
        "items": [
          {
            "id": "39697fa8-471c-4ff1-ab4b-0855d2602ccf",
            "name": "Test fabric",
            "price": 10000,
            "quantity": 1,
            "created_at": "2025-06-25T10:45:26.617Z",
            "product_id": "39697fa8-471c-4ff1-ab4b-0855d2602ccf",
            "purchase_type": "FABRIC"
          }
        ],
        "coupon_id": null,
        "coupon_type": null,
        "coupon_value": null
      },
      "transaction_type": null,
      "order_id": null
    },
    "user": {
      "id": "9894aa32-12f5-4383-aa8d-c0a63b560d92",
      "email": "greenmousedev+green-ct26@gmail.com",
      "phone": "+2348129032017"
    }
  }
}
```

## Implementation Files

### 1. Vendor/Fabric Order Details
**File**: `src/modules/Pages/fabricDashboard/OrdersDetails.jsx`

#### Key Features
- **Order Information**: Displays order ID, customer details, transaction ID, and order date
- **Payment & Status**: Shows order status, payment status, payment method, and total amount
- **Product Items**: Lists all ordered products with images, names, quantities, and prices
- **Vendor Actions**: Allows marking orders as delivered with status tracking
- **Customer Information**: Complete customer contact details
- **Review Integration**: Product review viewing functionality

#### Status Color Coding
```javascript
const statusColors = {
  'DELIVERED': 'bg-green-100 text-green-600',
  'SHIPPED': 'bg-blue-100 text-blue-600', 
  'CANCELLED': 'bg-red-100 text-red-600',
  'PENDING': 'bg-yellow-100 text-yellow-600'
}
```

### 2. Tailor Order Details
**File**: `src/modules/Pages/tailorDashboard/OrdersDetails.jsx`

#### Key Features
- **Order Information**: Complete order details with customer information
- **Payment & Status**: Payment and order status tracking
- **Product Items**: Product listing with measurement viewing links
- **Tailor Actions**: Mark tailoring as complete functionality
- **Customer Information**: Customer contact details
- **Delivery Information**: Order timing and delivery method
- **Order Summary**: Item count and payment summary

#### Tailoring-Specific Features
- **Measurement Links**: "View Measurements" links for each product
- **Tailoring Status**: Specific status for tailoring completion
- **Enhanced Product Display**: Focus on fabric and style items

## Data Processing

### Order Information Extraction
```javascript
const orderInfo = data?.data;
const orderPurchase = data?.data?.payment?.purchase?.items || [];
```

### Amount Formatting
```javascript
const formatAmount = (amount) => {
  return parseInt(amount || 0).toLocaleString();
};
```

### Date Formatting
```javascript
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
```

### Order ID Display
```javascript
const displayOrderId = (id) => {
  return `#${id?.slice(-8)?.toUpperCase() || "N/A"}`;
};
```

## UI Enhancements

### 1. Responsive Grid Layout
- **Desktop**: 3-column grid (2 columns for details, 1 for actions)
- **Mobile**: Stacked layout for optimal mobile viewing

### 2. Status Indicators
- **Color-coded badges** for order and payment status
- **Progress indicators** for order tracking
- **Last updated timestamps** for status changes

### 3. Product Display
- **Product images** with fallback placeholders
- **Type indicators** (FABRIC, STYLE, etc.)
- **Quantity and pricing** clearly displayed
- **Purple theme** for pricing consistency

### 4. Interactive Elements
- **Checkbox controls** for status updates
- **Review viewing** buttons for products
- **Measurement viewing** links for tailor orders
- **File upload** modals for delivery confirmation

## Error Handling

### Data Validation
```javascript
// Safe array access
const orderPurchase = data?.data?.payment?.purchase?.items || [];

// Fallback values
const customerEmail = orderInfo?.user?.email || "N/A";
const totalAmount = parseInt(orderInfo?.total_amount || 0);

// Empty state handling
{orderPurchase.length > 0 ? (
  renderProducts()
) : (
  <div className="text-center py-8 text-gray-500">
    <p>No products found in this order</p>
  </div>
)}
```

### Loading States
```javascript
if (getOrderIsPending) {
  return (
    <div className="m-auto flex h-[80vh] items-center justify-center">
      <Loader />
    </div>
  );
}
```

## Styling Standards

### Color Scheme
- **Primary**: Purple theme for pricing and actions
- **Status Colors**: Green (success), Blue (shipped), Yellow (pending), Red (cancelled)
- **Backgrounds**: White cards with gray backgrounds
- **Text**: Gray scale hierarchy for information

### Typography
- **Headers**: Bold, larger text for section titles
- **Labels**: Gray, smaller text for field labels
- **Values**: Medium weight, dark text for data
- **Status**: Colored, bold text for status indicators

### Spacing
- **Consistent padding**: 6 (1.5rem) for cards
- **Gap spacing**: 4 (1rem) between elements
- **Grid gaps**: 6 (1.5rem) between columns

## Testing Considerations

### Data Scenarios
1. **Complete Orders**: Full data with all fields populated
2. **Partial Orders**: Missing optional fields (phone, transaction_id)
3. **Empty Orders**: No products in purchase items
4. **Different Statuses**: All possible order status values
5. **Various Product Types**: FABRIC, STYLE, and other product types

### Browser Compatibility
- **Responsive design** tested on mobile and desktop
- **Date formatting** works across different locales
- **Number formatting** handles large amounts properly

## Performance Optimizations

### API Efficiency
- **Single endpoint** for all order data
- **Conditional rendering** based on data availability
- **Proper loading states** to prevent layout shifts

### Component Optimization
- **Memoized calculations** for formatted values
- **Conditional rendering** to avoid unnecessary DOM updates
- **Efficient state management** for modals and interactions

## Future Enhancements

### Potential Improvements
1. **Real-time updates** for order status changes
2. **Image upload** functionality for delivery confirmation
3. **Customer communication** integration
4. **Advanced filtering** and search capabilities
5. **Export functionality** for order details
6. **Print-friendly** order summaries

### API Extensions
1. **Measurement data** integration for tailor orders
2. **Delivery tracking** information
3. **Customer feedback** and ratings
4. **Vendor performance** metrics
5. **Order history** and related orders

## Files Modified
1. `src/modules/Pages/fabricDashboard/OrdersDetails.jsx` - Vendor order details
2. `src/modules/Pages/tailorDashboard/OrdersDetails.jsx` - Tailor order details
3. `src/hooks/order/useGetSingleOrder.jsx` - Already properly configured
4. `src/services/api/order/index.jsx` - API service (no changes needed)

## Summary
The order details API integration provides comprehensive order information display for both vendors and tailors, with proper error handling, responsive design, and user-friendly interfaces. The implementation leverages the existing API structure while enhancing the user experience with better data presentation and interactive elements.