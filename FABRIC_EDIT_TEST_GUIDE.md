# Fabric Edit Testing Guide - Admin Dashboard

## Overview
This guide will help you test the fabric edit functionality in the admin dashboard to ensure form fields are properly pre-filled with existing data.

## Prerequisites
- Access to admin dashboard
- At least one fabric product in the system
- Browser developer tools available
- Network connection for loading category/market data

## Test Scenarios

### Scenario 1: Basic Form Pre-population Test

**Steps:**
1. Navigate to Admin Dashboard
2. Go to "Fabrics" section from sidebar
3. Find any fabric product in the table
4. Click the three-dot menu (⋯) for that fabric
5. Click "View Product"
6. Open browser Developer Tools (F12)
7. Check the Console tab

**Expected Results:**
✅ **Form Fields Should Be Pre-filled:**
- Fabric Name field shows existing fabric name
- Market dropdown shows selected market
- Gender dropdown shows selected gender
- Category dropdown shows selected category
- Weight per yard field shows existing value
- Local Name, Manufacturer Name, etc. show existing values
- Available colors count shows correct number
- Color pickers show existing colors

✅ **Console Should Show Debug Logs:**
```
🔧 FABRIC EDIT DEBUG - productInfo: {id: "xxx", name: "Fabric Name", ...}
🔧 FABRIC EDIT DEBUG - isEditMode: true
🔧 EDIT MODE INITIALIZATION - Starting form population
🔧 EDIT MODE DEBUG - Populated values: {...}
🔧 EDIT MODE INITIALIZATION - Form population completed
```

### Scenario 2: Dropdown Selection Verification

**Steps:**
1. Follow Scenario 1 steps 1-6
2. Look specifically at Market and Category dropdowns
3. Check console for SELECT DEBUG messages

**Expected Results:**
✅ **Dropdowns Should Show Selections:**
- Market dropdown displays correct market name (not placeholder)
- Category dropdown displays correct category name (not placeholder)

✅ **Console Should Show Matching Logs:**
```
🔧 MARKET SELECT DEBUG - Comparing: "123" === "123" Result: true
🔧 CATEGORY SELECT DEBUG - Comparing: "456" === "456" Result: true
```

### Scenario 3: Color Functionality Test

**Steps:**
1. Follow Scenario 1 steps 1-6
2. Scroll to "How many colours available?" section
3. Check if color count and color pickers are populated

**Expected Results:**
✅ **Color Section Should Show:**
- Correct number in "available colors" field
- Color picker inputs showing actual fabric colors
- + and - buttons working to add/remove colors

✅ **Console Should Show:**
```
🔧 EDIT MODE DEBUG - Fabric colors: ["#FF0000", "#00FF00", ...]
🔧 FORM VALUES DEBUG - fabric_colors: ["#FF0000", "#00FF00", ...]
🔧 FORM VALUES DEBUG - available_colors: "3"
```

### Scenario 4: Data Loading Sequence Test

**Steps:**
1. Navigate to fabric edit page
2. Monitor console from page load
3. Watch for data loading sequence

**Expected Results:**
✅ **Console Should Show Loading Sequence:**
```
🔧 FABRIC CATEGORIES DEBUG - fabCategory response: {...}
🔧 MARKET DEBUG - market data: {...}
🔧 LISTS DEBUG - categoryList: [{label: "...", value: "..."}, ...]
🔧 LISTS DEBUG - marketList: [{label: "...", value: "..."}, ...]
🔧 DATA CHANGE DEBUG - categoryList updated: X items
🔧 DATA CHANGE DEBUG - marketList updated: Y items
```

## Common Issues and Solutions

### Issue 1: Form Fields Are Empty
**Symptoms:** All form fields show placeholders or empty values

**Check:**
1. Console for `productInfo` debug logs
2. Verify `isEditMode: true` in logs
3. Look for "EDIT MODE INITIALIZATION" messages

**Possible Causes:**
- Data not passed correctly from ViewFabric.jsx
- Route state not accessible
- Timing issue with data loading

### Issue 2: Dropdowns Show Placeholder Text
**Symptoms:** Market/Category dropdowns show "Choose market" / "Choose fabric"

**Check:**
1. Console for SELECT DEBUG logs
2. Type comparison results (should be `true`)
3. Category/Market data loading logs

**Possible Causes:**
- Type mismatch (string vs number)
- Category/Market data not loaded yet
- Incorrect ID mapping

### Issue 3: Colors Not Populated
**Symptoms:** Color section shows default values

**Check:**
1. Console for fabric colors debug logs
2. `available_colors` field value
3. `fabric_colors` array structure

**Possible Causes:**
- Fabric colors stored in different format
- Color parsing issue with comma-separated string
- Available colors count not set correctly

### Issue 4: No Console Debug Logs
**Symptoms:** No debug messages in console

**Check:**
1. Browser console is open and showing all log levels
2. Page is actually the edit page (`/admin/fabric/edit-product`)
3. Console is cleared and page refreshed

**Solution:**
- Refresh the page with console open
- Check browser console settings
- Verify you're on the correct route

## Debug Log Reference

### Key Debug Prefixes:
- `🔧 FABRIC EDIT DEBUG` - Main edit functionality
- `🔧 FABRIC CATEGORY DEBUG` - Category data handling
- `🔧 FABRIC DEBUG` - General fabric object info
- `🔧 EDIT MODE DEBUG` - Edit mode initialization
- `🔧 MARKET DEBUG` - Market data loading
- `🔧 LISTS DEBUG` - Dropdown option generation
- `🔧 SELECT DEBUG` - Dropdown value matching
- `🔧 FORM VALUES DEBUG` - Real-time form state
- `🔧 DATA CHANGE DEBUG` - Data loading events

### Success Indicators:
1. `productInfo` object contains fabric data
2. `isEditMode: true`
3. "EDIT MODE INITIALIZATION - Starting form population"
4. "EDIT MODE INITIALIZATION - Form population completed"
5. SELECT DEBUG shows `Result: true` for comparisons
6. FORM VALUES DEBUG shows populated data

## Performance Testing

### Load Time Test:
1. Measure time from click to form population
2. Should complete within 2-3 seconds
3. Check for any loading delays

### Network Test:
1. Test with slow network connection
2. Verify data loads correctly
3. Check error handling for failed requests

## Browser Compatibility

Test the following scenarios across browsers:

**Chrome/Edge:**
- Standard testing procedure
- Check for any console warnings

**Firefox:**
- Verify React components render correctly
- Check for any Firefox-specific issues

**Safari (if available):**
- Test dropdown functionality
- Verify color picker compatibility

## Reporting Issues

If any test fails, please report with:

1. **Browser and version**
2. **Exact steps taken**
3. **Console output** (copy/paste debug logs)
4. **Screenshots** of form state
5. **Network tab** showing API requests
6. **Fabric data structure** from API response

## Success Criteria

✅ All form fields pre-populated correctly
✅ Dropdowns show selected values (not placeholders)
✅ Colors loaded and displayed properly
✅ Console shows complete debug sequence
✅ No JavaScript errors in console
✅ Form remains editable and functional
✅ Save functionality works after editing