# Chat Head Implementation - Multi-User Support

## Overview

The Chat Head widget is a floating chat interface that provides real-time messaging capabilities for all user types in the AO-Style platform. It appears on all pages as a purple floating button in the bottom-right corner and supports different functionality based on user roles.

## Supported User Types

### 1. **Admin Users** (`admin`, `super-admin`)
- **Full Functionality**: Can initiate conversations with any user type
- **User Selection**: Can select from Customer, Tailor, Fabric Vendor, Market Rep, and Logistics users
- **Authentication**: Uses `adminToken` from cookies
- **Socket Events**: Admin-specific event listeners (`chatsRetrieved:${adminId}`, `messagesRetrieved:${adminId}`)

### 2. **Tailor Users** (`tailor`)
- **Reply-Only**: Can only respond to admin-initiated conversations
- **Role**: `fashion-designer` in the backend
- **Dashboard**: `/tailor` routes
- **Authentication**: Uses regular `token` from cookies

### 3. **Fabric Vendor Users** (`fabric`)
- **Reply-Only**: Can only respond to admin-initiated conversations
- **Role**: `fabric-vendor` in the backend
- **Dashboard**: `/fabric` routes
- **Authentication**: Uses regular `token` from cookies

### 4. **Logistics Agent Users** (`logistics`)
- **Reply-Only**: Can only respond to admin-initiated conversations
- **Role**: `logistics-agent` in the backend
- **Dashboard**: `/logistics` routes
- **Authentication**: Uses regular `token` from cookies

### 5. **Market Representative Users** (`sales`)
- **Reply-Only**: Can only respond to admin-initiated conversations
- **Role**: `market-representative` in the backend
- **Dashboard**: `/sales` routes
- **Authentication**: Uses regular `token` from cookies

## Technical Implementation

### Authentication Detection
```javascript
const adminToken = Cookies.get("adminToken");
const userToken = Cookies.get("token");
const currentUserUrl = Cookies.get("currUserUrl");
const isAdmin = !!adminToken || currentUserUrl === "admin" || currentUserUrl === "super-admin";
```

### Socket Connection
- **URL**: `https://api-staging.carybin.com/`
- **Authentication**: Uses appropriate token based on user type
- **Events**: User-specific event listeners for real-time updates

### User Profile Management
- **Admin**: Fetches profile via `AuthService.GetUser()` with admin token
- **Other Users**: Uses `useGetUserProfile()` hook with regular token
- **Profile Data**: Required for socket connection and message attribution

## Features

### 1. **Chat List View**
- Shows recent conversations
- Displays unread message counts
- User avatars and last message preview
- Real-time updates for new messages

### 2. **Individual Chat View**
- Real-time messaging interface
- Message history with timestamps
- Sent/received message differentiation
- Auto-scroll to latest messages

### 3. **New Chat Creation (Admin Only)**
- User type selection dropdown
- User search and selection with checkmarks
- Message composition
- Real-time user fetching via API

### 4. **Real-time Features**
- Socket.IO integration
- Live message delivery
- Unread count badges
- Connection status indicator

## UI/UX Features

### Design Elements
- **Floating Button**: Purple circular button with message icon
- **Unread Badge**: Red notification badge showing unread count
- **Minimizable Window**: Can be collapsed to header only
- **Responsive Design**: Works on desktop and mobile devices

### User Experience
- **Checkmarks**: Visual indication when users are selected
- **Scrollable Lists**: Proper overflow handling for user lists
- **Input Integration**: Send button positioned inside input field
- **Grey Borders**: Soft border styling throughout the interface

### Chat Window Layout
- **Header**: Shows current view and user type
- **Body**: Dynamic content based on current view (chats/new chat/individual chat)
- **Input Area**: Message composition with integrated send button

## API Integration

### Endpoints Used
- `GET /auth/users/{role}` - Fetch users by role (admin only)
- `POST /auth/login` - Authentication
- `GET /auth/user` - Get user profile

### Socket Events

#### Emitted Events
- `retrieveChats` - Fetch user's chat list
- `retrieveMessages` - Fetch messages for specific chat
- `sendMessage` - Send new message

#### Listened Events
- `chatsRetrieved` / `chatsRetrieved:${userId}` - Chat list updates
- `messagesRetrieved` / `messagesRetrieved:${userId}` - Message list updates
- `messageSent:${userId}` - Message delivery confirmation
- `messageReceived` - New incoming messages

## Security & Permissions

### Role-Based Access Control
- **Admins**: Full access to initiate conversations with any user type
- **Other Users**: Can only reply to admin-initiated conversations
- **Authentication**: Token-based authentication with role validation

### User Type Validation
```javascript
if (!currentUserUrl || !["admin", "super-admin", "tailor", "fabric", "logistics", "sales"].includes(currentUserUrl)) {
  return null; // Don't render chat head
}
```

## Integration Points

### Global Availability
- Integrated into `AppWrapper.jsx` for global presence
- Appears on all authenticated pages
- Conditional rendering based on user authentication and type

### State Management
- Uses React hooks for local state management
- Real-time updates via Socket.IO
- Profile data integration with existing authentication system

### Error Handling
- Toast notifications for success/error states
- Connection status monitoring
- Graceful fallbacks for network issues

## Performance Considerations

### Optimization Features
- Lazy loading of user lists
- Pagination support for large user lists
- Efficient socket event management
- Memory cleanup on component unmount

### Resource Management
- Socket connection reuse
- Event listener cleanup
- Conditional rendering to prevent unnecessary renders

## Browser Compatibility

### Requirements
- Modern browsers supporting WebSocket
- Cookie support for authentication
- ES6+ JavaScript features

### Fallbacks
- Polling transport fallback for WebSocket
- Toast notifications for user feedback
- Graceful degradation for unsupported features

## Testing Scenarios

### Admin Testing
1. Login as admin
2. Verify chat head appears on all pages
3. Test new conversation creation with different user types
4. Verify real-time messaging functionality
5. Test unread count updates

### User Type Testing
1. Login as tailor/fabric/logistics/sales user
2. Verify chat head appears only after admin contact
3. Test reply functionality to admin messages
4. Verify cannot initiate new conversations
5. Test real-time message reception

### Edge Cases
1. Network disconnection/reconnection
2. Token expiration handling
3. Profile loading failures
4. Empty chat states
5. Large message histories

## Troubleshooting

### Common Issues
1. **Chat head not appearing**: Check authentication tokens and user type
2. **Socket connection failed**: Verify network connectivity and token validity
3. **Messages not sending**: Check user permissions and socket connection
4. **Profile loading errors**: Verify API endpoints and authentication

### Debug Information
- Console logging for socket events
- Connection status indicators
- Error toast notifications
- Network request monitoring

## Future Enhancements

### Planned Features
- File attachment support
- Message reactions and replies
- Typing indicators
- Message search functionality
- Conversation archiving

### Scalability Considerations
- Message pagination for large conversations
- User search and filtering
- Bulk message operations
- Advanced notification settings