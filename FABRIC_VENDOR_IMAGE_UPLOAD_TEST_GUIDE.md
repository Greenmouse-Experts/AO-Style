# Fabric Vendor Image Upload Status Update - Testing Guide

## Overview
This guide provides comprehensive testing instructions for the newly implemented fabric vendor status update system with mandatory image uploads. The implementation follows the model flow pattern established in the tailor dashboard.

## Pre-Testing Setup

### Environment Requirements
- ✅ Development server running (`npm run dev`)
- ✅ Backend API accessible
- ✅ Multimedia service endpoint functional
- ✅ Valid fabric vendor account credentials
- ✅ Test orders with different product types (fabric-only and fabric+style)

### Test Data Requirements
- Orders with status `PAID` (ready for vendor updates)
- Orders containing only fabric items
- Orders containing both fabric and style items
- Various image files for upload testing (valid and invalid)

## Testing Scenarios

### Scenario 1: Fabric-Only Order Status Update

#### Test Case 1.1: Valid Fabric-Only Order Update
**Objective**: Verify fabric-only orders route to `OUT_FOR_DELIVERY`

**Steps**:
1. Login as fabric vendor
2. Navigate to Orders page (`/fabric/orders`)
3. Locate an order with only fabric items (status: `PAID`)
4. Click "Update Status" action button
5. Verify modal shows appropriate status options
6. Select "Out for Delivery"
7. Verify image upload modal opens
8. Upload a valid image (JPG/PNG, <5MB)
9. Click "Upload & Update Status"
10. Wait for completion

**Expected Results**:
- ✅ Modal displays "Out for Delivery" as only option
- ✅ Image upload modal opens with fabric-specific messaging
- ✅ Upload progress indicators work correctly
- ✅ Order status updates to `OUT_FOR_DELIVERY`
- ✅ Success toast notification appears
- ✅ Order list refreshes with updated status
- ✅ No further update actions available for this order

#### Test Case 1.2: Fabric-Only Order - Invalid File Upload
**Objective**: Verify file validation for fabric-only orders

**Steps**:
1. Follow steps 1-7 from Test Case 1.1
2. Attempt to upload invalid files:
   - File >5MB
   - Non-image file (PDF, TXT, etc.)
   - Corrupted image file
3. Observe error handling

**Expected Results**:
- ✅ File size error: "File size must be less than 5MB"
- ✅ File type error: "Please select a valid image file"
- ✅ Upload button remains disabled for invalid files
- ✅ Error messages clear when valid file selected

### Scenario 2: Fabric+Style Order Status Update

#### Test Case 2.1: Valid Fabric+Style Order Update
**Objective**: Verify fabric+style orders route to `DISPATCHED_TO_AGENT`

**Steps**:
1. Login as fabric vendor
2. Navigate to Orders page (`/fabric/orders`)
3. Locate an order with fabric and style items (status: `PAID`)
4. Click "Update Status" action button
5. Verify modal shows appropriate status options
6. Select "Dispatched to Agent"
7. Verify image upload modal opens
8. Upload a valid image
9. Click "Upload & Update Status"
10. Wait for completion

**Expected Results**:
- ✅ Modal displays "Dispatched to Agent" as only option
- ✅ Image upload modal shows agent dispatch messaging
- ✅ Upload process completes successfully
- ✅ Order status updates to `DISPATCHED_TO_AGENT`
- ✅ Success notification with appropriate message
- ✅ Order list updates correctly
- ✅ No further update actions available

#### Test Case 2.2: Style Detection Accuracy
**Objective**: Verify system correctly identifies style items

**Test Data Variations**:
- Orders with `product.type === "STYLE"`
- Orders with `purchase_type === "STYLE"`
- Orders with `product.style` object present
- Orders with style-related terms in product names

**Steps**:
1. Test each order type variation
2. Verify correct status routing
3. Check console logs for detection logic

**Expected Results**:
- ✅ All style detection methods work correctly
- ✅ Console logs show accurate detection
- ✅ Correct status options presented for each type

### Scenario 3: Order Details Page Testing

#### Test Case 3.1: Individual Order Status Update
**Objective**: Verify order details page status updates work correctly

**Steps**:
1. Navigate to individual order details page
2. Locate status update button
3. Click update button
4. Complete image upload process
5. Verify status update

**Expected Results**:
- ✅ Order details page shows correct current status
- ✅ Update button opens image upload modal
- ✅ Status updates correctly on details page
- ✅ Page refreshes with new status information

### Scenario 4: Error Handling Testing

#### Test Case 4.1: Network Failure Simulation
**Objective**: Verify graceful handling of network issues

**Steps**:
1. Start status update process
2. Simulate network disconnection during upload
3. Observe error handling and recovery

**Expected Results**:
- ✅ Clear error messages displayed
- ✅ Upload status resets properly
- ✅ Modal remains accessible for retry
- ✅ No partial status updates occur

#### Test Case 4.2: API Error Handling
**Objective**: Verify handling of backend API errors

**Test Scenarios**:
- Invalid authentication token
- Order ownership validation failure
- Multimedia service unavailable
- Database connection issues

**Expected Results**:
- ✅ User-friendly error messages
- ✅ No application crashes
- ✅ Proper error logging in console
- ✅ Recovery options available

### Scenario 5: User Interface Testing

#### Test Case 5.1: Modal Behavior
**Objective**: Verify modal functionality and UX

**Steps**:
1. Open status update modal
2. Test all interactive elements
3. Verify modal can be closed properly
4. Test keyboard navigation
5. Check responsive behavior

**Expected Results**:
- ✅ Modal opens and closes smoothly
- ✅ All buttons work correctly
- ✅ Keyboard navigation functions
- ✅ Mobile responsive design works
- ✅ Backdrop click closes modal

#### Test Case 5.2: Image Preview Functionality
**Objective**: Verify image preview and file management

**Steps**:
1. Select various image files
2. Check preview generation
3. Test file removal functionality
4. Verify file size display

**Expected Results**:
- ✅ Image previews generate correctly
- ✅ File details display accurately
- ✅ Remove button works properly
- ✅ File input resets correctly

### Scenario 6: Mobile Device Testing

#### Test Case 6.1: Mobile Upload Experience
**Objective**: Verify mobile device compatibility

**Steps**:
1. Access application on mobile device
2. Navigate to orders page
3. Perform status update with image upload
4. Test camera capture functionality

**Expected Results**:
- ✅ Mobile interface renders correctly
- ✅ Upload modal fits screen properly
- ✅ Camera integration works (if supported)
- ✅ Touch interactions function smoothly

## Performance Testing

### Test Case P.1: Upload Speed Testing
**Objective**: Verify acceptable upload performance

**Steps**:
1. Upload images of various sizes
2. Measure upload times
3. Test multiple concurrent uploads
4. Monitor memory usage

**Performance Benchmarks**:
- ✅ Small images (<1MB): <3 seconds
- ✅ Medium images (1-3MB): <8 seconds
- ✅ Large images (3-5MB): <15 seconds
- ✅ Memory usage remains stable

## Regression Testing

### Test Case R.1: Existing Functionality
**Objective**: Ensure existing features still work

**Areas to Test**:
- Order listing and filtering
- Order search functionality
- Order details viewing
- Navigation between pages
- User authentication flows

**Expected Results**:
- ✅ All existing features function normally
- ✅ No performance degradation
- ✅ No UI/UX regressions

## Browser Compatibility Testing

### Supported Browsers
- ✅ Chrome (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Edge (latest 2 versions)

### Test Cases per Browser
- Basic upload functionality
- Image preview generation
- Modal behavior
- Error handling
- Performance benchmarks

## Security Testing

### Test Case S.1: File Upload Security
**Objective**: Verify secure file handling

**Steps**:
1. Attempt to upload executable files
2. Test with malicious file names
3. Verify file type validation
4. Check for XSS vulnerabilities

**Expected Results**:
- ✅ Only image files accepted
- ✅ File names sanitized properly
- ✅ No script execution from uploads
- ✅ Secure upload endpoints used

## Test Reporting

### Test Execution Checklist

#### Functional Tests
- [ ] Fabric-only order updates ✅/❌
- [ ] Fabric+style order updates ✅/❌
- [ ] File validation ✅/❌
- [ ] Error handling ✅/❌
- [ ] Modal functionality ✅/❌
- [ ] Image preview ✅/❌

#### Non-Functional Tests
- [ ] Performance benchmarks ✅/❌
- [ ] Mobile compatibility ✅/❌
- [ ] Browser compatibility ✅/❌
- [ ] Security validation ✅/❌

#### Regression Tests
- [ ] Existing features ✅/❌
- [ ] Navigation flows ✅/❌
- [ ] Authentication ✅/❌

### Bug Report Template

**Bug ID**: [Unique identifier]
**Severity**: Critical/High/Medium/Low
**Browser/Device**: [Browser version and device info]
**Test Case**: [Reference to test case]
**Steps to Reproduce**: [Detailed steps]
**Expected Result**: [What should happen]
**Actual Result**: [What actually happened]
**Screenshots**: [If applicable]
**Console Errors**: [Any JavaScript errors]
**Workaround**: [If available]

## Post-Testing Activities

### Success Criteria
- All critical and high-severity test cases pass
- No regressions in existing functionality
- Performance benchmarks met
- Security validations pass
- Mobile compatibility confirmed

### Sign-off Requirements
- [ ] Development team testing complete
- [ ] QA testing complete
- [ ] User acceptance testing complete
- [ ] Performance testing complete
- [ ] Security testing complete

### Deployment Readiness
- [ ] All tests passed
- [ ] Documentation updated
- [ ] Monitoring configured
- [ ] Rollback plan prepared
- [ ] Support team trained

## Troubleshooting Common Issues

### Issue: Upload Modal Not Opening
**Potential Causes**:
- JavaScript errors in console
- Missing dependencies
- Modal state management issues

**Solutions**:
- Check browser console for errors
- Verify all imports are correct
- Review React state management

### Issue: Image Upload Fails
**Potential Causes**:
- Network connectivity issues
- Authentication token expired
- Multimedia service unavailable
- File format/size issues

**Solutions**:
- Check network connection
- Refresh authentication token
- Verify multimedia service status
- Validate file requirements

### Issue: Status Update Fails After Upload
**Potential Causes**:
- API endpoint issues
- Order state validation errors
- Database connectivity problems

**Solutions**:
- Check API endpoint availability
- Verify order ownership and status
- Review server logs for errors

## Conclusion

This testing guide provides comprehensive coverage for the fabric vendor image upload status update implementation. Follow all test cases systematically to ensure reliable functionality before production deployment. Report any issues found during testing using the provided bug report template.

For questions or issues during testing, contact the development team with specific test case references and detailed error information.