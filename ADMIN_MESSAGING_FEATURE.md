# Admin Messaging Feature Implementation

## Overview

This document outlines the implementation of the admin messaging feature that allows non-admin users (customers, tailors, fabric vendors, market representatives, and logistics agents) to initiate conversations with admins.

## Features Implemented

### 1. Admin Fetching Hook (`useGetAdmins.jsx`)

**Location**: `src/hooks/messaging/useGetAdmins.jsx`

**Purpose**: Fetches available admins for non-admin users to message

**Key Features**:
- Uses React Query for caching and error handling
- Fetches from `/auth/admins/role` endpoint
- Includes retry logic (excludes 401 errors)
- 5-minute stale time, 10-minute cache time
- Returns admin list and total count

### 2. Enhanced Inbox Pages

**Updated Files**:
- `src/modules/Pages/customerDashboard/components/InboxPage.jsx`
- `src/modules/Pages/fabricDashboard/components/InboxPage.jsx`
- `src/modules/Pages/tailorDashboard/components/InboxPage.jsx`
- `src/modules/Pages/salesDashboard/components/InboxPage.jsx`
- `src/modules/Pages/logisticsDashboard/components/InboxPage.jsx`

**New Features**:
- **"New Message" Button**: Added to sidebar header with plus icon
- **Admin Selection Modal**: Modal popup for selecting admin and composing message
- **Admin Dropdown**: Lists all available admins with name and email
- **Message Composition**: Text area for typing messages to admins
- **Real-time Integration**: Automatically refreshes chat list after sending message

**UI Components**:
```jsx
// New Message Button
<button
  onClick={() => setShowNewMessageModal(true)}
  className="text-white hover:text-gray-200 transition-colors p-1.5 bg-purple-600 rounded-full"
  title="New Message"
>
  <FaPlus size={14} />
</button>

// Admin Selection Modal
{showNewMessageModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    {/* Modal content with admin selection and message input */}
  </div>
)}
```

### 3. Enhanced ChatHead Component

**Location**: `src/components/chat/ChatHead.jsx`

**New Features**:
- **Conditional UI**: Different interfaces for admin vs non-admin users
- **Admin Messaging**: Non-admin users see "Message Admin" instead of "New Message"
- **Admin Selection**: Scrollable list of admins with selection state
- **Unified Send Logic**: Single send button that handles both admin and non-admin workflows

**Key Changes**:
```jsx
// Conditional button text
{isAdmin ? "New Message" : "Message Admin"}

// Conditional view rendering
{isAdmin ? (
  // Admin view - select user type and user
  <AdminUserSelection />
) : (
  // Non-admin view - select admin to message
  <AdminSelection />
)}

// Conditional send button logic
onClick={isAdmin ? sendNewMessage : handleSendMessageToAdmin}
```

## API Integration

### Endpoints Used

1. **Get Admins**: `GET /auth/admins/role`
   - Used by `useGetAdmins` hook
   - Returns list of available admins

2. **Send Message**: Existing endpoint used by `useSendMessage` hook
   - Accepts `recipient_id` and `message`
   - Works for both admin-to-user and user-to-admin messaging

### Data Flow

1. **Non-admin user clicks "Message Admin"**
2. **System fetches available admins** using `useGetAdmins`
3. **User selects admin and types message**
4. **Message sent** using existing `useSendMessage` hook
5. **Chat list refreshed** via socket to show new conversation
6. **Modal closed** and form reset

## User Experience

### For Non-Admin Users

1. **Access Point**: "Message Admin" button in inbox sidebar header
2. **Admin Selection**: Clean modal with admin list (name + email)
3. **Message Composition**: Simple text area with placeholder
4. **Feedback**: Success/error toasts and loading states
5. **Integration**: New conversation appears in chat list immediately

### For Admin Users

- **No Changes**: Existing functionality preserved
- **Full Access**: Can still message any user type
- **Consistent UI**: Same interface as before

## Technical Implementation Details

### State Management

```jsx
// New states added to inbox components
const [showNewMessageModal, setShowNewMessageModal] = useState(false);
const [selectedAdmin, setSelectedAdmin] = useState("");
const [messageText, setMessageText] = useState("");

// Admin data fetching
const { data: admins, isPending: adminsLoading, isError: adminsError } = useGetAdmins();
```

### Message Sending Logic

```jsx
const handleSendMessageToAdmin = () => {
  if (!selectedAdmin || !messageText.trim()) {
    toastError("Please select an admin and enter a message");
    return;
  }

  const messageData = {
    recipient_id: selectedAdmin,
    message: messageText.trim(),
  };

  sendMessageMutate(messageData, {
    onSuccess: (data) => {
      toastSuccess("Message sent successfully!");
      setShowNewMessageModal(false);
      setSelectedAdmin("");
      setMessageText("");
      
      // Refresh chats
      if (socket && userId) {
        socket.emit("getChats", { userId });
      }
    },
    onError: (error) => {
      toastError(error?.data?.message || "Failed to send message");
    },
  });
};
```

## Error Handling

1. **Loading States**: Shows "Loading admins..." while fetching
2. **Error States**: Shows "Failed to load admins" on API errors
3. **Validation**: Prevents sending without admin selection or message
4. **Network Errors**: Graceful handling with user-friendly messages
5. **Empty States**: Shows "No admins available" if list is empty

## Security Considerations

1. **Authentication**: Uses existing token-based authentication
2. **Authorization**: Only authenticated users can access messaging
3. **Data Validation**: Client-side validation before API calls
4. **Error Exposure**: Minimal error details exposed to users

## Future Enhancements

1. **Admin Availability Status**: Show online/offline status
2. **Message Categories**: Allow users to categorize their messages
3. **File Attachments**: Support for sending files to admins
4. **Admin Routing**: Route messages to specific admin departments
5. **Bulk Messaging**: Allow admins to send announcements

## Testing Checklist

- [ ] Non-admin users can see "Message Admin" button
- [ ] Modal opens and closes properly
- [ ] Admin list loads correctly
- [ ] Admin selection works
- [ ] Message sending succeeds
- [ ] Error handling works
- [ ] Chat list refreshes after sending
- [ ] Socket integration works
- [ ] ChatHead component works for both admin and non-admin
- [ ] All user types (customer, tailor, fabric, sales, logistics) have the feature

## Deployment Notes

1. **Database**: No schema changes required
2. **API**: Uses existing endpoints
3. **Dependencies**: No new dependencies added
4. **Configuration**: No environment variables needed
5. **Backward Compatibility**: Fully backward compatible

## Support

For issues or questions regarding this feature:
1. Check browser console for error logs
2. Verify admin endpoint is accessible
3. Ensure user authentication is working
4. Test socket connection for real-time updates