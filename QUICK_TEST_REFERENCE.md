# 🧪 Quick Session Testing Reference

## 🚀 Instant Testing Commands

### Browser Console (Open DevTools → Console)
```javascript
// Check current session status
sessionTester.getSessionTestData()

// Test token refresh right now
sessionTester.testTokenRefresh()

// Expire token in 1 minute (test warning modal)
sessionTester.simulateTokenExpiry(1)

// Expire token immediately (test logout)
sessionTester.simulateImmediateExpiry()

// Show floating test dashboard
sessionTester.createTestDashboard()

// Run all tests
sessionTester.runTestSuite()
```

## 🎯 Quick Visual Tests

### 1. **Login Test** (2 minutes)
1. Login to any dashboard
2. Look for purple gear icon (bottom-right) 
3. Click it → Session Test Panel opens
4. Check: Status = "active", tokens = ✅

### 2. **Token Refresh Test** (30 seconds)
1. Open test panel
2. Click "Test Token Refresh"
3. Check: Success alert appears

### 3. **Session Warning Test** (1 minute)
1. Open test panel  
2. Click "Expire in 1min"
3. Wait for modal with countdown
4. Check: Modal appears, countdown works

### 4. **Immediate Logout Test** (10 seconds)
1. Open test panel
2. Click "Expire Immediately"  
3. Check: Redirected to login page

## 🔍 What to Look For

### ✅ **Success Signs**
- Session status shows "active"
- Token refresh returns success
- Warning modal appears before expiry
- Smooth logout when expired
- No console errors

### ❌ **Problem Signs**
- Status shows "expired" when logged in
- Token refresh fails
- No warning modal before expiry
- App crashes or freezes
- Console shows red errors

## 📱 Mobile Testing
Same tests work on mobile - just open browser DevTools on mobile or use remote debugging.

## 🛠️ Troubleshooting

### If nothing works:
```javascript
// Reset everything
sessionManager.clearAuthData()
location.reload()
```

### If modal doesn't appear:
- Check if you're in development mode
- Look for SessionTestPanel component
- Verify you're logged in first

### If console commands don't work:
- Refresh the page
- Make sure you're on a dashboard page (not login)
- Type `window.sessionTester` to check if available

## ⏱️ Expected Timing
- **Token Refresh**: Every 10 minutes automatically
- **Session Warning**: 5 minutes before expiry  
- **Auto Logout**: When countdown reaches 0:00
- **API Retry**: Immediate on 401 errors

## 🎉 Quick Success Check
Run this one command to verify everything works:
```javascript
sessionTester.runTestSuite().then(console.log)
```
If it completes without errors, your session management is working! 🚀

---
*Need more details? Check SESSION_TESTING_GUIDE.md*