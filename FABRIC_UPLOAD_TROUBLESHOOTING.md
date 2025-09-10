# Fabric Vendor Upload Troubleshooting Guide

## Overview
This guide helps diagnose and fix upload issues in the fabric vendor dashboard when updating order status with images.

## Recent Fixes Applied

### 1. Enhanced Response Handling
**Issue**: Upload was failing due to inconsistent API response structure
**Fix**: Updated `uploadImageToMultimedia` function to check multiple response paths:

```javascript
const imageUrl =
  result?.data?.data?.url ||
  result?.url ||
  result?.data?.image_url ||
  result?.imageUrl ||
  result?.data?.url;
```

### 2. Improved Authentication
**Issue**: Fabric vendor routes might not use correct authentication token
**Fix**: Enhanced token detection in `CarybinBaseUrl.tsx`:

```javascript
const isFabricRoute = window.location.pathname.includes("/fabric");

if (isAdminRoute) {
  accessToken = Cookies.get("adminToken");
} else if (isFabricRoute) {
  accessToken = Cookies.get("fabricToken") || Cookies.get("token");
} else {
  accessToken = Cookies.get("token");
}
```

### 3. Enhanced Error Logging
**Issue**: Insufficient error information for debugging
**Fix**: Added comprehensive logging throughout the upload process

### 4. Debug Component
**Added**: `FabricUploadDebug` component for real-time testing and diagnostics

## Common Issues & Solutions

### 1. "Upload failed" Error

#### Symptoms
- File selects successfully
- Upload process starts but fails
- Generic "Upload failed" message

#### Diagnosis Steps
1. **Check Network Connection**
   ```javascript
   console.log("Online:", navigator.onLine);
   ```

2. **Verify Authentication**
   ```javascript
   console.log("Token:", !!Cookies.get("token"));
   console.log("Fabric Token:", !!Cookies.get("fabricToken"));
   ```

3. **Check API Response**
   - Open browser dev tools
   - Look for network requests to `/multimedia-upload/image`
   - Check response status and data structure

#### Solutions
- **401 Unauthorized**: Re-login to refresh authentication
- **413 Payload Too Large**: Reduce image file size
- **422 Unprocessable Entity**: Check file format (must be image)
- **No image URL in response**: API may have changed response structure

### 2. Authentication Issues

#### Symptoms
- 401 Unauthorized errors
- No Authorization header in requests

#### Solutions
1. **Clear and Re-login**
   ```javascript
   // Clear all auth cookies
   Cookies.remove("token");
   Cookies.remove("fabricToken");
   Cookies.remove("adminToken");
   // Then re-login
   ```

2. **Check Route Detection**
   - Ensure URL contains `/fabric/`
   - Verify token is being applied correctly

### 3. File Validation Errors

#### Symptoms
- File rejected before upload
- "Invalid file format" messages

#### Solutions
- **File Size**: Maximum 5MB
- **File Types**: JPG, PNG, GIF only
- **File Name**: Avoid special characters

### 4. API Response Structure Issues

#### Symptoms
- Upload completes but "No image URL in response"
- Status update fails after successful upload

#### Investigation
Check the actual API response structure:
```javascript
// In browser console during upload
console.log("API Response:", response);
console.log("Available keys:", Object.keys(response?.data || {}));
```

#### Common Response Structures
```javascript
// Structure 1
{ data: { data: { url: "image_url" } } }

// Structure 2
{ data: { url: "image_url" } }

// Structure 3
{ url: "image_url" }

// Structure 4
{ data: { image_url: "image_url" } }
```

## Testing with Debug Component

### Accessing Debug Panel
1. Navigate to any fabric order details page
2. Look for blue circle button in bottom-right corner
3. Click to open debug panel

### Running Diagnostics
1. Click "Run System Diagnostics"
2. Review all checkmarks and errors
3. Pay attention to:
   - Authentication tokens
   - Network connectivity
   - Environment variables

### Testing Upload
1. Select a test image in debug panel
2. Click "Test Upload"
3. Review detailed results
4. Check console for additional logs

## Environment Checks

### Required Environment Variables
```bash
VITE_APP_CaryBin_API_URL=https://your-api-url.com
```

### Browser Requirements
- FormData API support
- FileReader API support
- Modern browser with fetch support

## API Endpoint Verification

### Image Upload Endpoint
```
POST /multimedia-upload/image
Content-Type: multipart/form-data
Authorization: Bearer {token}

FormData:
- image: File
```

### Status Update Endpoint
```
PUT /orders/{id}/status
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  "status": "OUT_FOR_DELIVERY" | "DISPATCHED_TO_AGENT",
  "metadata": {
    "image": "uploaded_image_url"
  }
}
```

## Manual Testing Steps

### 1. Basic Upload Test
1. Open fabric order details
2. Click "Update Status" button
3. Select small test image (< 1MB)
4. Monitor network tab for requests
5. Check for successful responses

### 2. Authentication Test
```javascript
// In browser console
fetch('/multimedia-upload/image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Cookies.get('token')}`
  }
});
```

### 3. File Format Test
Test with different file types:
- ✅ JPG/JPEG
- ✅ PNG
- ✅ GIF
- ❌ PDF, DOCX, etc.

## Debugging Checklist

### Pre-Upload
- [ ] User is authenticated (has valid token)
- [ ] File is selected and valid
- [ ] Network connection is stable
- [ ] API base URL is configured

### During Upload
- [ ] FormData is properly constructed
- [ ] Authorization header is present
- [ ] Request reaches server (200/400/500 response)
- [ ] No CORS errors

### Post-Upload
- [ ] Response contains image URL
- [ ] Image URL is properly extracted
- [ ] Status update request succeeds
- [ ] Page refreshes with new status

## Known Limitations

### File Size
- Maximum: 5MB per image
- Recommended: < 2MB for faster uploads

### File Types
- Supported: JPG, JPEG, PNG, GIF
- Not supported: WEBP, SVG, BMP

### Network
- Requires stable internet connection
- Upload may timeout on slow connections

## Monitoring & Logs

### Browser Console Logs
Look for these log patterns:
```
🔄 Attempting multimedia upload...
✅ Multimedia upload response received:
📊 Step 2: Updating order status...
✅ FABRIC VENDOR Order status updated successfully
```

### Error Patterns
```
❌ Multimedia upload failed:
❌ No image URL found in response:
❌ Upload flow error:
```

### Network Tab
Monitor these endpoints:
- `/multimedia-upload/image` (POST)
- `/orders/{id}/status` (PUT)

## Support Information

### Files Modified
- `/src/modules/Pages/fabricDashboard/OrdersDetails.jsx`
- `/src/services/CarybinBaseUrl.tsx`
- `/src/components/debug/FabricUploadDebug.jsx` (new)

### Dependencies
- React Query for API state management
- Axios for HTTP requests
- js-cookie for token management
- Lucide React for icons

### Contact
For persistent issues:
1. Check browser console for errors
2. Use debug component for detailed diagnostics
3. Verify API endpoints are functioning
4. Review authentication setup

## Quick Fix Commands

### Clear Authentication
```javascript
// In browser console
Cookies.remove("token");
Cookies.remove("fabricToken");
sessionManager.clearSession();
location.reload();
```

### Force Re-authentication
```javascript
// Navigate to login
window.location.href = "/auth/login";
```

### Reset Upload State
```javascript
// If stuck in uploading state
setIsUploading(false);
setUploadStatus("");
setSelectedFile(null);
```

## Version History

### v1.2 (Current)
- Enhanced response handling for multiple API structures
- Improved authentication for fabric vendor routes
- Added comprehensive debug component
- Enhanced error logging and diagnostics

### v1.1
- Basic upload functionality
- Simple error handling
- Status update integration

### v1.0
- Initial implementation
- File validation
- Basic UI components