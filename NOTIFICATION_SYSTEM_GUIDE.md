# Notification System Implementation Guide

## Overview
A comprehensive real-time notification system for the Yamundra Badminton Academy application with support for booking confirmations, cancellation alerts, reminders, and user subscription management.

---

## Features Implemented

### 1. **Real-time Notifications (WebSocket)**
- WebSocket connection for instant notification delivery
- Automatic fallback to polling if WebSocket is unavailable
- Auto-reconnection after connection loss (3-second retry)

**Location**: Frontend - `src/components/Notification.jsx` (useEffect hook)
**Backend**: Ready to integrate with Node.js `ws` library

### 2. **Booking Confirmation Notifications**
- **Timing**: Sent immediately upon successful booking
- **Content**: 
  - Confirmation message
  - Court name
  - Date and time slot
  - Booking ID
- **Delivery**: Synchronous (instant)

**Implementation**:
```javascript
POST /api/notifications/booking-confirmation
Body: { userId, bookingId, bookingDetails }
```

### 3. **Court Cancellation Alerts**
- **Timing**: Within 10 seconds of cancellation event
- **Content**:
  - Court number
  - Freed time slot
  - Date
  - Booking details
- **Priority**: Waitlist users notified first before general subscribers
- **Rate Limiting**: Maximum 10 cancellation alerts per user per hour

**Implementation**:
```javascript
handleCancellationAlert(notification) {
  // Checks rate limit
  // Verifies user subscription
  // Prioritizes waitlist users
  // Sends within 10-second deadline
}
```

### 4. **Reminder Notifications**
- **Timing**: 2 hours before confirmed booking start time
- **Content**:
  - Court name
  - Time slot
  - Booking details
- **Delivery**: Scheduled timer-based delivery

**Implementation**:
```javascript
POST /api/notifications/reminder
Body: { 
  userId, 
  bookingId, 
  bookingStartTime, 
  bookingDetails 
}
```

### 5. **Notification Delivery Log**
- **Tracks**: Recipient, channel, timestamp, delivery status
- **Retention**: All notifications logged permanently
- **Queryable**: By recipient, type, timestamp
- **Database**: `notification_delivery_log` table

**Endpoints**:
```javascript
GET /api/notifications/log/:userId
GET /api/notifications/log/:userId?type=BOOKING_CONFIRMATION&limit=50
```

### 6. **Rate Limiting**
- **Type**: Cancellation alert flood prevention
- **Limit**: Maximum 10 cancellation alerts per user per hour
- **Tracking**: Real-time counter with automatic hour-based reset
- **Check**: Before sending each cancellation alert

**Implementation**:
```javascript
// In frontend
cancellationAlertCounterRef.current[userId] = []
// Tracks timestamps of last hour

// Endpoint
GET /api/notifications/rate-limit/check/:userId
Response: {
  alertsInLastHour: 5,
  maxAllowed: 10,
  rateLimitExceeded: false,
  remainingAlerts: 5
}
```

### 7. **Subscription Management**
- **Customizable Alerts** by:
  - Court (Badminton Court 1 or Court 2, or All Courts)
  - Time slot (Morning, Afternoon, Evening)
  - Day of week (Monday-Sunday)
- **User-controlled**: Subscribe/unsubscribe anytime
- **Persistent**: Saved to database

**Features**:
- Subscribe to specific combinations (e.g., Badminton + Evening + Friday)
- Multiple simultaneous subscriptions
- Instant save to backend
- View all active subscriptions

**Endpoints**:
```javascript
POST /api/notifications/subscribe/:userId
Body: { courtType, timeSlot, dayOfWeek }

POST /api/notifications/unsubscribe/:userId
Body: { subscriptionKey }

GET /api/notifications/subscriptions/:userId
```

### 8. **Waitlist Prioritization**
- **Priority**: Waitlist users receive cancellation alerts first
- **Sequence**: Waitlist → General subscribers → Broadcast
- **Status**: User can check waitlist position
- **Database**: `court_waitlist` table

**Endpoints**:
```javascript
POST /api/notifications/waitlist/add
Body: { userId, courtId, timeSlot }

POST /api/notifications/waitlist/remove
Body: { userId, courtId }

GET /api/notifications/waitlist/court/:courtId
```

---

## UI Components

### **NotificationCenter**
Main notification display component with:
- Bell icon with unread badge
- Dropdown notification panel
- Color-coded notification types
- Mark as read functionality
- Delete individual notifications
- Preferences management button

**Location**: Frontend - `src/components/Notification.jsx`

**Usage**:
```javascript
import { NotificationCenter } from './components/Notification';

// In your component
<NotificationCenter />
```

### **NotificationPreferences**
Subscription management interface with:
- Filter by court type
- Filter by time slot
- Filter by day of week
- Subscribe button
- Active subscriptions list
- Unsubscribe controls
- Toggle booking confirmations
- Toggle reminder notifications

---

## Backend API Endpoints

### Core Notification Endpoints

#### 1. Send Notification
```
POST /api/notifications/send
Headers: Content-Type: application/json
Body: {
  type: "BOOKING_CONFIRMATION|CANCELLATION_ALERT|REMINDER",
  recipientId: int | userId (or use recipients array),
  recipients: int[] (optional - for bulk sends),
  message: "notification message",
  data: { ... }, // Additional context
  timestamp: ISO 8601 string (optional)
}

Response: {
  message: "Notifications sent successfully",
  sentCount: 5,
  notifications: [...]
}
```

#### 2. Get Pending Notifications
```
GET /api/notifications/pending/:userId
Response: {
  notifications: [
    {
      id: int,
      recipient_id: int,
      notification_type: string,
      delivery_status: "sent",
      message: string,
      timestamp: datetime
    }
  ]
}
```

#### 3. Log Notification
```
POST /api/notifications/log
Body: {
  recipient: int,
  type: string,
  timestamp: ISO 8601,
  deliveryStatus: "sent|failed|pending",
  details: { ... }
}
```

#### 4. Get Delivery Log
```
GET /api/notifications/log/:userId
GET /api/notifications/log/:userId?type=BOOKING_CONFIRMATION&limit=50

Response: {
  logs: [
    {
      id: int,
      recipient_id: int,
      notification_type: string,
      channel: string,
      delivery_status: string,
      message: string,
      timestamp: datetime
    }
  ],
  count: int
}
```

### Subscription Endpoints

#### 5. Create Subscription
```
POST /api/notifications/subscribe/:userId
Body: {
  courtType: string (optional - null for all),
  timeSlot: string (optional - null for all),
  dayOfWeek: int (optional - 0-6, null for all)
}

Response: {
  message: "Subscription created successfully",
  subscriptionId: int,
  criteria: { ... }
}
```

#### 6. Remove Subscription
```
POST /api/notifications/unsubscribe/:userId
Body: {
  subscriptionKey: int // subscription id
}
```

#### 7. Get User Subscriptions
```
GET /api/notifications/subscriptions/:userId

Response: {
  subscriptions: [
    {
      id: int,
      court_type: string,
      time_slot: string,
      day_of_week: int,
      created_at: datetime
    }
  ],
  count: int
}
```

### Waitlist Endpoints

#### 8. Add to Waitlist
```
POST /api/notifications/waitlist/add
Body: {
  userId: int,
  courtId: int,
  timeSlot: string (optional)
}

Response: {
  message: "Added to waitlist successfully",
  waitlistId: int
}
```

#### 9. Remove from Waitlist
```
POST /api/notifications/waitlist/remove
Body: {
  userId: int,
  courtId: int
}
```

#### 10. Get Court Waitlist
```
GET /api/notifications/waitlist/court/:courtId

Response: {
  waitlist: [
    {
      id: int,
      user_id: int,
      time_slot: string,
      created_at: datetime,
      username: string,
      email: string
    }
  ],
  count: int
}
```

### Special Event Endpoints

#### 11. Booking Confirmation Notification
```
POST /api/notifications/booking-confirmation
Body: {
  userId: int,
  bookingId: int,
  bookingDetails: {
    courtName: string,
    bookingDate: string,
    timeSlot: string
  }
}
```

#### 12. Reminder Notification
```
POST /api/notifications/reminder
Body: {
  userId: int,
  bookingId: int,
  bookingStartTime: ISO 8601 string,
  bookingDetails: {
    courtName: string,
    timeSlot: string
  }
}

Response: {
  message: "Reminder notification scheduled",
  bookingId: int,
  reminderTime: ISO 8601 string
}
```

### Rate Limiting

#### 13. Check Rate Limit
```
GET /api/notifications/rate-limit/check/:userId

Response: {
  userId: int,
  alertsInLastHour: 5,
  maxAllowed: 10,
  rateLimitExceeded: false,
  remainingAlerts: 5
}
```

---

## Database Schema

### notification_subscriptions
```sql
CREATE TABLE notification_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  court_type VARCHAR(50),
  time_slot VARCHAR(50),
  day_of_week INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### notification_delivery_log
```sql
CREATE TABLE notification_delivery_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_id INT NOT NULL,
  notification_type VARCHAR(50),
  channel VARCHAR(50) DEFAULT 'SYSTEM',
  delivery_status VARCHAR(20),
  message TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_recipient_timestamp (recipient_id, timestamp)
);
```

### court_waitlist
```sql
CREATE TABLE court_waitlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  court_id INT NOT NULL,
  time_slot VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_waitlist (user_id, court_id, time_slot)
);
```

---

## Integration Guide

### Frontend Integration

#### 1. Wrap App with Provider
```javascript
import { NotificationProvider } from './components/Notification';

function App() {
  const [user, setUser] = useState(null);
  
  return (
    <NotificationProvider userId={user?.id || null}>
      {/* Your app components */}
    </NotificationProvider>
  );
}
```

#### 2. Use Notifications in Components
```javascript
import { useNotification } from './components/Notification';

function CourtBookingPage() {
  const { 
    subscribe, 
    unsubscribe, 
    notifications,
    addNotification 
  } = useNotification();

  const handleBookingSuccess = (bookingDetails) => {
    // Notification sent automatically from backend
    // Or trigger manually:
    addNotification({
      type: 'BOOKING_CONFIRMATION',
      title: 'Booking Confirmed',
      message: 'Your booking has been confirmed',
      data: bookingDetails
    });
  };

  const handleSubscribe = (criteria) => {
    subscribe({
      [`sub-${Date.now()}`]: criteria
    });
  };

  return (
    // Your component JSX
  );
}
```

### Backend Integration

#### 1. Trigger Booking Confirmation
```javascript
// When booking is created
app.post('/api/court-bookings', async (req, res) => {
  // Create booking...
  
  // Trigger notification
  await fetch('http://localhost:5000/api/notifications/booking-confirmation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      bookingId: result.insertId,
      bookingDetails: {
        courtName: court_name,
        bookingDate: booking_date,
        timeSlot: time_slot
      }
    })
  });
});
```

#### 2. Trigger Cancellation Alert
```javascript
// When booking is cancelled
app.put('/api/court-bookings/:id/cancel', async (req, res) => {
  // Cancel booking...
  
  // Get all subscribed users
  const [subscribers] = await pool.query(`
    SELECT DISTINCT user_id FROM notification_subscriptions
    WHERE (court_type IS NULL OR court_type = ?)
    AND (time_slot IS NULL OR time_slot = ?)
  `, [court_type, time_slot]);

  // Trigger notification to each subscriber
  for (const sub of subscribers) {
    await fetch('http://localhost:5000/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'CANCELLATION_ALERT',
        recipientId: sub.user_id,
        message: `Court ${court_name} is now available`,
        data: {
          courtNumber: court_name,
          timeSlot: time_slot,
          date: booking_date
        }
      })
    });
  }
});
```

#### 3. Trigger Reminder
```javascript
// Schedule reminders for upcoming bookings
app.post('/api/notifications/schedule-reminders', async (req, res) => {
  const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
  
  const [bookings] = await pool.query(`
    SELECT * FROM court_bookings 
    WHERE booking_date >= ? AND status = 'BOOKED'
  `, [twoHoursFromNow]);

  for (const booking of bookings) {
    await fetch('http://localhost:5000/api/notifications/reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: booking.user_id,
        bookingId: booking.id,
        bookingStartTime: booking.booking_date,
        bookingDetails: {
          courtName: booking.court_name,
          timeSlot: booking.time_slot
        }
      })
    });
  }
});
```

---

## Notification Types

| Type | Trigger | Timing | Priority |
|------|---------|--------|----------|
| **BOOKING_CONFIRMATION** | Successful booking | Immediate | Normal |
| **CANCELLATION_ALERT** | Booking cancellation | Within 10s | Waitlist > General |
| **REMINDER** | Scheduled | 2 hours before | Normal |

---

## Testing the System

### Test Booking Confirmation
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

### Test Subscription
```bash
curl -X POST http://localhost:5000/api/notifications/subscribe/1 \
  -H "Content-Type: application/json" \
  -d '{
    "courtType": "badminton",
    "timeSlot": "evening",
    "dayOfWeek": 5
  }'
```

### Test Rate Limit Check
```bash
curl http://localhost:5000/api/notifications/rate-limit/check/1
```

---

## Future Enhancements

1. **Email Notifications**: Integrate with mail service
2. **SMS Notifications**: Add Twilio/AWS SNS integration
3. **Push Notifications**: Add Firebase Cloud Messaging
4. **Notification History**: Persistent UI history view
5. **Batch Processing**: Queue system for bulk notifications
6. **Analytics**: Track notification engagement metrics
7. **Custom Notification Sounds**: User preferences
8. **Rich Notifications**: Add images and action buttons

---

## Files Modified

1. **Frontend**:
   - Created: `src/components/Notification.jsx` (850+ lines)
   - Modified: `src/App.jsx` (wrapped with NotificationProvider)
   - Modified: `src/components/Navbar.jsx` (added NotificationCenter)

2. **Backend**:
   - Modified: `server.js` (added 400+ lines of notification endpoints)

---

## Environment Configuration

Ensure backend server is running on:
- **HTTP**: `http://localhost:5000`
- **WebSocket** (optional): `ws://localhost:8080`

Update these URLs in `Notification.jsx` if using different ports.

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify backend is running
3. Check database tables are created
4. Review backend logs for API errors
5. Ensure user is logged in (userId is set)
