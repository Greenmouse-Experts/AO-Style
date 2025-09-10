# Withdrawal/Payout Testing Guide

## Overview
This guide provides comprehensive testing instructions for the withdrawal/payout system implementation. Follow these steps to verify all functionality works correctly.

## Prerequisites

### 1. Environment Setup
- Ensure backend API is running with withdrawal endpoints
- Verify Paystack API credentials are configured
- Admin user account with proper permissions
- Test withdrawal requests in the database

### 2. Test Data Requirements
Create test withdrawal requests with different statuses:
- **PENDING**: For testing initiate transfer
- **ACCEPTED**: For testing finalize and verify transfer
- **DECLINED**: For testing disabled actions

## Testing Scenarios

### 1. Withdrawal Data Display

#### Test: View Withdrawal Requests
1. Navigate to Admin Dashboard
2. Go to **Payments/Transactions** page
3. Click on **"Payouts"** tab
4. Verify withdrawal requests are displayed

**Expected Results:**
- Withdrawal table shows data from `/withdraw/fetch` endpoint
- Withdrawal IDs formatted as `WTH{id}`
- User information displayed correctly
- Status badges show appropriate colors
- Bank details visible where available

#### Test: Sub-tab Filtering
1. Click on different sub-tabs: **All**, **ACCEPTED**, **DECLINED**, **PENDING**
2. Verify filtering works correctly

**Expected Results:**
- Each sub-tab filters withdrawals by status
- URL parameters update correctly
- Data refreshes automatically

### 2. Transfer Operations

#### Test: Initiate Transfer
1. Find a withdrawal with **PENDING** status
2. Click **"Initiate Transfer"** button
3. Verify modal opens with withdrawal details
4. Click **"Initiate Transfer"** in modal

**Expected Results:**
- Modal displays withdrawal information correctly
- API call to `/withdraw/initiate` endpoint
- Success toast notification appears
- Withdrawal status updates to **ACCEPTED**
- Table refreshes automatically

#### Test: Finalize Transfer
1. Find a withdrawal with **ACCEPTED** status
2. Click **"Finalize Transfer"** button
3. Enter OTP in the modal (use test OTP: `399402`)
4. Click **"Finalize Transfer"**

**Expected Results:**
- OTP input field appears
- API call to `/withdraw/finalize-transfer` with OTP
- Success toast notification appears
- Withdrawal status updates accordingly
- Table refreshes automatically

#### Test: Verify Transfer
1. Find a withdrawal with **ACCEPTED** status
2. Click **"Verify Transfer"** button
3. Enter reference in the modal (use test reference: `5e1hfz33wjpxwo69ceta`)
4. Click **"Verify Transfer"**

**Expected Results:**
- Reference input field appears
- API call to `/withdraw/verify-transfer` with reference
- Success toast notification appears
- Withdrawal status updates accordingly
- Table refreshes automatically

### 3. Error Handling

#### Test: Invalid OTP
1. Try to finalize transfer with empty or invalid OTP
2. Verify error handling

**Expected Results:**
- Form validation prevents submission
- Appropriate error message displayed
- Modal remains open for correction

#### Test: Invalid Reference
1. Try to verify transfer with empty reference
2. Verify error handling

**Expected Results:**
- Form validation prevents submission
- Appropriate error message displayed
- Modal remains open for correction

#### Test: API Errors
1. Test with invalid withdrawal IDs
2. Test with network failures

**Expected Results:**
- Error toast notifications appear
- User-friendly error messages
- Modal closes on error
- No data corruption

### 4. UI/UX Testing

#### Test: Action Button States
1. Verify button states for different withdrawal statuses:
   - **PENDING**: Only "Initiate Transfer" enabled
   - **ACCEPTED**: "Finalize Transfer" and "Verify Transfer" enabled
   - **DECLINED**: No transfer actions available

#### Test: Loading States
1. Monitor loading indicators during API calls
2. Verify buttons are disabled during operations

**Expected Results:**
- Loading spinners appear during API calls
- Buttons show loading text and are disabled
- No duplicate requests possible

#### Test: Modal Interactions
1. Test modal opening and closing
2. Test clicking outside modal
3. Test escape key functionality

**Expected Results:**
- Modal opens/closes smoothly
- Form data resets on close
- No memory leaks or state issues

### 5. Data Export

#### Test: PDF Export
1. Go to Payouts tab
2. Change export dropdown to PDF
3. Click export

**Expected Results:**
- PDF file downloads with withdrawal data
- Proper formatting and headers
- All visible data included

#### Test: Excel Export
1. Change export dropdown to Excel
2. Click export

**Expected Results:**
- Excel file downloads correctly
- Data properly formatted in spreadsheet
- Headers and data alignment correct

#### Test: CSV Export
1. Click CSV download link

**Expected Results:**
- CSV file downloads with proper format
- Data matches table display
- Compatible with spreadsheet applications

### 6. Search and Pagination

#### Test: Search Functionality
1. Use search input to filter withdrawals
2. Test various search terms (user names, amounts, etc.)

**Expected Results:**
- Real-time search with debounce
- Results update as you type
- Search works across all relevant fields

#### Test: Pagination
1. Verify pagination controls work
2. Test different page sizes
3. Navigate between pages

**Expected Results:**
- Pagination controls functional
- Data loads correctly for each page
- Page state maintained during operations

## API Endpoint Testing

### Manual API Testing
Use Postman or similar tool to test endpoints directly:

```bash
# Get withdrawals
GET /withdraw/fetch?status=PENDING&pagination[page]=1&pagination[limit]=10

# Initiate transfer
POST /withdraw/initiate
{
  "withdrawalId": "123"
}

# Finalize transfer
POST /withdraw/finalize-transfer
{
  "otp": "399402",
  "withdrawalId": "123"
}

# Verify transfer
POST /withdraw/verify-transfer
{
  "reference": "5e1hfz33wjpxwo69ceta"
}
```

## Performance Testing

### 1. Load Testing
- Test with large number of withdrawal records
- Verify pagination handles large datasets
- Monitor response times

### 2. Concurrent Operations
- Test multiple admins performing transfers simultaneously
- Verify data consistency
- Check for race conditions

## Security Testing

### 1. Authorization
- Verify only admin users can access transfer functions
- Test with different user roles
- Ensure proper permission checks

### 2. Input Validation
- Test XSS prevention in form inputs
- Verify SQL injection protection
- Test with malformed data

### 3. API Security
- Verify authentication headers required
- Test rate limiting if implemented
- Check for proper error messages (no data leakage)

## Browser Compatibility

Test on multiple browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mobile Responsiveness

Test on different screen sizes:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x812)

## Common Issues and Solutions

### Issue: Modal not opening
**Solution:** Check console for JavaScript errors, verify modal component imports

### Issue: API calls failing
**Solution:** Verify backend endpoints are running, check network tab for request details

### Issue: Data not refreshing
**Solution:** Check React Query cache invalidation, verify query keys match

### Issue: Export not working
**Solution:** Check file download permissions, verify export library imports

## Test Checklist

- [ ] Withdrawal data displays correctly
- [ ] Sub-tab filtering works
- [ ] Initiate transfer functionality
- [ ] Finalize transfer with OTP
- [ ] Verify transfer with reference
- [ ] Error handling for invalid inputs
- [ ] Loading states and button disabilities
- [ ] Modal interactions
- [ ] PDF export functionality
- [ ] Excel export functionality
- [ ] CSV export functionality
- [ ] Search functionality
- [ ] Pagination controls
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility
- [ ] Security and authorization
- [ ] Performance with large datasets

## Reporting Issues

When reporting issues, include:
1. Steps to reproduce
2. Expected vs actual behavior
3. Browser and version
4. Console error messages
5. Network request details
6. Screenshots if UI-related

## Test Environment Reset

To reset test environment:
1. Clear browser cache
2. Reset test database withdrawal statuses
3. Clear local storage
4. Restart development server

## Success Criteria

The implementation passes testing when:
- All withdrawal operations work without errors
- UI is responsive and intuitive
- Data integrity is maintained
- Error handling is comprehensive
- Performance is acceptable
- Security requirements are met