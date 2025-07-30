# 🧪 Session Management Testing Guide

## Overview
This guide provides comprehensive testing strategies to verify the session management system works correctly across all scenarios.

## 🚀 Quick Start Testing

### 1. Enable Test Panel
Add the test panel to any dashboard for easy testing:

```jsx
// Add to your dashboard layout (temporarily for testing)
import SessionTestPanel from "../../../components/SessionTestPanel";

// In your component JSX:
<SessionTestPanel />
```

### 2. Browser Console Testing
Open browser DevTools and use these commands:

```javascript
// Get current session status
sessionTester.getSessionTestData()

// Test token refresh
sessionTester.testTokenRefresh()

// Simulate token expiry in 1 minute
sessionTester.simulateTokenExpiry(1)

// Run full test suite
sessionTester.runTestSuite()

// Show floating test dashboard
sessionTester.createTestDashboard()
```

## 📋 Manual Testing Checklist

### ✅ **Basic Session Tests**

#### Test 1: Login and Session Initialization
1. **Login** to any dashboard (customer, admin, tailor, etc.)
2. **Open Console** and run: `sessionTester.getSessionTestData()`
3. **Verify**:
   - `sessionStatus.status` = "active"
   - `authData.hasAccessToken` = true
   - `authData.hasRefreshToken` = true
   - `refreshTokenExpiry` shows future date

#### Test 2: Token Refresh Functionality
1. **Run**: `sessionTester.testTokenRefresh()`
2. **Verify**:
   - Returns `{ success: true }`
   - Token values change in cookies
   - No logout occurs
   - Console shows: "✅ Token refreshed successfully"

#### Test 3: Session Status Monitoring
1. **Run**: `sessionTester.createTestDashboard()`
2. **Observe** floating dashboard for 2-3 minutes
3. **Verify**:
   - Status remains "active"
   - Time countdown updates correctly
   - All indicators show green checkmarks

### ⚠️ **Session Expiry Tests**

#### Test 4: Session Warning Modal (5-minute warning)
1. **Run**: `sessionTester.simulateTokenExpiry(5)`
2. **Wait** for session warning modal to appear
3. **Verify Modal**:
   - Shows countdown timer (5:00, 4:59, 4:58...)
   - "Extend Session" button works
   - "Logout Now" button works
   - Progress bar decreases over time
   - Colors change: Yellow → Orange → Red

#### Test 5: Auto Session Extension
1. **Trigger** session warning modal (Test 4)
2. **Click** "Extend Session" button
3. **Verify**:
   - Modal closes
   - Session remains active
   - New expiry time is set
   - Success toast appears

#### Test 6: Auto Logout on Expiry
1. **Run**: `sessionTester.simulateTokenExpiry(1)` (1 minute)
2. **Wait** for modal and countdown to reach 0:00
3. **Verify**:
   - Auto logout occurs
   - Redirected to login page
   - All cookies cleared
   - Toast shows "Session expired"

#### Test 7: Immediate Session Expiry
1. **Run**: `sessionTester.simulateImmediateExpiry()`
2. **Verify**:
   - Immediate logout occurs
   - Session expiry modal may briefly appear
   - Redirected to login page

### 🔄 **Token Refresh Tests**

#### Test 8: Automatic 10-Minute Refresh
1. **Login** and stay active for 10+ minutes
2. **Monitor** console logs
3. **Verify**:
   - See "🔄 Session Manager: Refreshing access token" every 10 minutes
   - See "✅ Session Manager: Token refreshed successfully"
   - No interruption to user experience

#### Test 9: API Request Auto-Refresh
1. **Login** and navigate to any data-heavy page
2. **Run**: `sessionTester.simulateImmediateExpiry()`
3. **Make** an API request (navigate, refresh page, etc.)
4. **Verify**:
   - First request fails with 401
   - Token refresh attempt occurs
   - If refresh succeeds: request retries automatically
   - If refresh fails: session expiry modal appears

### 🌐 **Cross-Tab and Browser Tests**

#### Test 10: Cross-Tab Logout Synchronization
1. **Open** 2 tabs with same dashboard
2. **Logout** from one tab
3. **Verify**:
   - Other tab also logs out automatically
   - Both redirect to login page

#### Test 11: Page Refresh Persistence
1. **Login** to dashboard
2. **Refresh** the page multiple times
3. **Verify**:
   - Session persists after refresh
   - No unnecessary re-logins
   - Token refresh works after refresh

#### Test 12: Browser Tab Visibility
1. **Login** to dashboard
2. **Switch** to another tab/application for 5+ minutes
3. **Return** to dashboard tab
4. **Verify**:
   - Session status is checked immediately
   - Token refresh occurs if needed
   - Console shows: "👁️ Page became visible, checking session"

### 👥 **Multi-User Type Tests**

#### Test 13: Customer Dashboard
1. **Login** as customer (`role: "user"`)
2. **Run** Tests 1-7 above
3. **Verify** all functionality works

#### Test 14: Admin Dashboard
1. **Login** as admin (`role: "owner-super-administrator"`)
2. **Navigate** to `/admin` routes
3. **Run** Tests 1-7 above
4. **Verify** `adminToken` cookies are used

#### Test 15: Other User Types
Repeat Tests 1-7 for each user type:
- **Tailor** (`role: "fashion-designer"`)
- **Fabric** (`role: "fabric-vendor"`)
- **Logistics** (`role: "logistics-agent"`)
- **Sales** (`role: "market-representative"`)

### 🔒 **Security Tests**

#### Test 16: Invalid Refresh Token
1. **Login** successfully
2. **Manually edit** refresh token cookie to invalid value
3. **Trigger** token refresh
4. **Verify**:
   - Refresh fails gracefully
   - Session expiry modal appears
   - User is logged out securely

#### Test 17: Expired Refresh Token
1. **Login** successfully
2. **Set** refresh token expiry to past date in cookies
3. **Wait** for next session check
4. **Verify**:
   - Session marked as expired
   - Auto logout occurs
   - No infinite refresh loops

## 🛠️ **Advanced Testing**

### Using the Test Suite
Run comprehensive automated tests:

```javascript
// Run full test suite
const results = await sessionTester.runTestSuite();
console.log("Test Results:", results);
```

### Custom Test Scenarios

#### Simulate Network Issues
```javascript
// In Network tab, set to "Offline"
// Then try token refresh
sessionTester.testTokenRefresh()
```

#### Test Rapid Token Expiry
```javascript
// Expire token in 30 seconds
sessionTester.simulateTokenExpiry(0.5)
```

#### Monitor Session Over Time
```javascript
// Monitor for 60 seconds
sessionTester.testStatusMonitoring(60)
```

## 🐛 **Expected Behaviors**

### ✅ **Success Indicators**
- **Green Status**: Session shows "active"
- **Smooth Refresh**: Token refresh happens without user notice
- **Timely Warnings**: Modal appears 5 minutes before expiry
- **Clean Logout**: All data cleared on session end
- **Cross-Tab Sync**: Logout syncs across tabs

### ❌ **Failure Indicators**
- **Stuck Sessions**: Session doesn't expire when it should
- **Missing Modals**: No warning before expiry
- **Failed Refresh**: Token refresh doesn't work
- **Inconsistent State**: Different behavior across user types
- **Memory Leaks**: Intervals not cleaned up

## 📊 **Debug Information**

### Console Log Patterns
Look for these log messages:

```
🔐 Session Manager: Auth data stored
⏰ Session Manager: Token refresh interval started
👁️ Session Manager: Session monitoring started
🔄 Session Manager: Refreshing access token
✅ Session Manager: Token refreshed successfully
⚠️ useSessionManager: Showing session warning
❌ Session Manager: Session expired
```

### Common Issues and Solutions

#### Issue: Modal doesn't appear
- **Check**: Console for errors
- **Verify**: Modal is imported in layout
- **Test**: `useSessionManager` hook is called

#### Issue: Token refresh fails
- **Check**: Refresh token exists in cookies
- **Verify**: API endpoint `/auth/refresh-token` works
- **Test**: Network requests in DevTools

#### Issue: Cross-tab logout doesn't work
- **Check**: `localStorage.setItem("logout", ...)` is called
- **Verify**: `useCrossTabLogout` hook is active
- **Test**: LocalStorage changes in DevTools

## 🎯 **Performance Testing**

### Memory Usage
1. **Open** Performance tab in DevTools
2. **Run** session for 1+ hours
3. **Monitor** memory usage for leaks

### Network Requests
1. **Open** Network tab
2. **Monitor** token refresh requests
3. **Verify** proper request intervals (10 minutes)

### Battery Impact
1. **Test** on mobile device
2. **Monitor** battery usage during long sessions
3. **Verify** reasonable resource consumption

## 📈 **Production Testing**

### Pre-Deployment Checklist
- [ ] All manual tests pass
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile device testing
- [ ] Network conditions testing (slow, offline)
- [ ] Load testing with multiple users
- [ ] Session duration testing (24+ hours)

### Monitoring in Production
1. **Set up** error tracking for session-related errors
2. **Monitor** token refresh success rates
3. **Track** session expiry modal appearance rates
4. **Analyze** user logout patterns

## 🔧 **Troubleshooting Guide**

### Quick Fixes
```javascript
// Reset session completely
sessionManager.clearAuthData();
sessionManager.destroy();
location.reload();

// Check session status
console.log("Status:", sessionManager.getSessionStatus());

// Force token refresh
sessionManager.forceRefresh().then(console.log);
```

### Environment Variables
Ensure these are set correctly:
- `VITE_APP_CaryBin_API_URL` - Backend API URL

### API Requirements
Verify backend endpoints work:
- `POST /auth/login` - Returns `accessToken`, `refreshToken`, `refreshTokenExpiry`
- `POST /auth/refresh-token` - Accepts `refresh_token`, returns new `accessToken`

## 📚 **Testing Best Practices**

1. **Test Early**: Start testing during development
2. **Test Often**: Regular testing prevents regression
3. **Test Realistically**: Use real user scenarios
4. **Test Edge Cases**: Network issues, rapid actions, etc.
5. **Document Issues**: Keep track of bugs and fixes
6. **Automate When Possible**: Use test suite for repetitive tests

## 🎉 **Success Criteria**

The session management system is working correctly when:

- ✅ Users can login and maintain sessions seamlessly
- ✅ Token refresh happens automatically every 10 minutes
- ✅ Session warnings appear 5 minutes before expiry
- ✅ Users can extend sessions through the modal
- ✅ Automatic logout occurs when sessions expire
- ✅ Cross-tab logout synchronization works
- ✅ All user types (customer, admin, tailor, etc.) work consistently
- ✅ API requests auto-retry with refreshed tokens
- ✅ No memory leaks or performance issues
- ✅ Graceful handling of network issues and errors

---

*For additional help or questions, check the browser console logs or contact the development team.*