# Tawk.to Live Chat Setup Guide

## Overview
This guide will help you set up Tawk.to live chat for non-authenticated users on the AO-Style platform. The system intelligently routes between internal chat (for logged-in users) and Tawk.to live chat (for guests).

## 🚀 Quick Setup

### Step 1: Create Tawk.to Account
1. Go to [https://www.tawk.to](https://www.tawk.to)
2. Sign up for a free account or log into your existing account
3. Complete the account verification process

### Step 2: Get Your Property ID
1. Login to your Tawk.to dashboard
2. Navigate to **Admin Panel** → **Property Settings**
3. Copy your **Property ID** (format: `1a2b3c4d5e6f7g8h9i0j`)
4. Optional: Copy your **Widget ID** from **Chat Widget** settings

### Step 3: Configure Environment Variables
1. Copy `.env.example` to `.env` in your project root:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Tawk.to credentials:
   ```env
   # Required: Your Tawk.to Property ID
   REACT_APP_TAWKTO_PROPERTY_ID=your_actual_property_id_here
   
   # Optional: Your Widget ID (defaults to 'default')
   REACT_APP_TAWKTO_WIDGET_ID=your_widget_id_here
   
   # Feature flag to enable/disable live chat
   REACT_APP_ENABLE_LIVE_CHAT=true
   ```

### Step 4: Restart Development Server
```bash
npm start
# or
yarn start
```

## 🎯 How It Works

### Authentication-Based Routing
- **Logged-in users**: See internal chat system (`ChatHead` component)
- **Guest users**: See Tawk.to live chat widget
- **Automatic switching**: When users log in/out, chat system switches automatically

### Smart Initialization
- Tawk.to only loads for non-authenticated users
- Browser compatibility checking
- Location-based user context
- Device type detection
- Page context tracking

## 🎨 Customization

### Widget Appearance
Edit `/src/services/tawkto.js` to customize the widget:

```javascript
const config = {
  customStyle: {
    zIndex: 1000,
    visibility: {
      desktop: {
        position: 'br', // bottom-right
        xOffset: '20px',
        yOffset: '20px'
      },
      mobile: {
        position: 'br',
        xOffset: '10px', 
        yOffset: '20px'
      }
    }
  }
};
```

### Button Styling
Modify `/src/components/LiveChatManager.jsx`:

```jsx
// Change button colors
className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"

// Change button size
className="p-4" // Current size
className="p-3" // Smaller
className="p-5" // Larger
```

### Status Colors
```javascript
// In getStatusColor() function
case 'online': return 'bg-green-500';   // Agents available
case 'away': return 'bg-yellow-500';    // Agents away
case 'offline': return 'bg-red-500';    // Agents offline
```

## 🔧 Advanced Configuration

### Custom Visitor Information
```javascript
// In LiveChatManager.jsx
const visitorInfo = {
  name: 'Guest User',
  email: '',
  ...locationInfo,
  // Add custom fields
  plan: 'Free',
  source: 'Website',
  page_category: getPageCategory(),
  user_journey_stage: 'browsing'
};
```

### Event Tracking
```javascript
// Track custom events
tawkToService.sendEvent('product_viewed', {
  product_id: 'abc123',
  category: 'fabrics',
  timestamp: new Date().toISOString()
});
```

### Custom Tags
```javascript
// Add contextual tags
const tags = [
  'website-visitor',
  'guest-user', 
  'mobile-user',        // or 'desktop-user'
  'first-time-visitor', // or 'returning-visitor'
  'fabric-category',    // based on current page
  'high-intent'         // based on behavior
];

tawkToService.addTags(tags);
```

## 📱 Mobile Optimization

### Responsive Design
The widget automatically adapts to mobile devices:
- Smaller button size on mobile
- Touch-optimized interactions
- Mobile banner when chat is active
- Optimized positioning

### Performance
- Lazy loading for non-authenticated users only
- Minimal impact on page load speed
- Efficient memory usage
- Cleanup on user authentication

## 🔍 Monitoring & Analytics

### Built-in Events
The system automatically tracks:
- `chat_widget_opened` - When user opens chat
- `chat_maximized` - When chat window is maximized
- `chat_minimized` - When chat window is minimized
- `chat_started` - When conversation begins
- `chat_ended` - When conversation ends
- `prechat_submitted` - When pre-chat form is filled
- `offline_form_submitted` - When offline message is sent

### Google Analytics Integration
```javascript
// Automatic GA tracking (if gtag is available)
gtag('event', 'live_chat_displayed', {
  'event_category': 'engagement',
  'event_label': 'guest_user',
  'custom_parameter_1': tawkToStatus
});
```

### Custom Analytics
```javascript
// Add your analytics tracking
tawkToService.onChatStarted = () => {
  // Your custom analytics code
  analytics.track('Live Chat Started', {
    user_type: 'guest',
    page: window.location.pathname
  });
};
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Widget Not Appearing
- **Check Property ID**: Verify `REACT_APP_TAWKTO_PROPERTY_ID` in `.env`
- **Check Authentication**: Widget only shows for non-logged-in users
- **Browser Console**: Look for error messages in developer tools
- **Network**: Ensure Tawk.to scripts can load (check firewall/ad blockers)

#### 2. Widget Showing for Logged-in Users
- **Clear Cache**: Clear browser cache and cookies
- **Check Store**: Verify `useCarybinUserStore` is updating correctly
- **Token Check**: Ensure token checking logic in `LiveChatManager.jsx`

#### 3. Styling Issues
- **Z-index Conflicts**: Adjust `zIndex` in Tawk.to config
- **Mobile Display**: Test on actual mobile devices
- **CSS Conflicts**: Check for conflicting CSS rules

#### 4. Performance Issues
- **Script Loading**: Check network tab for slow script loading
- **Memory Leaks**: Ensure proper cleanup on component unmount
- **Multiple Instances**: Verify only one instance is created

### Debug Mode
Enable debug logging:

```javascript
// In tawkto.js
console.log('🐛 Debug: Tawk.to Service', {
  isInitialized: this.isInitialized,
  isVisible: this.isVisible,
  status: this.getStatus()
});
```

### Environment-Specific Issues

#### Development
- Hot reloading may cause multiple initializations
- Use `React.StrictMode` carefully (may cause double effects)

#### Production
- Ensure environment variables are set correctly
- Check CSP (Content Security Policy) settings
- Verify HTTPS requirements

## 🔒 Security & Privacy

### Data Collection
Tawk.to automatically collects:
- IP address and location
- Browser information
- Page URLs visited
- Chat transcripts

### Privacy Compliance
- Add privacy notice about live chat data collection
- Implement GDPR compliance if needed
- Configure data retention policies in Tawk.to dashboard

### Security Best Practices
- Use HTTPS only
- Enable secure mode: `secure: true`
- Regular security audits
- Monitor for suspicious chat activity

## 🚀 Deployment

### Environment Variables
Ensure these are set in your hosting platform:
```bash
REACT_APP_TAWKTO_PROPERTY_ID=your_property_id
REACT_APP_TAWKTO_WIDGET_ID=your_widget_id
REACT_APP_ENABLE_LIVE_CHAT=true
```

### Build Process
The live chat system will be included in your production build automatically.

### CDN & Caching
- Tawk.to scripts are served from their CDN
- No additional CDN configuration needed
- Browser caching is handled automatically

## 📊 Analytics & Reporting

### Tawk.to Dashboard
Access detailed analytics in your Tawk.to dashboard:
- Conversation metrics
- Response times
- Agent performance
- Visitor insights

### Custom Reporting
Implement custom reporting by listening to events:

```javascript
// Track business metrics
let chatMetrics = {
  totalChats: 0,
  averageResponseTime: 0,
  customerSatisfaction: 0
};

tawkToService.onChatEnded = (data) => {
  chatMetrics.totalChats++;
  // Send to your analytics platform
};
```

## 🎨 UI/UX Best Practices

### Button Placement
- Bottom-right corner (default)
- Ensure it doesn't overlap important content
- Test on various screen sizes

### Status Indicators
- Green dot: Agents online
- Yellow dot: Agents away
- Red dot: Agents offline
- Animated pulse for online status

### User Feedback
- Clear status messages
- Response time expectations
- Professional appearance
- Consistent with brand colors

## 🔄 Testing

### Manual Testing Checklist
- [ ] Widget appears for non-logged-in users
- [ ] Widget hidden for logged-in users
- [ ] Button click opens/closes chat
- [ ] Status indicators work correctly
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility
- [ ] Performance impact minimal

### Automated Testing
```javascript
// Example test cases
describe('LiveChatManager', () => {
  it('should show Tawk.to for guest users', () => {
    // Test implementation
  });
  
  it('should show internal chat for logged-in users', () => {
    // Test implementation
  });
  
  it('should handle status changes correctly', () => {
    // Test implementation
  });
});
```

## 📞 Support

### Tawk.to Support
- Documentation: https://help.tawk.to
- Live chat support on their website
- Email: support@tawk.to

### Implementation Support
- Check the implementation documentation
- Review console logs for errors
- Test in incognito/private browsing mode
- Contact development team for custom issues

## 📈 Optimization Tips

### Performance
- Lazy load only when needed
- Minimize initial bundle size
- Use React.memo for optimization
- Implement proper cleanup

### User Experience
- Clear call-to-action
- Intuitive button placement
- Fast response times
- Professional communication

### Conversion
- Proactive chat invitations
- Context-aware messaging
- Follow-up strategies
- Integration with CRM

## 🔮 Future Enhancements

### Planned Features
- [ ] AI chatbot integration
- [ ] Multi-language support
- [ ] Custom chat templates
- [ ] Advanced routing rules
- [ ] Integration with customer database
- [ ] Automated responses
- [ ] Chat history for return visitors

### Integration Opportunities
- CRM systems (HubSpot, Salesforce)
- Analytics platforms (Google Analytics, Mixpanel)
- Email marketing (Mailchimp, SendGrid)
- Help desk systems (Zendesk, Freshdesk)

---

## Quick Reference

### Environment Variables
```env
REACT_APP_TAWKTO_PROPERTY_ID=your_property_id
REACT_APP_TAWKTO_WIDGET_ID=your_widget_id
REACT_APP_ENABLE_LIVE_CHAT=true
```

### Key Files
- `/src/services/tawkto.js` - Core service
- `/src/components/LiveChatManager.jsx` - Main component
- `/src/AppWrapper.jsx` - Integration point
- `/.env` - Configuration

### Important Commands
```bash
# Install dependencies
npm install

# Start development
npm start

# Build for production
npm run build

# Test the implementation
npm test
```

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Status:** ✅ Ready for Production