# Logistics Order Details Testing Guide

## Overview
This document provides a comprehensive testing guide for the enhanced logistics order details page with two-leg delivery system and improved UI.

## Test Environment Setup

### Prerequisites
- Access to logistics dashboard with valid logistics agent credentials
- Test orders in various status states
- Browser developer tools enabled for debugging
- Network tab monitoring for API calls

### Test Data Requirements
- Orders with status: `DISPATCHED_TO_AGENT` (first leg)
- Orders with status: `OUT_FOR_DELIVERY`, `SHIPPED` (second leg)
- Orders with status: `IN_TRANSIT`, `DELIVERED`
- Assigned and unassigned orders

## Key Fixes Implemented

### 1. Data Structure Mapping
**Issue**: Component was using incorrect data paths for order information
**Fix**: Updated to use actual API response structure:
- Delivery address: `order_data?.user?.profile?.address`
- Payment status: `order_data?.payment?.status`
- Assignment: `order_data?.logistics_agent_id` or `order_data?.first_leg_logistics_agent_id`

### 2. Accept Order API
**Issue**: Wrong HTTP method and error handling
**Fix**: 
- Changed from `PUT` to `PATCH` for accept order endpoints
- Added comprehensive error logging and handling
- Proper route determination for first leg vs second leg

### 3. Status Update Payload
**Issue**: Incorrect payload structure for delivery codes
**Fix**: Conditional payload based on status type:
```typescript
if (status === "DELIVERED_TO_TAILOR") {
  payload.tailor_delivery_code = code;
} else if (status === "DELIVERED") {
  payload.user_delivery_code = code;
}
```

## Test Cases

### 1. Order Data Loading
#### Test Steps:
1. Navigate to `/logistics/orders/{order_id}`
2. Check browser console for debug logs
3. Verify order data structure

#### Expected Results:
- ✅ Console shows: "🔍 Order data response: {order_data}"
- ✅ Order details display correctly
- ✅ Customer information shows proper address
- ✅ Order items render with product images

#### Debug Commands:
```javascript
// Check order data structure
console.log("Order data:", window.__ORDER_DATA__);

// Verify API response
fetch('/api/orders/{order_id}')
  .then(r => r.json())
  .then(data => console.log('API Response:', data));
```

### 2. Order Assignment (Accept Order)
#### Test Steps:
1. Navigate to unassigned order
2. Check assignment status section
3. Click "Accept Order" button
4. Monitor network tab for API call

#### Expected Results:
- ✅ "Accept Order" button visible for unassigned orders
- ✅ API call: `PATCH /orders/{id}/accept-order` or `PATCH /orders/{id}/accept-order-first-leg`
- ✅ Success toast: "Order accepted successfully!"
- ✅ Page refreshes showing assigned status

#### Debug Logs to Check:
```
🚛 Accepting order: {orderId, currentStatus, route, isFirstLeg}
✅ Accept order response: {response_data}
```

### 3. First Leg Delivery (DISPATCHED_TO_AGENT → DELIVERED_TO_TAILOR)
#### Test Steps:
1. Navigate to order with status `DISPATCHED_TO_AGENT`
2. Verify assignment to current agent
3. Click "Deliver to Tailor" button
4. Enter tailor delivery code in modal
5. Submit delivery confirmation

#### Expected Results:
- ✅ First leg indicator shows as active (blue theme)
- ✅ "Deliver to Tailor" button enabled
- ✅ Modal prompts for tailor delivery code
- ✅ API call: `PUT /orders/{id}/status` with `tailor_delivery_code`
- ✅ Status updates to `DELIVERED_TO_TAILOR`

### 4. Second Leg Delivery (OUT_FOR_DELIVERY → IN_TRANSIT → DELIVERED)
#### Test Steps:
1. Navigate to order with status `OUT_FOR_DELIVERY` or `SHIPPED`
2. Click "Start Delivery" button
3. Verify status changes to `IN_TRANSIT`
4. Click "Complete Delivery" button
5. Enter customer delivery code
6. Submit completion

#### Expected Results:
- ✅ Second leg indicator shows as active (orange/purple theme)
- ✅ "Start Delivery" works without code requirement
- ✅ "Complete Delivery" requires customer code
- ✅ Final status: `DELIVERED`

### 5. Assignment Validation
#### Test Steps:
1. Login as Logistics Agent A
2. Navigate to order assigned to Logistics Agent B
3. Verify read-only access

#### Expected Results:
- ✅ No action buttons available
- ✅ Shows "Assigned to: {agent_name}"
- ✅ Status information visible but not editable

### 6. Visual UI Improvements
#### Test Steps:
1. Navigate to any order details page
2. Check visual elements and responsiveness
3. Test on mobile device

#### Expected Results:
- ✅ Modern gradient backgrounds (purple-to-pink)
- ✅ Card-based layout with proper spacing
- ✅ Visual progress indicators for delivery legs
- ✅ Responsive design on mobile devices
- ✅ Smooth hover effects and transitions

## API Endpoints Verification

### Accept Order Endpoints
```
PATCH /orders/{id}/accept-order-first-leg  (for DISPATCHED_TO_AGENT)
PATCH /orders/{id}/accept-order           (for other statuses)
```

### Status Update Endpoint
```
PUT /orders/{id}/status
Content-Type: application/json

// For first leg completion
{
  "status": "DELIVERED_TO_TAILOR",
  "tailor_delivery_code": "CODE123"
}

// For starting second leg
{
  "status": "IN_TRANSIT"
}

// For completing delivery
{
  "status": "DELIVERED",
  "user_delivery_code": "CODE456"
}
```

## Common Issues and Solutions

### Issue: Accept Order Button Not Working
**Symptoms**: Button click doesn't trigger API call
**Debug Steps**:
1. Check console for error logs
2. Verify authentication token
3. Check network tab for failed requests
**Solution**: Ensure proper authentication and valid order status

### Issue: Wrong Delivery Address Displayed
**Symptoms**: Address shows as undefined or incorrect
**Debug Steps**:
1. Check console for order data structure
2. Verify `order_data?.user?.profile?.address` path
**Solution**: Confirm API response structure matches expected format

### Issue: Status Update Fails
**Symptoms**: Toast shows error message
**Debug Steps**:
1. Check console for API response details
2. Verify delivery code format
3. Confirm agent assignment
**Solution**: Ensure proper payload structure and valid codes

## Performance Testing

### Page Load Performance
- **Target**: < 2 seconds for order details page
- **Measurement**: Use Network tab to monitor load times
- **Optimization**: Check for unnecessary API calls or large images

### Mobile Performance
- **Target**: Smooth operation on 3G networks
- **Testing**: Use Chrome DevTools device simulation
- **Verification**: All buttons and modals work on mobile

## Success Criteria Checklist

### Functionality
- [ ] Order data loads correctly with proper structure
- [ ] Accept order works for both first and second leg
- [ ] Status updates work with appropriate delivery codes
- [ ] Assignment validation prevents unauthorized updates
- [ ] Error handling provides clear feedback

### User Experience
- [ ] Modern UI with gradient backgrounds and card layouts
- [ ] Visual progress indicators for delivery legs
- [ ] Responsive design works on all devices
- [ ] Loading states and toast notifications work properly
- [ ] Navigation and back buttons function correctly

### Technical
- [ ] Console logs provide helpful debugging information
- [ ] API calls use correct HTTP methods and payloads
- [ ] TypeScript interfaces match actual data structure
- [ ] Error boundaries handle unexpected failures gracefully

## Debugging Commands

### Browser Console Commands
```javascript
// Check current order data
console.log("Current order:", window.__LOGISTICS_ORDER__);

// Monitor API calls
window.__API_MONITOR__ = true;

// Test assignment logic
console.log("Is assigned:", isAssigned);
console.log("User ID:", userProfile?.id);
console.log("Agent IDs:", {
  logistics_agent_id: order_data?.logistics_agent_id,
  first_leg_logistics_agent_id: order_data?.first_leg_logistics_agent_id
});
```

### Network Monitoring
Monitor these specific API patterns:
- `GET /orders/{id}` - Order data fetching
- `PATCH /orders/{id}/accept-order*` - Order acceptance
- `PUT /orders/{id}/status` - Status updates

## Test Environment URLs
- **Development**: `http://localhost:3000/logistics/orders/{order_id}`
- **Staging**: `https://staging.aostyle.com/logistics/orders/{order_id}`
- **Production**: `https://app.aostyle.com/logistics/orders/{order_id}`

---

**Last Updated**: January 2025
**Test Status**: Ready for QA validation
**Version**: 2.0.0