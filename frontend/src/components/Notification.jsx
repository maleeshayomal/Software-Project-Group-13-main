import React, { useEffect, useState, useCallback, useRef, useContext, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertCircle, Clock, Settings } from 'lucide-react';
import './Notification.css';

// Notification Context for global access
export const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

// Main Notification Manager Component
export const NotificationProvider = ({ children, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [deliveryLog, setDeliveryLog] = useState([]);
  const [userPreferences, setUserPreferences] = useState({
    subscriptions: {},
    rateLimitTracker: {}, // Track cancellation alerts per hour
    maxCancellationAlertsPerHour: 10,
  });
  const [waitlistUsers, setWaitlistUsers] = useState(new Map());
  const reminderTimersRef = useRef(new Map());
  const cancellationAlertCounterRef = useRef({});
  const wsRef = useRef(null);

  // Initialize WebSocket connection for real-time notifications
  useEffect(() => {
    if (!userId) return;

    const connectWebSocket = () => {
      wsRef.current = new WebSocket(`ws://localhost:8080?userId=${userId}`);

      wsRef.current.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        handleIncomingNotification(notification);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Fallback to polling if WebSocket fails
        pollForNotifications();
      };

      wsRef.current.onclose = () => {
        // Attempt reconnection after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [userId]);

  // Polling fallback for real-time notifications
  const pollForNotifications = useCallback(() => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/notifications/pending/${userId}`);
        const data = await response.json();
        if (data.notifications && data.notifications.length > 0) {
          data.notifications.forEach(handleIncomingNotification);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [userId]);

  // Handle incoming notifications
  const handleIncomingNotification = useCallback(async (notification) => {
    const { type, data, timestamp } = notification;

    switch (type) {
      case 'CANCELLATION_ALERT':
        await handleCancellationAlert(notification);
        break;
      case 'BOOKING_CONFIRMATION':
        await handleBookingConfirmation(notification);
        break;
      case 'REMINDER':
        await handleReminderNotification(notification);
        break;
      default:
        addNotification(notification);
    }
  }, []);

  // Handle Cancellation Alerts with rate limiting
  const handleCancellationAlert = useCallback(async (notification) => {
    // Check rate limiting: max 10 cancellation alerts per user per hour
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    if (!cancellationAlertCounterRef.current[userId]) {
      cancellationAlertCounterRef.current[userId] = [];
    }

    // Remove timestamps older than 1 hour
    cancellationAlertCounterRef.current[userId] = cancellationAlertCounterRef.current[
      userId
    ].filter((timestamp) => new Date(timestamp) > hourAgo);

    // Check if rate limit exceeded
    if (cancellationAlertCounterRef.current[userId].length >= 10) {
      console.log('Rate limit exceeded for cancellation alerts');
      return;
    }

    // Check user subscription preferences
    const { courtType, timeSlot, dayOfWeek } = notification.data;
    const isSubscribed = checkSubscription({
      courtType,
      timeSlot,
      dayOfWeek,
    });

    if (!isSubscribed) {
      return; // User not subscribed to this type of alert
    }

    // Prioritize waitlist users
    const isWaitlisted = checkIfUserIsWaitlisted(
      userId,
      notification.data.courtId,
      notification.data.timeSlot
    );

    const notificationWithPriority = {
      ...notification,
      priority: isWaitlisted ? 'high' : 'normal',
      deliveryTime: new Date().toISOString(),
    };

    // Send notification within 10 seconds
    await sendNotificationWithinDeadline(notificationWithPriority, 10000);

    // Add to cancellation counter
    cancellationAlertCounterRef.current[userId].push(now.toISOString());

    // Log delivery
    logNotificationDelivery({
      type: 'CANCELLATION_ALERT',
      recipient: userId,
      timestamp: now.toISOString(),
      deliveryStatus: 'sent',
      details: notification.data,
    });
  }, [userId]);

  // Handle Booking Confirmation - send immediately
  const handleBookingConfirmation = useCallback(async (notification) => {
    const timestamp = new Date().toISOString();

    const confirmationNotification = {
      ...notification,
      timestamp,
      read: false,
      type: 'BOOKING_CONFIRMATION',
    };

    addNotification(confirmationNotification);

    // Log delivery
    await logNotificationDelivery({
      type: 'BOOKING_CONFIRMATION',
      recipient: userId,
      timestamp,
      deliveryStatus: 'sent',
      details: notification.data,
    });
  }, [userId]);

  // Handle Reminder Notifications - 2 hours before booking
  const handleReminderNotification = useCallback(
    async (notification) => {
      const { bookingId, bookingStartTime } = notification.data;
      const startTime = new Date(bookingStartTime);
      const now = new Date();
      const timeUntilBooking = startTime.getTime() - now.getTime();
      const twoHoursInMs = 2 * 60 * 60 * 1000;

      if (timeUntilBooking > 0) {
        const delayUntilReminder = timeUntilBooking - twoHoursInMs;

        // Set a timer to send reminder 2 hours before booking
        const reminderId = `reminder-${bookingId}`;
        if (reminderTimersRef.current.has(reminderId)) {
          clearTimeout(reminderTimersRef.current.get(reminderId));
        }

        const timerId = setTimeout(async () => {
          const reminderNotif = {
            id: `notif-${bookingId}`,
            type: 'REMINDER',
            title: 'Booking Reminder',
            message: `Your court booking starts in 2 hours at ${startTime.toLocaleTimeString()}`,
            data: notification.data,
            timestamp: new Date().toISOString(),
            read: false,
          };

          addNotification(reminderNotif);

          // Log delivery
          await logNotificationDelivery({
            type: 'REMINDER',
            recipient: userId,
            timestamp: new Date().toISOString(),
            deliveryStatus: 'sent',
            details: notification.data,
          });

          reminderTimersRef.current.delete(reminderId);
        }, Math.max(0, delayUntilReminder));

        reminderTimersRef.current.set(reminderId, timerId);
      }
    },
    [userId]
  );

  // Send notification with deadline (10 seconds for cancellations)
  const sendNotificationWithinDeadline = async (notification, deadlineMs) => {
    return new Promise(async (resolve) => {
      const timeoutId = setTimeout(() => {
        console.warn('Notification delivery timeout:', notification);
        resolve(false);
      }, deadlineMs);

      try {
        const response = await fetch('http://localhost:5000/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification),
        });

        if (response.ok) {
          addNotification(notification);
          clearTimeout(timeoutId);
          resolve(true);
        }
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    });
  };

  // Add notification to state
  const addNotification = (notification) => {
    const id = notification.id || `notif-${Date.now()}`;
    setNotifications((prev) => [
      {
        ...notification,
        id,
        read: false,
        createdAt: notification.timestamp || new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // Log notification delivery
  const logNotificationDelivery = (logEntry) => {
    const entry = {
      id: `log-${Date.now()}`,
      ...logEntry,
      timestamp: logEntry.timestamp || new Date().toISOString(),
    };

    setDeliveryLog((prev) => [entry, ...prev]);

    // Persist to backend
    fetch('http://localhost:5000/api/notifications/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch((error) => console.error('Error logging notification:', error));
  };

  // Subscribe to notifications
  const subscribe = (subscriptionData) => {
    setUserPreferences((prev) => ({
      ...prev,
      subscriptions: {
        ...prev.subscriptions,
        ...subscriptionData,
      },
    }));

    // Persist subscription
    fetch(`http://localhost:5000/api/notifications/subscribe/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscriptionData),
    }).catch((error) => console.error('Error saving subscription:', error));
  };

  // Unsubscribe from notifications
  const unsubscribe = (subscriptionKey) => {
    setUserPreferences((prev) => {
      const newPrefs = { ...prev.subscriptions };
      delete newPrefs[subscriptionKey];
      return {
        ...prev,
        subscriptions: newPrefs,
      };
    });

    // Persist unsubscription
    fetch(`http://localhost:5000/api/notifications/unsubscribe/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionKey }),
    }).catch((error) => console.error('Error removing subscription:', error));
  };

  // Check if user is subscribed to a specific notification type
  const checkSubscription = (criteria) => {
    const { courtType, timeSlot, dayOfWeek } = criteria;
    const subscriptions = userPreferences.subscriptions;

    // Check for matching subscriptions
    return Object.values(subscriptions).some((sub) => {
      if (sub.courtType && sub.courtType !== courtType) return false;
      if (sub.timeSlot && sub.timeSlot !== timeSlot) return false;
      if (sub.dayOfWeek && sub.dayOfWeek !== dayOfWeek) return false;
      return true;
    });
  };

  // Check if user is on waitlist
  const checkIfUserIsWaitlisted = (userId, courtId, timeSlot) => {
    const key = `${courtId}-${timeSlot}`;
    const waitlist = waitlistUsers.get(key) || [];
    return waitlist.includes(userId);
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif))
    );
  };

  // Delete notification
  const deleteNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
  };

  // Get unread count
  const getUnreadCount = () => {
    return notifications.filter((notif) => !notif.read).length;
  };

  const value = {
    notifications,
    deliveryLog,
    userPreferences,
    subscribe,
    unsubscribe,
    markAsRead,
    deleteNotification,
    getUnreadCount,
    addNotification,
    handleIncomingNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Notification Center Component (UI)
export const NotificationCenter = () => {
  const {
    notifications,
    markAsRead,
    deleteNotification,
    getUnreadCount,
    subscribe,
    unsubscribe,
    userPreferences,
  } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'CANCELLATION_ALERT':
        return <AlertCircle className="w-5 h-5" />;
      case 'BOOKING_CONFIRMATION':
        return <Check className="w-5 h-5" />;
      case 'REMINDER':
        return <Clock className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'CANCELLATION_ALERT':
        return 'notification-alert';
      case 'BOOKING_CONFIRMATION':
        return 'notification-success';
      case 'REMINDER':
        return 'notification-info';
      default:
        return 'notification-default';
    }
  };

  return (
    <div className="notification-container">
      {/* Notification Bell Icon */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="notification-bell"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Notifications"
      >
        <Bell className="bell-icon" />
        <AnimatePresence>
          {getUnreadCount() > 0 && (
            <motion.span
              className="notification-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {getUnreadCount() > 9 ? '9+' : getUnreadCount()}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="notification-panel"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="notification-header">
              <div className="header-content">
                <h3 className="header-title">
                  {showPreferences ? 'Preferences' : 'Notifications'}
                </h3>
                <div className="header-badge">
                  {!showPreferences && getUnreadCount() > 0 && (
                    <span className="unread-count">{getUnreadCount()} New</span>
                  )}
                </div>
              </div>
              <div className="header-controls">
                <motion.button
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="control-btn settings-btn"
                  whileHover={{ rotate: 20 }}
                  whileTap={{ scale: 0.9 }}
                  title="Preferences"
                >
                  <Settings className="control-icon" />
                </motion.button>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="control-btn close-btn"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="control-icon" />
                </motion.button>
              </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
              {showPreferences ? (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <NotificationPreferences
                    userPreferences={userPreferences}
                    onSubscribe={subscribe}
                    onUnsubscribe={unsubscribe}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="notifications-list"
                >
                  {notifications.length === 0 ? (
                    <motion.div
                      className="empty-state"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Bell className="empty-icon" />
                      <p className="empty-text">No notifications yet</p>
                      <p className="empty-subtext">Your notifications will appear here</p>
                    </motion.div>
                  ) : (
                    <div className="notifications-scroll">
                      <AnimatePresence>
                        {notifications.map((notification, index) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className={`notification-item ${getNotificationColor(notification.type)} ${
                              !notification.read ? 'unread' : ''
                            }`}
                            whileHover={{ x: 4 }}
                          >
                            <div className="notification-icon-wrapper">
                              <div className="icon-bg">
                                {getNotificationIcon(notification.type)}
                              </div>
                            </div>

                            <div
                              className="notification-content"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="notification-header-line">
                                <p className="notification-title">
                                  {notification.title || notification.type}
                                </p>
                                {!notification.read && (
                                  <div className="unread-indicator" />
                                )}
                              </div>
                              <p className="notification-message">
                                {notification.message}
                              </p>

                              {notification.data && (
                                <motion.div
                                  className="notification-details"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                >
                                  {notification.data.courtNumber && (
                                    <div className="detail-item">
                                      <span className="detail-label">Court:</span>
                                      <span className="detail-value">
                                        {notification.data.courtNumber}
                                      </span>
                                    </div>
                                  )}
                                  {notification.data.timeSlot && (
                                    <div className="detail-item">
                                      <span className="detail-label">Time:</span>
                                      <span className="detail-value">
                                        {notification.data.timeSlot}
                                      </span>
                                    </div>
                                  )}
                                  {notification.data.date && (
                                    <div className="detail-item">
                                      <span className="detail-label">Date:</span>
                                      <span className="detail-value">
                                        {notification.data.date}
                                      </span>
                                    </div>
                                  )}
                                </motion.div>
                              )}

                              <p className="notification-time">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>

                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="delete-btn"
                              whileHover={{ scale: 1.15, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <X className="delete-icon" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Notification Preferences Component
const NotificationPreferences = ({ userPreferences, onSubscribe, onUnsubscribe }) => {
  const [preferences, setPreferences] = useState({
    cancellationAlerts: {
      courtType: '',
      timeSlot: '',
      dayOfWeek: '',
    },
    bookingConfirmation: true,
    reminders: true,
  });

  const handleSubscribe = () => {
    onSubscribe({
      [`sub-${Date.now()}`]: preferences.cancellationAlerts,
    });
  };

  const handleUnsubscribe = (key) => {
    onUnsubscribe(key);
  };

  return (
    <motion.div
      className="preferences-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="preferences-header">
        <h4 className="preferences-title">Notification Preferences</h4>
        <p className="preferences-subtitle">Customize your notification settings</p>
      </div>

      <div className="preferences-content">
        {/* Cancellation Alerts Section */}
        <motion.div
          className="preferences-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="section-header">
            <AlertCircle className="section-icon alert-icon" />
            <h5 className="section-title">Court Cancellation Alerts</h5>
          </div>

          <div className="form-group">
            <label className="form-label">Court</label>
            <motion.select
              value={preferences.cancellationAlerts.courtType}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  cancellationAlerts: {
                    ...preferences.cancellationAlerts,
                    courtType: e.target.value,
                  },
                })
              }
              className="form-select"
              whileFocus={{ scale: 1.01 }}
            >
              <option value="">All Badminton Courts</option>
              <option value="badminton">🏸 Badminton Court 1</option>
              <option value="badminton-2">🏸 Badminton Court 2</option>
            </motion.select>
          </div>

          <div className="form-group">
            <label className="form-label">Time Slot</label>
            <motion.select
              value={preferences.cancellationAlerts.timeSlot}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  cancellationAlerts: {
                    ...preferences.cancellationAlerts,
                    timeSlot: e.target.value,
                  },
                })
              }
              className="form-select"
              whileFocus={{ scale: 1.01 }}
            >
              <option value="">All Time Slots</option>
              <option value="morning">🌅 Morning (6AM - 12PM)</option>
              <option value="afternoon">☀️ Afternoon (12PM - 6PM)</option>
              <option value="evening">🌙 Evening (6PM - 10PM)</option>
            </motion.select>
          </div>

          <div className="form-group">
            <label className="form-label">Day of Week</label>
            <motion.select
              value={preferences.cancellationAlerts.dayOfWeek}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  cancellationAlerts: {
                    ...preferences.cancellationAlerts,
                    dayOfWeek: e.target.value,
                  },
                })
              }
              className="form-select"
              whileFocus={{ scale: 1.01 }}
            >
              <option value="">All Days</option>
              <option value="0">Sunday</option>
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
            </motion.select>
          </div>

          <motion.button
            onClick={handleSubscribe}
            className="subscribe-btn"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Subscribe</span>
            <motion.span
              className="btn-icon"
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
            >
              →
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Booking Confirmations Section */}
        <motion.div
          className="preferences-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="section-header">
            <Check className="section-icon success-icon" />
            <h5 className="section-title">Booking Confirmations</h5>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={preferences.bookingConfirmation}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  bookingConfirmation: e.target.checked,
                })
              }
              className="checkbox-input"
            />
            <span className="checkbox-text">Send confirmation after booking</span>
          </label>
        </motion.div>

        {/* Reminders Section */}
        <motion.div
          className="preferences-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="section-header">
            <Clock className="section-icon info-icon" />
            <h5 className="section-title">Booking Reminders</h5>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={preferences.reminders}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  reminders: e.target.checked,
                })
              }
              className="checkbox-input"
            />
            <span className="checkbox-text">Remind me 2 hours before booking</span>
          </label>
        </motion.div>

        {/* Active Subscriptions */}
        <motion.div
          className="preferences-section subscriptions-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="section-header">
            <Bell className="section-icon" />
            <h5 className="section-title">Active Subscriptions</h5>
            {Object.entries(userPreferences.subscriptions).length > 0 && (
              <span className="subscription-count">
                {Object.entries(userPreferences.subscriptions).length}
              </span>
            )}
          </div>

          {Object.entries(userPreferences.subscriptions).length === 0 ? (
            <p className="empty-subscriptions">No active subscriptions yet</p>
          ) : (
            <div className="subscriptions-list">
              <AnimatePresence>
                {Object.entries(userPreferences.subscriptions).map(([key, value]) => (
                  <motion.div
                    key={key}
                    className="subscription-item"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <div className="subscription-details">
                      <p className="subscription-text">
                        <span className="detail-badge">
                          {value.courtType || '🎯 All Courts'}
                        </span>
                        <span className="detail-badge">
                          {value.timeSlot || '⏰ All Times'}
                        </span>
                        <span className="detail-badge">
                          {value.dayOfWeek !== undefined && value.dayOfWeek !== null
                            ? value.dayOfWeek
                            : '📅 All Days'}
                        </span>
                      </p>
                    </div>
                    <motion.button
                      onClick={() => handleUnsubscribe(key)}
                      className="unsubscribe-btn"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="btn-icon-small" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotificationCenter;
