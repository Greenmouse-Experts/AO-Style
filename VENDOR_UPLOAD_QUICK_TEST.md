# Quick Test Guide: Vendor-Based Product Upload

## Overview
This guide helps you quickly test the new vendor-based product upload functionality where Market Reps upload fabrics/styles on behalf of their managed fabric vendors.

## Pre-Test Setup

### 1. Ensure Fabric Vendors Exist
- Login as Market Rep
- Navigate to **Dashboard > Fabric Vendors**
- Verify you have at least 2-3 fabric vendors listed
- Note their names for testing

### 2. Check Console Logging
- Open browser Developer Tools (F12)
- Go to Console tab
- Look for logs prefixed with `🔧 HOOK:` for debugging

## Test Cases

### ✅ Test Case 1: Fabric Upload Flow
1. **Navigate**: Go to **Dashboard > My Products > Add Fabric**
2. **Verify Dropdown**: Check vendor selection dropdown appears at top
3. **Check Loading**: Should show "Loading fabric vendors..." while fetching
4. **Verify Options**: Dropdown should populate with your fabric vendors
5. **Test Validation**: Try submitting without selecting vendor - should show error
6. **Complete Form**: 
   - Select a vendor
   - Fill all required fields
   - Upload at least one image
7. **Submit**: Should create fabric successfully
8. **Verify**: Check API payload uses selected vendor's ID, not market rep's ID

**Expected Result**: ✅ Fabric created under selected vendor

### ✅ Test Case 2: Style Upload Flow
1. **Navigate**: Go to **Dashboard > My Products > Add Style**
2. **Verify Dropdown**: Check vendor selection dropdown appears at top
3. **Select Different Vendor**: Choose a different vendor than Test Case 1
4. **Complete Form**: Fill all required fields and upload images
5. **Submit**: Should create style successfully

**Expected Result**: ✅ Style created under selected vendor

### ✅ Test Case 3: My Products View
1. **Navigate**: Go to **Dashboard > My Products**
2. **Check Vendor Column**: Table should show "Vendor" column
3. **Verify Attribution**: Products should show correct vendor names
4. **Check Multiple Vendors**: Should see products from different vendors
5. **Verify Data**: Each product should display vendor name and business info

**Expected Result**: ✅ All vendor products visible with proper attribution

## Validation Checklist

### Form Validation ✅
- [ ] Vendor selection is required
- [ ] Clear error message if no vendor selected  
- [ ] Form submits successfully with vendor selected
- [ ] Loading states work properly

### Data Flow ✅
- [ ] Correct vendor ID sent in API payload
- [ ] Products created under selected vendor, not market rep
- [ ] My Products shows all vendor products
- [ ] Vendor information displays correctly

### Error Handling ✅
- [ ] Network errors handled gracefully
- [ ] Loading states during vendor fetch
- [ ] Empty vendor list handled
- [ ] Form validation works

## Quick Debugging

### If Vendor Dropdown is Empty:
1. Check console for `🔧 HOOK:` logs
2. Verify `/auth/vendors?role=fabric-vendor` API response
3. Check if market rep has any fabric vendors

### If Form Doesn't Submit:
1. Check validation errors
2. Ensure vendor is selected
3. Verify all required fields are filled

### If Products Don't Show Vendor Info:
1. Check My Products API response
2. Verify vendor_info is attached to products
3. Look for console errors

## Expected Console Logs

```
🔧 HOOK: useGetAllMarketRepVendor called
🔧 HOOK: QueryFn executing for market rep fabric vendors  
🔧 HOOK: Processed fabric vendors: [array of vendors]
🔧 HOOK: useGetMarketRepAllVendorProducts called
🔧 HOOK: All vendor products results: [products with vendor info]
```

## Success Indicators

✅ **Vendor dropdown populates with fabric vendors**
✅ **Form validation requires vendor selection**
✅ **Products created with correct vendor_id**
✅ **My Products shows vendor attribution**
✅ **Multiple vendor products visible**

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Empty vendor dropdown | Ensure market rep has fabric vendors assigned |
| Form won't submit | Check all required fields including vendor selection |
| Vendor column shows "Unknown" | Check API response includes vendor info |
| Loading never completes | Check network requests for API errors |

## Test Data Examples

### Sample Vendor Selection:
- Kacey Vendor 2 (kaceytechie+vendor2@gmail.com)
- Kacey Vendor 3 (kaceytechie+vendor3@gmail.com)

### Test Scenarios:
1. Create fabric for Vendor 2
2. Create style for Vendor 3  
3. Verify both appear in My Products with correct vendor info

## Completion Checklist

- [ ] Can select fabric vendor from dropdown
- [ ] Validation prevents submission without vendor
- [ ] Fabric uploads successfully to selected vendor
- [ ] Style uploads successfully to selected vendor
- [ ] My Products shows all vendor products
- [ ] Vendor column displays correct information
- [ ] No console errors during normal flow

**Test Duration**: ~10-15 minutes
**Status**: Pass/Fail
**Notes**: [Add any observations or issues found]