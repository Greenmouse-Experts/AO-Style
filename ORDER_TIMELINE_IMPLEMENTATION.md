# Order Timeline Implementation

## Overview

The `OrderTimelineCard` component has been updated to provide different timeline views based on user type (admin vs logistics agent) and includes support for new order acceptance timestamps.

## Key Changes

### 1. New Props Added

```typescript
interface OrderTimelineProps {
  // ... existing props
  first_leg_order_received_at?: string | null;
  second_leg_order_received_at?: string | null;
  userType?: "admin" | "logistics" | null;
}
```

### 2. Timeline Flow Differences

#### For Logistics Agents (`userType: "logistics"`)
- **Starts with**: `first_leg_order_received_at` - "Order Received"
- **Excludes**: `created_at` and `dispatched_to_agent_at` 
- **Shows**: Only events relevant to the agent's workflow
- **Timeline Order**:
  1. Order Received (`first_leg_order_received_at`)
  2. Delivered to Tailor (`delivered_to_tailor_at`)
  3. In Transit from Tailor (`in_transit_at`)
  4. Order Accepted for Second Leg (`second_leg_order_received_at`)
  5. Out for Delivery (`out_for_delivery_at`)
  6. Delivered (`delivered_at`)

#### For Admins (`userType: "admin"`)
- **Shows**: Complete timeline including order creation and dispatch
- **Timeline Order**:
  1. Order Created (`created_at`)
  2. Dispatched to Agent (`dispatched_to_agent_at`)
  3. Order Accepted by Agent (`first_leg_order_received_at`)
  4. Delivered to Tailor (`delivered_to_tailor_at`)
  5. In Transit from Tailor (`in_transit_at`)
  6. Order Accepted for Second Leg (`second_leg_order_received_at`)
  7. Out for Delivery (`out_for_delivery_at`)
  8. Delivered (`delivered_at`)

### 3. Implementation Details

#### First Leg Events
- **Logistics**: Starts with "Order Received" event
- **Admin**: Shows complete flow from order creation through agent acceptance

#### Second Leg Events
- Both user types show `second_leg_order_received_at` as "Order Accepted for Second Leg"
- Positioned after "In Transit from Tailor" and before "Out for Delivery"

#### Single Timeline Fallback
- When no leg data is available, the component falls back to a single timeline
- Still respects the user type differences for event visibility

### 4. Usage Examples

#### In Logistics Dashboard
```jsx
<OrderTimelineCard
  dispatched_to_agent_at={order_data?.dispatched_to_agent_at}
  delivered_to_tailor_at={order_data?.delivered_to_tailor_at}
  delivered_at={order_data?.delivered_at}
  in_transit_at={order_data?.in_transit_at}
  out_for_delivery_at={order_data?.out_for_delivery_at}
  created_at={order_data?.created_at}
  status={order_data?.status}
  first_leg_order_received_at={order_data?.first_leg_order_received_at}
  second_leg_order_received_at={order_data?.second_leg_order_received_at}
  userType="logistics"
/>
```

#### In Admin Dashboard
```jsx
<OrderTimelineCard
  created_at={orderDetails?.created_at}
  dispatched_to_agent_at={orderDetails?.dispatched_to_agent_at}
  in_transit_at={orderDetails?.in_transit_at}
  out_for_delivery_at={orderDetails?.out_for_delivery_at}
  delivered_to_tailor_at={orderDetails?.delivered_to_tailor_at}
  delivered_at={orderDetails?.delivered_at}
  status={orderDetails?.status}
  first_leg_logistics_agent_id={orderDetails?.first_leg_logistics_agent_id}
  logistics_agent_id={orderDetails?.logistics_agent_id}
  first_leg_order_received_at={orderDetails?.first_leg_order_received_at}
  second_leg_order_received_at={orderDetails?.second_leg_order_received_at}
  userType="admin"
/>
```

### 5. New Event Types

#### Order Received Events
- **first_leg_order_received_at**: When the first leg logistics agent accepts the order
- **second_leg_order_received_at**: When the second leg logistics agent accepts the order

#### Visual Styling
- Order received events use green styling (`text-green-600 bg-green-100`)
- CheckCircle icon to indicate acceptance/confirmation
- Clear descriptions for each acceptance event

### 6. Backward Compatibility

- All existing props are maintained
- `userType` prop is optional and defaults to `null`
- When `userType` is `null`, the component behaves as before
- New timestamp props are optional

### 7. Files Updated

1. `/src/components/logistics/OrderTimelineCard.tsx` - Main component
2. `/src/modules/Pages/logisticsDashboard/view-order.tsx` - Logistics usage
3. `/src/modules/Pages/adminDashboard/order/OrderDetails.jsx` - Admin usage

### 8. Testing Scenarios

#### For Logistics Agents
- [ ] Timeline starts with "Order Received" when `first_leg_order_received_at` is present
- [ ] "Order Created" and "Dispatched to Agent" events are hidden
- [ ] Second leg acceptance shows properly
- [ ] All other events display correctly

#### For Admins
- [ ] Complete timeline shows from order creation
- [ ] First leg acceptance appears after dispatch
- [ ] Second leg acceptance appears in correct position
- [ ] All timestamps display with proper formatting

#### Edge Cases
- [ ] Missing timestamps are handled gracefully
- [ ] Component works without new props (backward compatibility)
- [ ] Single timeline fallback works for both user types