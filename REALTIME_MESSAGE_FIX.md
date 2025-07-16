# Real-time Message Updates Fix

## Issue Fixed:
When users had chat windows open on two devices, new messages would update the recent chat list but would not automatically refresh the messages in the currently open chat. Users had to manually click the chat again to see new messages.

## Root Cause:
The `recentChatRetrieved` and `recentChatRetrieved:${userId}` event handlers were only updating the chat list but not checking if the updated chat was currently selected and needed a message refresh.

## Solution Applied:
Added auto-refresh logic to both `recentChatRetrieved` event handlers in all dashboard InboxPage components.

### Before:
```javascript
socketInstance.on("recentChatRetrieved", (data) => {
  // Only update chat list
  setChats((prevChats) => { ... });
});
```

### After:
```javascript
socketInstance.on("recentChatRetrieved", (data) => {
  const currentSelectedChat = selectedChatRef.current;
  
  // Update chat list
  setChats((prevChats) => { ... });

  // Auto-refresh messages if this chat is currently selected
  if (currentSelectedChat && currentSelectedChat.id === data.data.id) {
    console.log("🔄 Auto-refreshing messages for currently selected chat");
    socketInstance.emit("retrieveMessages", {
      token: userToken,
      chatBuddy: currentSelectedChat.chat_buddy.id,
    });
  }
});
```

## Fixed Components:
- ✅ **Admin Dashboard**: Uses `getMessages` with `adminId` and `chatId`
- ✅ **Customer Dashboard**: Uses `retrieveMessages` with `token` and `chatBuddy`
- ✅ **Tailor Dashboard**: Uses `retrieveMessages` with `token` and `chatBuddy`
- ✅ **Fabric Dashboard**: Uses `retrieveMessages` with `token` and `chatBuddy`
- ✅ **Logistics Dashboard**: Uses `retrieveMessages` with `token` and `chatBuddy`
- ✅ **Sales Dashboard**: Uses `retrieveMessages` with `token` and `chatBuddy`

## Key Changes:
1. **Added `selectedChatRef.current` check** to get the currently selected chat
2. **Added conditional auto-refresh** when the updated chat matches the selected chat
3. **Used consistent socket event names** across similar dashboard types
4. **Added debug logging** to track auto-refresh triggers

## Expected Behavior Now:
When a new message arrives:
1. The `recentChatRetrieved` event updates the chat list with the latest message
2. The system checks if the updated chat is currently selected
3. If yes, it automatically emits a `retrieveMessages`/`getMessages` event to refresh the message list
4. The user sees the new message immediately without needing to click the chat again

This ensures real-time message updates work seamlessly across all devices and user types.
