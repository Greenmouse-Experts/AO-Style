# My Products Debugging Guide

## Overview
This guide helps debug issues with the "My Products" functionality in the admin fabric and style management pages.

## Current Endpoint Configuration

### "All Products" Tab
- **Fabric Products**: `GET /product-general/fetch?type=FABRIC`
- **Style Products**: `GET /product-general/fetch?type=STYLE`
- **Hook**: `useGetAdminFabricProduct`
- **Expected**: Shows all products in the system

### "My Products" Tab
- **My Fabrics**: `GET /manage-fabric/{business_id}`
- **My Styles**: `GET /manage-style/{business_id}`
- **Hooks**: `useGetAdminManageFabricProduct` / `useGetAdminManageStyleProduct`
- **Expected**: Shows only admin-created products

## Common Issues & Solutions

### 1. Empty "My Products" Data

#### Symptoms
- "All Products" shows data correctly
- "My Products" tab shows no data or loading state
- Console shows successful API calls but empty results

#### Debugging Steps

1. **Check Business ID**
   ```javascript
   // Look for this debug log in console:
   🌐 ENDPOINT USAGE DEBUG: {
     businessId: "your-business-id",
     hasBusinessDetails: true,
     hasBusinessId: true,
     currentEndpoint: "/manage-fabric/your-business-id"
   }
   ```

2. **Verify API Response**
   ```javascript
   // Look for these logs:
   🔧 MANAGE FABRIC PRODUCT API RESPONSE: { data: [], count: 0 }
   🔧 Manage Fabric Product Count: 0
   🔧 Endpoint Called: /manage-fabric/your-business-id
   ```

3. **Check Network Tab**
   - Open browser DevTools → Network tab
   - Switch to "My Products" tab
   - Look for API call to `/manage-fabric/{id}` or `/manage-style/{id}`
   - Check response status and data

#### Possible Causes & Solutions

**Cause 1: No Products Created by Admin**
- **Check**: Database for products with `creator_id` matching admin's `user_id`
- **Solution**: Create test products as admin to verify functionality

**Cause 2: Wrong Business ID**
- **Check**: `businessDetails?.data?.id` value in console logs
- **Solution**: Verify admin has correct business association

**Cause 3: API Endpoint Issues**
- **Check**: Server logs for `/manage-fabric/{id}` endpoint
- **Solution**: Verify endpoint exists and returns correct data structure

**Cause 4: Authentication Issues**
- **Check**: API returns 401/403 errors
- **Solution**: Verify admin token is valid and has proper permissions

### 2. API Endpoint Verification

#### Test Endpoints Manually

1. **Test "All Products" Endpoint**
   ```bash
   curl -X GET "your-api-url/product-general/fetch?type=FABRIC" \
   -H "Authorization: Bearer your-admin-token" \
   -H "Business-id: your-business-id"
   ```

2. **Test "My Products" Endpoint**
   ```bash
   curl -X GET "your-api-url/manage-fabric/your-business-id" \
   -H "Authorization: Bearer your-admin-token" \
   -H "Business-id: your-business-id"
   ```

#### Expected Response Structure
```json
{
  "data": [
    {
      "id": 1,
      "name": "Product Name",
      "sku": "SKU123",
      "creator_id": "admin-user-id",
      "business_id": "business-id",
      "type": "FABRIC",
      "status": "PUBLISHED"
    }
  ],
  "count": 1,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

### 3. Console Log Analysis

#### Success Indicators
```javascript
// Data source selection
🔄 DATA SOURCE DEBUG: {
  currProd: "my",
  usingDataSource: "myProductsData",
  myProductsCount: 5  // Should be > 0
}

// API response
🔧 MANAGE FABRIC PRODUCT API RESPONSE: { data: [...], count: 5 }
🔧 Manage Fabric Product Count: 5

// Final data processing
🎯 FINAL FABRIC DATA FOR TABLE: [...]
📊 FABRIC DATA COUNT: 5
```

#### Error Indicators
```javascript
// Empty data
🔧 Manage Fabric Product Count: 0
📊 FABRIC DATA COUNT: 0

// API errors
❌ MANAGE FABRIC PRODUCT API ERROR: Error object
❌ Error Status: 404
❌ Error Message: "Endpoint not found"
❌ Failed Endpoint: /manage-fabric/business-id
```

### 4. Data Flow Verification

#### Step-by-Step Debugging

1. **Component Mount**
   - Verify `businessDetails` is loaded
   - Check `isAdminRoute` detection
   - Confirm `productType` selection

2. **API Call Initiation**
   - Verify correct hook is called based on current tab
   - Check parameters passed to hook
   - Confirm endpoint construction

3. **API Response Processing**
   - Check raw API response structure
   - Verify data transformation in useMemo
   - Confirm count calculation

4. **UI Rendering**
   - Check loading states
   - Verify data reaches table component
   - Confirm empty state messages

## Debugging Checklist

### Pre-Check Requirements
- [ ] Admin user is properly authenticated
- [ ] Business details are loaded (`businessDetails?.data?.id` exists)
- [ ] Correct route detected (`/admin/fabrics-products` or `/admin/styles-products`)
- [ ] Internet connection is stable

### API Verification
- [ ] "All Products" endpoint returns data
- [ ] "My Products" endpoint exists on server
- [ ] Correct HTTP method (GET) is used
- [ ] Authentication headers are included
- [ ] Business-id header is set correctly

### Data Verification
- [ ] Admin has created products in the system
- [ ] Products have correct `creator_id` field
- [ ] Products have correct `type` field (FABRIC/STYLE)
- [ ] Database records exist and are accessible

### UI Verification
- [ ] Correct tab is selected
- [ ] Loading states work properly
- [ ] Empty states show appropriate messages
- [ ] Count displays correct numbers

## Common Error Messages

### API Errors
- **404 Not Found**: Endpoint doesn't exist on server
- **401 Unauthorized**: Invalid or expired token
- **403 Forbidden**: User doesn't have permission
- **500 Internal Server Error**: Server-side issue

### Application Errors
- **"No data"**: Empty response from API
- **Loading forever**: API call not completing
- **Wrong count**: Pagination or filtering issue

## Testing Scenarios

### Happy Path Testing
1. Create admin-owned fabric products
2. Navigate to `/admin/fabrics-products`
3. Verify "All Products" shows all products
4. Switch to "My Products" tab
5. Verify only admin-created products appear
6. Check counts match actual data

### Edge Case Testing
1. Test with no admin-created products
2. Test with mixed creator ownership
3. Test with different product types
4. Test pagination with large datasets
5. Test network connectivity issues

## Resolution Steps

### If "My Products" is Empty

1. **Verify Data Exists**
   ```sql
   SELECT * FROM products 
   WHERE creator_id = 'admin-user-id' 
   AND type = 'FABRIC';
   ```

2. **Test API Directly**
   - Use Postman or curl to test endpoint
   - Verify response structure and data

3. **Check Frontend Logic**
   - Confirm correct endpoint is called
   - Verify data processing logic
   - Check for filtering issues

4. **Create Test Data**
   - Add test products as admin
   - Verify they appear in "My Products"

### If API Errors Occur

1. **Check Server Logs**
   - Look for endpoint registration
   - Verify authentication middleware
   - Check database connections

2. **Verify Environment**
   - Confirm API base URL
   - Check environment variables
   - Verify network connectivity

## Support Information

### Key Files to Check
- `/src/modules/Pages/fabricDashboard/MyProducts.jsx` - Main component
- `/src/hooks/fabric/useGetManageFabric.jsx` - My Fabrics hook
- `/src/hooks/style/useGetManageStyle.jsx` - My Styles hook
- `/src/services/api/fabric/index.jsx` - Fabric API service
- `/src/services/api/style/index.jsx` - Style API service

### Network Tab Investigation
Look for these requests:
- `GET /product-general/fetch` (All Products)
- `GET /manage-fabric/{id}` (My Fabrics)
- `GET /manage-style/{id}` (My Styles)

Check response status, headers, and payload structure.

### Database Investigation
Verify these tables and fields:
- Products table with `creator_id`, `type`, `business_id`
- User-business associations
- Product ownership relationships

This debugging guide should help identify and resolve issues with the "My Products" functionality.