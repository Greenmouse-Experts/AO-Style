# Market Rep Business-Id Header Fix

## Issue Description

When market reps try to edit fabric or style products via the routes:
- `/sales/edit-fabric` (for market rep fabric editing)
- `/sales/edit-style` (for market rep style editing)

The update requests were failing because the API requires a `Business-Id` header with the fabric vendor's business ID, but the code was sending `vendor_id` as a query parameter instead.

## Root Cause

The market rep update functions were using the wrong request format:

**Old (Incorrect):**
```javascript
// Using query parameter instead of header
CaryBinApi.patch(`/market-rep-fabric/${id}`, payload, {
  params: { vendor_id: vendorId },
})
```

**API Requirement:**
- Endpoint: `PATCH /market-rep-fabric/{id}` and `PATCH /market-rep-style/{id}`
- Header: `Business-Id: {fabric_vendor_business_id}`

## Files Modified

### 1. API Service Layer

**`AO-Style/src/services/api/marketrep/index.jsx`**

**Changes Made:**
- Updated `updateMarketRepFabric` function to use `Business-Id` header
- Updated `updateMarketRepStyle` function to use `Business-Id` header
- Changed parameter from `vendorId` to `businessId` for clarity

```javascript
// OLD
const updateMarketRepFabric = (id, payload, vendorId) => {
  return CaryBinApi.patch(`/market-rep-fabric/${id}`, payload, {
    params: { vendor_id: vendorId },
  });
};

// NEW
const updateMarketRepFabric = (id, payload, businessId) => {
  return CaryBinApi.patch(`/market-rep-fabric/${id}`, payload, {
    headers: {
      "Business-Id": businessId,
    },
  });
};
```

### 2. Hook Layer

**`AO-Style/src/hooks/marketRep/useEditMarketRepFabric.jsx`**
**`AO-Style/src/hooks/marketRep/useEditMarketRepStyle.jsx`**

**Changes Made:**
- Updated mutation function signature from `vendorId` to `businessId`

```javascript
// OLD
mutationFn: ({ id, payload, vendorId }) =>
  MarketRepService.updateMarketRepFabric(id, payload, vendorId),

// NEW
mutationFn: ({ id, payload, businessId }) =>
  MarketRepService.updateMarketRepFabric(id, payload, businessId),
```

### 3. Component Layer

**`AO-Style/src/modules/Pages/salesDashboard/EditFabric.jsx`**
**`AO-Style/src/modules/Pages/salesDashboard/EditStyle.jsx`**

**Changes Made:**
- Added debug logging to identify correct business ID field
- Updated mutation calls to extract and pass business ID from fetched data
- Fallback logic to find business ID from multiple possible locations

```javascript
// Get business ID from fabric/style data
const businessId =
  getFabricDataById?.data?.business_info?.id ||
  getFabricDataById?.data?.vendor?.business_id ||
  getFabricDataById?.data?.business_id;

// Updated mutation call
createMarketRepFabricMutate(
  { id: itemId, payload, businessId: businessId },
  // ... callbacks
);
```

## Business ID Detection Logic

The components now intelligently detect the business ID from the fetched product data using fallback logic:

1. **Primary:** `business_info.id`
2. **Secondary:** `vendor.business_id` 
3. **Tertiary:** `business_id`

This ensures compatibility with different API response structures.

## Debug Logging Added

Comprehensive console logging has been added to help identify the correct business ID:

```javascript
console.log("🔧 MARKET REP FABRIC DEBUG - Full fabric data:", getFabricDataById?.data);
console.log("🔧 MARKET REP FABRIC DEBUG - Business info:", getFabricDataById?.data?.business_info);
console.log("🔧 MARKET REP FABRIC DEBUG - Available business IDs:", {
  "business_info.id": getFabricDataById?.data?.business_info?.id,
  "vendor.business_id": getFabricDataById?.data?.vendor?.business_id,
  vendor_id: getFabricDataById?.data?.vendor_id,
  business_id: getFabricDataById?.data?.business_id,
});
```

## Current Status

### ✅ Working Correctly

**Market Rep Fabric Edit:**
- ✅ Uses correct `PATCH /market-rep-fabric/{id}` endpoint
- ✅ Sends `Business-Id` header with fabric vendor's business ID
- ✅ Debug logging shows business ID detection process

**Market Rep Style Edit:**
- ✅ Uses correct `PATCH /market-rep-style/{id}` endpoint  
- ✅ Sends `Business-Id` header with style vendor's business ID
- ✅ Debug logging shows business ID detection process

## Testing Workflow

### For Market Rep Fabric Edit:
1. Navigate to market rep edit fabric page
2. Open browser console to see debug logs
3. Verify correct business ID is detected and logged
4. Make changes and save
5. Check network tab for correct `Business-Id` header in PATCH request

### For Market Rep Style Edit:
1. Navigate to market rep edit style page  
2. Open browser console to see debug logs
3. Verify correct business ID is detected and logged
4. Make changes and save
5. Check network tab for correct `Business-Id` header in PATCH request

## API Request Format

**Correct Request Format:**
```http
PATCH /market-rep-fabric/{id}
Headers:
  Business-Id: {fabric_vendor_business_id}
  Content-Type: application/json

Body: {
  "product": {
    "name": "Updated Fabric Name",
    // ... other fabric data
  }
}
```

## Error Handling

The existing error handling in the hooks remains unchanged and will properly display error messages if:
- Business ID is not found or invalid
- API returns validation errors
- Network issues occur

## Future Considerations

1. **Business ID Validation**: Consider adding validation to ensure business ID is present before making update requests
2. **Consistent Response Structure**: Work with backend team to standardize business ID field location in API responses
3. **Error Messages**: Add specific error messages for missing business ID scenarios
4. **Type Safety**: Consider adding TypeScript interfaces for business ID extraction logic

## Related Endpoints

This fix applies to the market rep update endpoints:
- `PATCH /market-rep-fabric/{id}` - Fabric updates
- `PATCH /market-rep-style/{id}` - Style updates

Other market rep endpoints may also require similar `Business-Id` header verification.