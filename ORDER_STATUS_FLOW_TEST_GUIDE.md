# Order Status Flow Test Guide

## Overview
This guide provides comprehensive testing procedures for the complete order status flow implementation in AO-Style platform. The system handles two distinct order types with different status progression paths.

## Order Types and Status Flows

### 1. Fabric + Style Orders (Two-leg delivery)
**Flow**: `PAID` → `DISPATCHED_TO_AGENT` → `DELIVERED_TO_TAILOR` → `PROCESSING` → `OUT_FOR_DELIVERY` → `IN_TRANSIT` → `DELIVERED`

### 2. Fabric Only Orders (Direct delivery)
**Flow**: `PAID` → `OUT_FOR_DELIVERY` → `IN_TRANSIT` → `DELIVERED`

## Actors and Responsibilities

### Fabric Vendor
- **Fabric + Style Orders**: Updates status to `DISPATCHED_TO_AGENT`
- **Fabric Only Orders**: Updates status to `OUT_FOR_DELIVERY`

### Logistics Agent (First Leg - Fabric+Style only)
- Picks up fabric from vendor
- Updates status to `DELIVERED_TO_TAILOR` with delivery code sent to tailor

### Tailor (Fabric+Style orders only)
- Receives fabric with delivery code
- Updates status to `PROCESSING` when starting work
- Updates status to `OUT_FOR_DELIVERY` when ready for pickup

### Logistics Agent (Second Leg - Both order types)
- **Fabric+Style**: Picks up completed item from tailor
- **Fabric Only**: Picks up fabric from vendor
- Updates status to `IN_TRANSIT`
- Updates status to `DELIVERED` with delivery code sent to customer

## Test Scenarios

### Scenario 1: Fabric + Style Order Complete Flow

#### Prerequisites
- Order contains at least one style item
- Order status is initially `PAID`
- All stakeholders (fabric vendor, logistics agents, tailor, customer) are available

#### Test Steps

**Step 1: Fabric Vendor Dashboard**
1. Login as fabric vendor
2. Navigate to Orders section
3. Locate the test order
4. Verify order shows "This order contains style items" message
5. Update status from `PAID` to `DISPATCHED_TO_AGENT`
6. Verify status update is successful
7. Confirm no further status updates are available to vendor

**Step 2: Logistics Dashboard (First Leg)**
1. Login as logistics agent
2. Navigate to assigned orders
3. Locate order with status `DISPATCHED_TO_AGENT`
4. Verify order shows "First Leg - Pickup" phase
5. Verify description shows "Pickup fabric from vendor → Deliver to tailor"
6. Click "Deliver to Tailor"
7. Enter tailor delivery code
8. Update status to `DELIVERED_TO_TAILOR`
9. Verify delivery code is sent to tailor

**Step 3: Tailor Dashboard**
1. Login as tailor
2. Navigate to Orders section
3. Locate order with status `DELIVERED_TO_TAILOR`
4. Verify tailor can update status to `PROCESSING`
5. Click "Mark as Processing"
6. Verify status updates to `PROCESSING`
7. Complete work simulation (optional: upload images)
8. Update status to `OUT_FOR_DELIVERY`
9. Verify no further status updates are available to tailor

**Step 4: Logistics Dashboard (Second Leg)**
1. Return to logistics dashboard
2. Locate order with status `OUT_FOR_DELIVERY`
3. Verify order shows "Second Leg - Pickup" phase
4. Verify description shows "Pickup completed item from tailor → Deliver to customer"
5. Click "Start Delivery"
6. Update status to `IN_TRANSIT`
7. Verify status update is successful

**Step 5: Final Delivery**
1. In logistics dashboard, locate order with status `IN_TRANSIT`
2. Verify order shows "In Transit" phase
3. Click "Complete Delivery"
4. Enter customer delivery code
5. Update status to `DELIVERED`
6. Verify delivery code is sent to customer
7. Verify order shows "Completed" phase with no further actions

#### Expected Results
- Order progresses through all statuses correctly
- Appropriate delivery codes are generated and sent
- Each stakeholder can only update statuses they're responsible for
- UI correctly shows order type (fabric + style)
- Phase descriptions are accurate for each step

### Scenario 2: Fabric Only Order Complete Flow

#### Prerequisites
- Order contains only fabric items (no style items)
- Order status is initially `PAID`
- Fabric vendor and logistics agent are available

#### Test Steps

**Step 1: Fabric Vendor Dashboard**
1. Login as fabric vendor
2. Navigate to Orders section
3. Locate the test order
4. Verify order shows "This order contains fabric only" message
5. Update status from `PAID` to `OUT_FOR_DELIVERY`
6. Verify status update is successful
7. Confirm no further status updates are available to vendor

**Step 2: Logistics Dashboard (Direct Delivery)**
1. Login as logistics agent
2. Navigate to assigned orders
3. Locate order with status `OUT_FOR_DELIVERY`
4. Verify order shows "Direct Delivery" phase
5. Verify description shows "Pickup fabric from vendor → Deliver to customer"
6. Click "Start Delivery"
7. Update status to `IN_TRANSIT`
8. Verify status update is successful

**Step 3: Final Delivery**
1. In logistics dashboard, locate order with status `IN_TRANSIT`
2. Verify order shows "In Transit" phase
3. Click "Complete Delivery"
4. Enter customer delivery code
5. Update status to `DELIVERED`
6. Verify delivery code is sent to customer
7. Verify order shows "Completed" phase with no further actions

#### Expected Results
- Order skips tailor-related statuses (`DELIVERED_TO_TAILOR`, `PROCESSING`)
- Direct flow from vendor to customer
- UI correctly identifies order as fabric-only
- Appropriate delivery codes are generated
- Logistics agent handles entire delivery process

### Scenario 3: Error Handling Tests

#### Test 3.1: Invalid Status Transitions
1. Attempt to update status out of sequence
2. Verify system prevents invalid transitions
3. Check error messages are user-friendly

#### Test 3.2: Missing Delivery Codes
1. Attempt to complete delivery without entering code
2. Verify system requires delivery code
3. Check validation messages

#### Test 3.3: Network Failures
1. Simulate network interruption during status update
2. Verify system handles failures gracefully
3. Check retry mechanisms work correctly

## UI Verification Points

### Order Summary Section
- Total Amount displays correctly
- Total Items count is accurate
- Order Status shows current status without overflow
- Payment Status is removed (not displayed)

### Status Flow Indicators
- Current phase is highlighted
- Completed phases show check marks
- Future phases are grayed out
- Phase descriptions are contextually accurate

### Action Buttons
- Only relevant actions are available to each user type
- Disabled states work correctly
- Loading states display during updates
- Success/error feedback is shown

## Data Verification

### Database Checks
1. Verify status updates are persisted correctly
2. Check delivery codes are stored properly
3. Confirm audit trail is maintained
4. Validate notification records exist

### API Response Validation
1. Status update endpoints return correct responses
2. Error handling provides meaningful messages
3. Success responses include updated order data
4. Delivery code generation works properly

## Performance Considerations

### Load Testing
1. Test with multiple simultaneous status updates
2. Verify system handles concurrent order processing
3. Check response times remain acceptable
4. Monitor database performance

### Mobile Responsiveness
1. Test status flow on mobile devices
2. Verify touch interactions work properly
3. Check responsive design elements
4. Validate mobile-specific UI components

## Common Issues and Troubleshooting

### Issue 1: Status Not Updating
**Symptoms**: Button click doesn't change status
**Checks**: 
- Network connectivity
- User permissions
- Order assignment
- API endpoint availability

### Issue 2: Wrong Flow Detection
**Symptoms**: Fabric-only order showing style flow
**Checks**:
- Product type classification
- Order item analysis
- hasStyleItems() function logic

### Issue 3: Delivery Code Not Sent
**Symptoms**: Code generation works but recipient doesn't receive
**Checks**:
- Notification service status
- Recipient contact information
- Message queue processing

## Test Data Setup

### Creating Test Orders

#### Fabric + Style Order
```json
{
  "order_items": [
    {
      "product": {
        "type": "fabric",
        "name": "Cotton Fabric"
      }
    },
    {
      "product": {
        "type": "style",
        "name": "Men's Shirt Style"
      }
    }
  ]
}
```

#### Fabric Only Order
```json
{
  "order_items": [
    {
      "product": {
        "type": "fabric",
        "name": "Silk Fabric"
      }
    }
  ]
}
```

## Acceptance Criteria Checklist

- [ ] Fabric vendors can only update to appropriate statuses based on order type
- [ ] Logistics agents can handle both single-leg and two-leg deliveries
- [ ] Tailors receive fabric and can process orders correctly
- [ ] Delivery codes are generated and sent at appropriate stages
- [ ] UI correctly identifies and displays order types
- [ ] Status transitions follow the defined flows exactly
- [ ] Error handling prevents invalid operations
- [ ] All stakeholders see only relevant actions
- [ ] Order summary displays correctly without payment status
- [ ] Mobile interface works properly for all user types

## Regression Testing

After implementing changes, verify:
1. Existing orders continue to work
2. Previous status updates remain valid
3. Historical data displays correctly
4. API backwards compatibility is maintained
5. No new TypeScript errors are introduced

## Sign-off Requirements

- [ ] Fabric Vendor workflow tested and approved
- [ ] Logistics Agent workflow tested and approved  
- [ ] Tailor workflow tested and approved
- [ ] Customer experience verified
- [ ] Technical implementation reviewed
- [ ] Performance benchmarks met
- [ ] Security considerations addressed
- [ ] Documentation updated