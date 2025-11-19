# OrderTimelineCard Component

A professional React component for displaying order timeline status in the logistics dashboard.

## Overview

The `OrderTimelineCard` component displays a chronological timeline of order status updates with timestamps, providing logistics agents with a clear visual representation of order progress.

## Features

- ✅ **Professional Timeline Design** - Clean, modern timeline interface
- ✅ **Timestamp Display** - Shows both date and time for each event
- ✅ **Status Indicators** - Visual indicators for completed, current, and pending states
- ✅ **Conditional Rendering** - Handles missing timestamps gracefully
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Purple Theme Integration** - Matches existing logistics dashboard styling

## Usage

```tsx
import OrderTimelineCard from '../../../components/logistics/OrderTimelineCard';

// Example usage in logistics order details page
<OrderTimelineCard
  dispatched_to_agent_at={order_data?.dispatched_to_agent_at}
  delivered_to_tailor_at={order_data?.delivered_to_tailor_at}
  delivered_at={order_data?.delivered_at}
  in_transit_at={order_data?.in_transit_at}
  out_for_delivery_at={order_data?.out_for_delivery_at}
  created_at={order_data?.created_at}
  status={order_data?.status}
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `dispatched_to_agent_at` | `string \| null` | No | Timestamp when order was dispatched to agent |
| `delivered_to_tailor_at` | `string \| null` | No | Timestamp when order was delivered to tailor |
| `delivered_at` | `string \| null` | No | Timestamp when order was delivered to customer |
| `in_transit_at` | `string \| null` | No | Timestamp when order went in transit |
| `out_for_delivery_at` | `string \| null` | No | Timestamp when order went out for delivery |
| `created_at` | `string \| null` | No | Timestamp when order was created |
| `status` | `string` | No | Current order status (e.g., "DISPATCHED_TO_AGENT", "DELIVERED") |

## Timeline Events

The component displays the following timeline events in chronological order:

1. **Order Created** - When the order was initially placed
2. **Dispatched to Agent** - When assigned to logistics agent
3. **In Transit** - When package is being transported
4. **Out for Delivery** - When package is out for final delivery
5. **Delivered to Tailor** - When delivered to tailor (if applicable)
6. **Delivered** - When delivered to final customer

## Status States

Each timeline event can have one of three states:

- **Completed** ✅ - Event has occurred (timestamp exists)
- **Current** 🟡 - Event is currently happening (matches order status)
- **Pending** ⭕ - Event has not yet occurred

## Styling

The component uses Tailwind CSS classes and follows the logistics dashboard design system:

- **Purple theme** for current status indicators
- **Green accents** for completed events
- **Gray styling** for pending events
- **Responsive spacing** for mobile and desktop

## Example Screenshots

### Completed Timeline
```
✅ Order Created          Nov 18, 2025  10:35 AM
✅ Dispatched to Agent    Nov 18, 2025  09:47 AM  
✅ In Transit            Nov 18, 2025  09:50 AM
🟡 Out for Delivery      Current Status
⭕ Delivered             Pending
```

### Timeline with Tailor Delivery
```
✅ Order Created          Nov 18, 2025  10:35 AM
✅ Dispatched to Agent    Nov 18, 2025  09:47 AM
✅ Delivered to Tailor    Nov 18, 2025  09:47 AM
✅ In Transit            Nov 18, 2025  09:50 AM
✅ Delivered             Nov 18, 2025  09:50 AM
```

## Error Handling

- **Invalid timestamps** are handled gracefully - component won't crash
- **Missing props** default to null/undefined and are filtered out
- **Empty timeline** - Component returns null if no events to display

## Dependencies

- `react` - React library
- `lucide-react` - Icons (Clock, Package, Truck, CheckCircle, User, Calendar)
- `tailwindcss` - Styling framework

## Integration Notes

This component is designed specifically for the AO-Style logistics dashboard and integrates with:

- Logistics order details page (`view-order.tsx`)
- Order data structure from the API
- Existing purple color theme
- Responsive layout system

## Future Enhancements

Potential improvements for future versions:

- [ ] Add animation transitions between status changes
- [ ] Include estimated time for next status
- [ ] Add tooltip with additional event details
- [ ] Support for custom event types
- [ ] Export timeline data functionality