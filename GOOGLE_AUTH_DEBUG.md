# Google Authentication Debug Guide

## Issues Fixed & Testing Instructions

### 🔍 Problems Identified & Solutions

#### 1. **"Access denied: Invalid role '[object Object]'" Error**
- **Issue**: User role was being stored as an object instead of string
- **Fix**: Added role type checking and conversion to string
- **Location**: `src/modules/Auth/hooks/useGoogleSignIn.jsx`

#### 2. **User Store Not Populated After Google Signin**
- **Issue**: `useCarybinUserStore` was not being populated with user data
- **Fix**: Added proper user data structure matching regular login flow
- **Location**: `src/modules/Auth/hooks/useGoogleSignIn.jsx`

#### 3. **Session Manager Missing User Data**
- **Issue**: SessionManager only stored tokens, not user information
- **Fix**: Updated to store user data and role information
- **Location**: `src/services/SessionManager.js`

#### 4. **"My Account" Redirect to Login**
- **Issue**: User profile wasn't being fetched after Google auth
- **Fix**: Added query invalidation to trigger profile refetch
- **Location**: `src/modules/Auth/hooks/useGoogleSignIn.jsx`

---

## 🧪 Testing Steps

### **Test 1: Google Sign-in from Cart Checkout**

1. **Add Product to Cart**
   - Go to marketplace
   - Add any product to cart
   - Navigate to cart page

2. **Initiate Checkout**
   - Click "Proceed to Checkout"
   - Should redirect to login page

3. **Google Sign-in**
   - Click "Sign in with Google"
   - Complete Google authentication
   - Should redirect back to cart/checkout

4. **Verify Checkout Works**
   - Should see checkout confirmation modal
   - No "Access denied" or role errors
   - Can proceed with payment

### **Test 2: My Account Access**

1. **After Google Sign-in**
   - Click on user profile/avatar in top right
   - Click "My Account"
   - Should navigate to customer dashboard
   - Should NOT redirect to login page

2. **Verify Dashboard Data**
   - User name should display correctly
   - Profile picture/initials should show
   - All dashboard sections should be accessible

### **Test 3: Session Persistence**

1. **Sign in with Google**
2. **Refresh the Page**
   - Should remain logged in
   - User data should persist
3. **Navigate Between Pages**
   - User should stay authenticated
   - No unexpected logouts

---

## 🐛 Debug Console Logs

When testing, check browser console for these log messages:

### **Successful Google Auth Logs:**
```
🔐 Login: Google signin initiated Token received
🚀 Google Auth: Starting authentication with payload: {...}
✅ Google Auth: Success response: {...}
📊 Google Auth: Response structure: {...}
🔧 Google Auth: Processed role: user string
✅ Google Auth: User data stored in store: {...}
🔄 Google Auth: Triggering profile refetch
🚀 Google Auth: Navigating with role: user
🔀 Google Auth: Handling navigation for role: user
✅ Google Auth: Navigating to: /customer
```

### **Error Logs to Watch For:**
```
❌ Google Auth: Authentication failed: {...}
⚠️ Google Auth: Role is an object, extracting string value: {...}
❌ Google Auth: No user role found in response
❌ Google Auth: Error processing success response: {...}
```

---

## 🔧 Environment Setup

### **Required Environment Variables:**
```
VITE_GOOGLE_LOGIN=your_google_oauth_client_id
VITE_APP_CaryBin_API_URL=your_backend_api_url
```

### **Google OAuth Configuration:**
- Ensure your Google OAuth client ID is properly configured
- Check that your domain is added to authorized origins
- Verify redirect URIs are correctly set

---

## 🔍 Troubleshooting

### **If Google Auth Still Fails:**

1. **Check Network Tab**
   - Look for failed API calls to `/auth/sso`
   - Check if tokens are being sent in headers

2. **Check Application Tab (Dev Tools)**
   - Verify cookies are being set: `token`, `currUserUrl`, `approvedByAdmin`
   - Check Local Storage for any corrupted data

3. **Check Console Errors**
   - Look for JavaScript errors during auth flow
   - Check for CORS issues

### **Common Issues:**

#### **Role Still Shows as Object:**
- Check backend response structure
- Verify API returns role as string, not object

#### **User Data Not Persisting:**
- Clear browser cache and cookies
- Check if `useGetUserProfile` is being called
- Verify API authentication headers

#### **Redirect Loop:**
- Check `currUserUrl` cookie value
- Verify protected routes are working correctly
- Check SessionManager auth state

---

## 📋 API Response Structure

### **Expected Google Auth Response:**
```json
{
  "data": {
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here", 
    "refreshTokenExpiry": "2024-01-01T00:00:00Z",
    "message": "Success message",
    "data": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com", 
      "role": "user",
      "profile": {
        "approved_by_admin": true,
        "profile_picture": "url_or_null"
      }
    }
  }
}
```

---

## 🚀 Deployment Notes

### **Before Deploying:**
1. Test all Google auth flows thoroughly
2. Verify environment variables are set correctly
3. Test with different user roles
4. Check mobile responsiveness of auth flow

### **Production Checklist:**
- [ ] Google OAuth client ID configured for production domain
- [ ] All redirect URIs updated for production
- [ ] Error logging configured for monitoring
- [ ] Rate limiting considered for auth endpoints
- [ ] HTTPS enabled for all auth flows

---

## 📞 Support

If issues persist after following this guide:

1. Check console logs and network tab
2. Verify all environment variables
3. Test with different browsers/incognito mode
4. Check backend API logs for auth endpoint errors

For role-related errors, focus on the user data structure in the backend response.
For session persistence issues, check the SessionManager and cookie configuration.