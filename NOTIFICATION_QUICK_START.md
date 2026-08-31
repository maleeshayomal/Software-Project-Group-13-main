# Notification System - Quick Start Guide

## Files Created/Modified

### New Files
- ✅ `frontend/src/components/Notification.jsx` - Complete notification system component (850+ lines)

### Modified Files
- ✅ `frontend/src/App.jsx` - Added NotificationProvider wrapper
- ✅ `frontend/src/components/Navbar.jsx` - Added NotificationCenter display
- ✅ `backend/server.js` - Added 13 notification API endpoints (400+ lines)

---

## What's Implemented

### ✅ **Requirement 1: Cancellation Alerts (Within 10 Seconds)**
**Status**: COMPLETE
- Implemented in `handleCancellationAlert()` function
- Uses `sendNotificationWithinDeadline()` with 10-second deadline
- Checks subscription preferences before sending
- Prioritizes waitlist users

**Code Location**: `Notification.jsx` lines 144-194

---

### ✅ **Requirement 2: Subscription Management**
**Status**: COMPLETE
- Allow subscribe/unsubscribe to specific:
  - **Courts** (Badminton Court 1, Badminton Court 2)
  - **Time slots** (Morning, Afternoon, Evening)
  - **Days of week** (Monday-Sunday)
- Implemented in `NotificationPreferences` component
- Persistent storage in `notification_subscriptions` table
- Real-time UI updates

**Code Location**: `Notification.jsx` lines 620-750

---

### ✅ **Requirement 3: Booking Confirmation Notifications**
**Status**: COMPLETE
- Triggered immediately upon successful booking
- Implemented in `handleBookingConfirmation()` function
- Contains court name, date, and time slot
- Auto-logged to delivery log

**Code Location**: `Notification.jsx` lines 240-270

---

### ✅ **Requirement 4: Reminder Notifications (2 Hours Before)**
**Status**: COMPLETE
- Automatically scheduled 2 hours before booking
- Implemented in `handleReminderNotification()` function
- Uses timer-based delivery
- Prevents duplicate reminders with timer tracking

**Code Location**: `Notification.jsx` lines 273-330

---

### ✅ **Requirement 5: Notification Delivery Log**
**Status**: COMPLETE
- Maintains permanent record of all notifications
- Tracks:
  - Recipient
  - Channel (SYSTEM)
  - Timestamp
  - Delivery status
- Database: `notification_delivery_log` table
- Indexed for fast queries (recipient + timestamp)

**Code Location**: `Notification.jsx` lines 367-378 and Backend API

---

### ✅ **Requirement 6: Rate Limiting (10 Alerts/Hour Max)**
**Status**: COMPLETE
- Cancellation alert rate limiting
- Tracks alerts per user per hour
- Implemented in `handleCancellationAlert()` with:
  - `cancellationAlertCounterRef` for in-memory tracking
  - Backend endpoint for verification
  - Automatic hourly reset
- Returns 429 error if limit exceeded

**Code Location**: `Notification.jsx` lines 144-164 and Backend API endpoint

---

### ✅ **Requirement 7: Waitlist Prioritization**
**Status**: COMPLETE
- Waitlist users notified first for cancellations
- Implemented in `checkIfUserIsWaitlisted()` function
- Sets priority flag in notification object
- Database: `court_waitlist` table
- Backend endpoints for add/remove/list

**Code Location**: `Notification.jsx` lines 187-196 and Backend API

---

## Starting the System

### Step 1: Ensure Backend is Running
```powershell
cd backend
npm install  # Install dependencies if needed
node server.js
# Output should show: "Server running on port 5000"
```

### Step 2: Ensure Frontend is Running
```powershell
cd frontend
npm install  # Install dependencies if needed
npm run dev
# Vite server will start on http://localhost:5173
```

### Step 3: User Logs In
- The NotificationProvider needs a userId to initialize
- User must log in through LoginModal
- NotificationCenter bell icon appears in Navbar when logged in

### Step 4: Access Notification Features
1. **View Notifications**: Click the bell icon in navbar
2. **Manage Preferences**: Click settings icon in notification panel
3. **Subscribe to Alerts**: Select court type, time slot, day of week
4. **See Delivery Log**: Backend has `/api/notifications/log/:userId`

---

## Quick API Testing

### Test 1: Send Booking Confirmation
```bash
curl -X POST http://localhost:5000/api/notifications/booking-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "bookingId": 123,
    "bookingDetails": {
      "courtName": "Court A",
      "bookingDate": "2024-12-25",
      "timeSlot": "10:00 AM"
    }
  }'
```

### Test 2: Subscribe to Alerts
```bash
curl -X POST http://localhost:5000/api/notifications/subscribe/1 \
  -H "Content-Type: application/json" \
  -d '{
    "courtType": "badminton",
    "timeSlot": "evening",
    "dayOfWeek": 5
  }'
# Available court types: "badminton" (Court 1) or "badminton-2" (Court 2)
```

### Test 3: Send Cancellation Alert
```bash
curl -X POST http://localhost:5000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CANCELLATION_ALERT",
    "recipientId": 1,
    "message": "Badminton Court 1 is now available at 6:00 PM",
    "data": {
      "courtNumber": "Badminton Court 1",
      "timeSlot": "6:00 PM",
      "date": "2024-12-25"
    }
  }'
```

### Test 4: Check Rate Limit
```bash
curl http://localhost:5000/api/notifications/rate-limit/check/1
```

---

## Key Component Exports

### NotificationProvider
Wraps your app to enable all notification features.
```javascript
<NotificationProvider userId={user?.id || null}>
  {/* Your app */}
</NotificationProvider>
```

### useNotification Hook
Use in any component to access notification functions.
```javascript
const { 
  notifications,
  subscribe,
  unsubscribe,
  markAsRead,
  deleteNotification,
  getUnreadCount
} = useNotification();
```

### NotificationCenter
Display component with bell icon and dropdown.
```javascript
<NotificationCenter />
```

---

## Database Tables

All tables are auto-created on first run. Check with:

```sql
-- Check subscriptions
SELECT * FROM notification_subscriptions WHERE user_id = 1;

-- Check delivery log
SELECT * FROM notification_delivery_log WHERE recipient_id = 1 ORDER BY timestamp DESC;

-- Check waitlist
SELECT * FROM court_waitlist WHERE user_id = 1;
```

---

## Configuration & Customization

### Change Server Port
Edit `backend/server.js`:
```javascript
const PORT = 5000; // Change this
```

Then update URLs in `Notification.jsx`:
```javascript
`http://localhost:5000/api/notifications/send` // Update this
`ws://localhost:8080?userId=${userId}` // Update this
```

### Change Rate Limit
In `backend/server.js`, find:
```javascript
const maxAllowed = 10; // Change this
```

### Change Reminder Time
In `Notification.jsx`, find:
```javascript
const twoHoursInMs = 2 * 60 * 60 * 1000; // Change this
```

### Change Cancellation Alert Deadline
In `Notification.jsx`, find:
```javascript
await sendNotificationWithinDeadline(notificationWithPriority, 10000); // Change 10000 (ms)
```

---

## Notification Display Customization

The bell icon colors in the notification panel:
- 🟡 **Yellow**: Cancellation Alert
- 🟢 **Green**: Booking Confirmation
- 🔵 **Blue**: Reminder
- ⚪ **Gray**: Other

To change colors, edit `getNotificationColor()` function in `Notification.jsx`:
```javascript
case 'CANCELLATION_ALERT':
  return 'bg-yellow-50 border-l-4 border-yellow-400'; // Change these
```

---

## Integration with Court Booking

To trigger notifications when booking is created:

```javascript
// In CourtBookingPage.jsx or similar
const handleBookingSuccess = async (bookingDetails) => {
  // ... create booking on backend ...
  
  // Backend will automatically send confirmation
  // (if integrated with booking creation endpoint)
  
  // Or manually trigger:
  const { addNotification } = useNotification();
  addNotification({
    type: 'BOOKING_CONFIRMATION',
    title: 'Booking Confirmed!',
    message: `Your booking for ${bookingDetails.courtName} is confirmed`,
    data: bookingDetails
  });
};
```

---

## Monitoring & Debugging

### Frontend Console
```javascript
// Enable detailed logging
localStorage.setItem('notificationDebug', 'true');
```

### Backend Logs
```bash
# Watch backend logs
node server.js  # Shows all API calls and errors
```

### Browser DevTools
1. Open Network tab
2. Look for `/api/notifications/*` requests
3. Check response status and payload

### Test WebSocket Connection
```javascript
// In browser console
const ws = new WebSocket('ws://localhost:8080?userId=1');
ws.onopen = () => console.log('Connected');
ws.onerror = (e) => console.error('Error:', e);
ws.onmessage = (e) => console.log('Message:', JSON.parse(e.data));
```

---

## Troubleshooting

### Bell Icon Not Showing
- ❌ Problem: User not logged in
- ✅ Solution: Log in first

### No Notifications Appearing
- ❌ Problem: Backend not running
- ✅ Solution: Verify `node server.js` is running on port 5000

### Rate Limit Not Working
- ❌ Problem: Counter not tracking
- ✅ Solution: Clear browser storage and refresh

### WebSocket Connection Failed
- ❌ Problem: ws server not running
- ✅ Solution: Frontend will fallback to polling (5-second intervals)

### Subscriptions Not Saving
- ❌ Problem: Database table doesn't exist
- ✅ Solution: Backend auto-creates tables on first run

---

## Performance Tips

1. **Limit Notification History**: Set reasonable limits in API queries
   ```javascript
   GET /api/notifications/log/:userId?limit=50
   ```

2. **Cleanup Old Logs**: Periodic maintenance query
   ```sql
   DELETE FROM notification_delivery_log 
   WHERE timestamp < DATE_SUB(NOW(), INTERVAL 30 DAY);
   ```

3. **Index Optimization**: Already implemented
   - Index on `recipient_id` and `timestamp`
   - Unique constraint on waitlist entries

4. **Batch Notifications**: Use `recipients` array instead of individual sends
   ```javascript
   POST /api/notifications/send
   Body: {
     type: "CANCELLATION_ALERT",
     recipients: [1, 2, 3, 4, 5],  // Bulk send
     message: "..."
   }
   ```

---

## Next Steps

1. ✅ Test each notification type individually
2. ✅ Integrate with court booking flow
3. ✅ Integrate with cancellation flow
4. ✅ Test rate limiting
5. ✅ Test subscription preferences
6. ✅ Deploy to production
7. ✅ Monitor notification delivery logs

---

## Support Contacts

For implementation help, check:
- **API Details**: `NOTIFICATION_SYSTEM_GUIDE.md`
- **Component Code**: `src/components/Notification.jsx`
- **Backend Endpoints**: `backend/server.js` (lines 427-668)
