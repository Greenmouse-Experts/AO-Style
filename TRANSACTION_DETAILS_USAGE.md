# Transaction Details System Usage Guide

This guide explains how to use the new transaction details system that replaces the old `/withdraw/details/id` endpoint with the new `/payment/my-payments/payment_id` endpoint.

## Overview

The new system provides:
- **Professional Modal Interface**: Clean, modern design with smooth animations
- **Comprehensive Payment Data**: Shows user details, verification status, and payment information
- **Reusable Components**: Can be used throughout the application
- **Multiple Display Modes**: Modal overlay or full-page view
- **Copy Functionality**: Copy user details with visual feedback

## Components Available

### 1. TransactionDetailsModal
The core modal component that displays payment details.

```jsx
import { TransactionDetailsModal } from "../components/modals";

const MyComponent = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [transactionId, setTransactionId] = useState(null);

  return (
    <>
      <button onClick={() => {
        setTransactionId("some-payment-id");
        setModalOpen(true);
      }}>
        View Payment Details
      </button>
      
      <TransactionDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        transactionId={transactionId}
      />
    </>
  );
};
```

### 2. UniversalTransactionDetails
A wrapper component that can work in both modal and page modes.

```jsx
import { UniversalTransactionDetails } from "../components/modals";

// For Modal Mode
const ModalExample = () => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <UniversalTransactionDetails
      mode="modal"
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      transactionId="payment-id-here"
    />
  );
};

// For Page Mode (automatically gets ID from route params)
const PageExample = () => {
  return <UniversalTransactionDetails mode="page" />;
};
```

## Route Integration

The system is already integrated into these routes:

### Sales Dashboard Routes
```
/sales/transactions/:id
```

### Fabric Dashboard Routes
```
/fabric/transactions/:id
```

### Tailor Dashboard Routes
```
/tailor/transactions/:id
```

## API Integration

### New Endpoint Used
```
GET /payment/my-payments/{payment_id}
```

### Response Structure
```json
{
  "statusCode": 200,
  "message": "Payment fetched successfully.",
  "data": {
    "user": {
      "id": "user-id",
      "name": "User Name",
      "email": "user@example.com",
      "phone": "+1234567890",
      "is_email_verified": true,
      "is_phone_verified": false,
      "is_suspended": false,
      "referral_source": "google",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    },
    "subscription_plan": null,
    "billing_info": null,
    "refunds": [],
    "payment_gateway_logs": []
  }
}
```

## Features Displayed

### User Information
- **Name**: Full user name
- **Email**: Email address with verification status
- **Phone**: Phone number with verification status  
- **User ID**: Unique identifier with copy functionality
- **Account Status**: Active/Suspended status
- **Referral Source**: How user found the platform

### Account Timeline
- **Account Created**: When user account was created
- **Last Updated**: Most recent account update

### Payment Details (if available)
- **Subscription Plans**: Active subscription information
- **Billing Information**: Payment and billing details
- **Refunds**: Any refund information

### Interactive Features
- **Copy to Clipboard**: All user data fields have copy buttons
- **Visual Feedback**: Check icons appear when data is copied
- **Status Badges**: Color-coded verification and account status

## Existing Integration Points

### Recent Transactions Component
Already integrated in `/src/modules/Pages/salesDashboard/components/RecentTransactions.jsx`:

```jsx
// Click any transaction row to view details
<div 
  className="transaction-row cursor-pointer"
  onClick={() => handleTransactionClick(transaction.id)}
>
  {/* Transaction content */}
</div>
```

### Wallet Page Component
Already integrated in `/src/modules/Pages/salesDashboard/components/WalletPage.jsx`:

```jsx
// Click recent transaction to view details
<div 
  className="recent-transaction cursor-pointer"
  onClick={() => handleTransactionClick(recentTransaction.id)}
>
  {/* Recent transaction content */}
</div>
```

## Migration from Old System

### Before (Old System)
```jsx
// Old way using /withdraw/details/{id}
const { data } = useQuery({
  queryKey: ["transaction", id],
  queryFn: async () => {
    const resp = await CaryBinApi.get("/withdraw/details/" + id);
    return resp.data;
  },
});
```

### After (New System)
```jsx
// New way using payment details hook
import useGetPaymentDetails from "../../hooks/marketRep/useGetPaymentDetails";

const { paymentDetails, isLoading, isError } = useGetPaymentDetails(id, enabled);
```

## Custom Hook Usage

For advanced usage, you can directly use the payment details hook:

```jsx
import useGetPaymentDetails from "../hooks/marketRep/useGetPaymentDetails";

const MyComponent = ({ transactionId }) => {
  const { 
    paymentDetails, 
    isLoading, 
    isError, 
    refetch 
  } = useGetPaymentDetails(transactionId, true);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading details</div>;

  const user = paymentDetails?.data?.user;
  
  return (
    <div>
      <h3>{user?.name}</h3>
      <p>{user?.email}</p>
      {/* Custom display logic */}
    </div>
  );
};
```

## Error Handling

The system includes comprehensive error handling:

```jsx
// Loading state
{isLoading && (
  <div className="text-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
    <p className="text-gray-500 mt-2">Loading payment details...</p>
  </div>
)}

// Error state
{isError && (
  <div className="text-center py-8">
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-600 mb-2">Failed to load payment details</p>
      <button onClick={() => refetch()} className="text-blue-600 hover:underline text-sm">
        Try Again
      </button>
    </div>
  </div>
)}
```

## Styling and Themes

The modal uses Tailwind CSS classes and follows the application's design system:

- **Purple Theme**: Primary colors match the app theme
- **Responsive Design**: Works on all screen sizes
- **Smooth Animations**: Entrance/exit animations using Headless UI
- **Status Colors**: Green for verified/active, red for unverified/suspended

## Best Practices

1. **Always provide a loading state** while fetching payment details
2. **Handle errors gracefully** with retry functionality
3. **Use appropriate transaction IDs** - ensure you're passing payment IDs, not other types
4. **Consider user experience** - use modals for quick views, pages for detailed analysis
5. **Test copy functionality** - ensure clipboard permissions work in your target browsers

## Troubleshooting

### Common Issues

1. **Modal not opening**: Check if `isOpen` prop is being set to `true`
2. **No data displayed**: Verify the transaction ID is correct and exists
3. **Copy not working**: Check if the application has clipboard permissions
4. **API errors**: Ensure the user has permission to view the payment details

### Debug Tips

```jsx
// Add logging to debug issues
const { paymentDetails, isLoading, isError } = useGetPaymentDetails(transactionId, enabled);

console.log("Transaction ID:", transactionId);
console.log("Payment Details:", paymentDetails);
console.log("Loading:", isLoading);
console.log("Error:", isError);
```

## Future Enhancements

Planned improvements:
- Export functionality for payment details
- Bulk payment detail views
- Payment timeline visualization
- Advanced filtering and search
- Integration with notification system