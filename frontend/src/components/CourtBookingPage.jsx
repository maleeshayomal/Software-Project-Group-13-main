import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle,
  FaBell, 
  FaUndo,
  FaUserCheck,
  FaInfoCircle
} from 'react-icons/fa';
import { GiTennisCourt } from 'react-icons/gi';

const TIME_SLOTS = [
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
  '06:00 PM - 07:00 PM',
  '07:00 PM - 08:00 PM',
  '08:00 PM - 09:00 PM'
];

const COURTS = ['Court 1', 'Court 2'];

const CourtBookingPage = ({ user, onLoginClick }) => {
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [activeTab, setActiveTab] = useState('book'); // 'book' | 'my-bookings'
  const [bookings, setBookings] = useState([]); // Bookings for selected date
  const [userBookings, setUserBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null); // { court, timeSlot }
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch court availability for date
  const fetchAvailability = async (date) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/court-bookings/availability?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to fetch court availability:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch logged in user's bookings
  const fetchUserBookings = async () => {
    if (!user || !user.username) return;
    try {
      const res = await fetch(`http://localhost:5000/api/court-bookings/user/${user.username}`);
      if (res.ok) {
        const data = await res.json();
        setUserBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to fetch user bookings:', err);
    }
  };

  // Fetch broadcast notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchAvailability(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
    fetchNotifications();

    // Poll for real-time court cancellations and notifications every 5 seconds
    const interval = setInterval(() => {
      fetchAvailability(selectedDate);
      fetchNotifications();
      if (user) fetchUserBookings();
    }, 5000);

    return () => clearInterval(interval);
  }, [user, selectedDate]);

  const handleBookClick = (court_name, time_slot) => {
    if (!user) {
      setMessage({ text: 'Please log in or register to book a court session.', type: 'error' });
      onLoginClick();
      return;
    }
    setSelectedSlot({ court_name, time_slot });
    setShowConfirmModal(true);
  };

  const confirmBooking = async () => {
    if (!selectedSlot || !user) return;
    setActionLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('http://localhost:5000/api/court-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          court_name: selectedSlot.court_name,
          booking_date: selectedDate,
          time_slot: selectedSlot.time_slot
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: `🎉 ${data.message}`, type: 'success' });
        setShowConfirmModal(false);
        fetchAvailability(selectedDate);
        fetchUserBookings();
      } else {
        setMessage({ text: data.error || 'Failed to book court slot.', type: 'error' });
      }
    } catch (err) {
      console.error('Booking error:', err);
      setMessage({ text: 'Network error occurred while booking court.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!user || !user.username) return;
    if (!window.confirm('Are you sure you want to cancel this booking? A notification will be broadcast to all registered users.')) {
      return;
    }

    setActionLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch(`http://localhost:5000/api/court-bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: `✅ ${data.message}`, type: 'success' });
        fetchAvailability(selectedDate);
        fetchUserBookings();
        fetchNotifications();
      } else {
        setMessage({ text: data.error || 'Failed to cancel booking.', type: 'error' });
      }
    } catch (err) {
      console.error('Cancel booking error:', err);
      setMessage({ text: 'Network error occurred while cancelling booking.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to determine slot status
  const getSlotStatus = (courtName, timeSlot) => {
    const booking = bookings.find(
      (b) => b.court_name === courtName && b.time_slot === timeSlot && b.status === 'BOOKED'
    );

    if (!booking) return { status: 'AVAILABLE' };
    if (user && booking.username === user.username) return { status: 'MY_BOOKING', booking };
    return { status: 'BOOKED', booking };
  };

  return (
    <div style={styles.container}>
      {/* Header Banner */}
      <div style={styles.header}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={styles.badge}>
            <GiTennisCourt style={{ marginRight: '8px', color: 'var(--accent)' }} />
            Yamundra Professional Arena
          </div>
          <h1 style={styles.title}>Court Booking System</h1>
          <p style={styles.subtitle}>
            Reserve Court 1 or Court 2 for your badminton sessions. Real-time availability & cancellation alerts for registered players.
          </p>
        </motion.div>
      </div>

      {/* Broadcast Notifications Alert Banner */}
      {notifications.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.notificationTicker}
        >
          <div style={styles.tickerHeader}>
            <FaBell style={{ color: '#ffb703', animation: 'bounce 2s infinite' }} />
            <span style={styles.tickerTitle}>Live Slot Availability Alert</span>
          </div>
          <div style={styles.tickerList}>
            {notifications.slice(0, 3).map((notif) => (
              <div key={notif.id} style={styles.notifItem}>
                <span style={styles.notifBullet}>•</span>
                <span>{notif.message}</span>
                <span style={styles.notifTime}>
                  {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Message Toast */}
      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            ...styles.messageBanner,
            backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
            borderColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)',
            color: message.type === 'error' ? '#fca5a5' : '#86efac'
          }}
        >
          {message.type === 'error' ? <FaExclamationTriangle style={{ marginRight: '8px' }} /> : <FaCheckCircle style={{ marginRight: '8px' }} />}
          {message.text}
        </motion.div>
      )}

      {/* Controls Bar */}
      <div style={styles.controlsBar}>
        <div style={styles.tabButtons}>
          <button
            onClick={() => setActiveTab('book')}
            style={{
              ...styles.tabButton,
              backgroundColor: activeTab === 'book' ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'book' ? '#000000' : '#ffffff',
              fontWeight: activeTab === 'book' ? 700 : 500
            }}
          >
            <GiTennisCourt style={{ marginRight: '8px' }} />
            Book a Court
          </button>
          
          {user && (
            <button
              onClick={() => setActiveTab('my-bookings')}
              style={{
                ...styles.tabButton,
                backgroundColor: activeTab === 'my-bookings' ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
                color: activeTab === 'my-bookings' ? '#000000' : '#ffffff',
                fontWeight: activeTab === 'my-bookings' ? 700 : 500
              }}
            >
              <FaUserCheck style={{ marginRight: '8px' }} />
              My Bookings ({userBookings.filter(b => b.status === 'BOOKED').length})
            </button>
          )}
        </div>

        {activeTab === 'book' && (
          <div style={styles.datePickerContainer}>
            <FaCalendarAlt style={{ color: 'var(--accent)', marginRight: '10px' }} />
            <span style={styles.dateLabel}>Select Date:</span>
            <input
              type="date"
              value={selectedDate}
              min={getTodayString()}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === 'book' ? (
        <div style={styles.bookingSection}>
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: '#22c55e' }}></span>
              <span>Available</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: '#ef4444' }}></span>
              <span>Booked (Occupied)</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, backgroundColor: '#eab308' }}></span>
              <span>Your Booking</span>
            </div>
          </div>

          <div style={styles.courtsGrid}>
            {COURTS.map((courtName) => (
              <div key={courtName} style={styles.courtCard}>
                <div style={styles.courtCardHeader}>
                  <GiTennisCourt style={styles.courtHeaderIcon} />
                  <h3>{courtName}</h3>
                  <span style={styles.dateBadge}>{selectedDate}</span>
                </div>

                <div style={styles.slotsList}>
                  {TIME_SLOTS.map((timeSlot) => {
                    const { status, booking } = getSlotStatus(courtName, timeSlot);

                    return (
                      <div 
                        key={timeSlot} 
                        style={{
                          ...styles.slotRow,
                          borderColor: 
                            status === 'AVAILABLE' ? 'rgba(34, 197, 94, 0.25)' :
                            status === 'MY_BOOKING' ? 'rgba(234, 179, 8, 0.4)' : 'rgba(239, 68, 68, 0.25)',
                          backgroundColor:
                            status === 'AVAILABLE' ? 'rgba(34, 197, 94, 0.04)' :
                            status === 'MY_BOOKING' ? 'rgba(234, 179, 8, 0.08)' : 'rgba(239, 68, 68, 0.05)'
                        }}
                      >
                        <div style={styles.slotTimeInfo}>
                          <FaClock style={{ marginRight: '8px', opacity: 0.7 }} />
                          <span>{timeSlot}</span>
                        </div>

                        {status === 'AVAILABLE' && (
                          <button
                            onClick={() => handleBookClick(courtName, timeSlot)}
                            style={styles.bookButton}
                          >
                            <FaCheckCircle style={{ marginRight: '6px' }} />
                            Book Now
                          </button>
                        )}

                        {status === 'MY_BOOKING' && (
                          <div style={styles.myBookingBadge}>
                            <span>Your Session</span>
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              style={styles.cancelSmallBtn}
                              title="Cancel your booking"
                            >
                              <FaTimesCircle style={{ marginRight: '4px' }} />
                              Cancel
                            </button>
                          </div>
                        )}

                        {status === 'BOOKED' && (
                          <div style={styles.bookedBadge}>
                            <FaTimesCircle style={{ marginRight: '6px', color: '#ef4444' }} />
                            <span>Already Booked</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={styles.myBookingsSection}>
          <h2>Your Current Court Reservations</h2>
          {userBookings.filter(b => b.status === 'BOOKED' && b.booking_date >= getTodayString()).length === 0 ? (
            <div style={styles.emptyState}>
              <FaInfoCircle size={40} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
              <p>You have no current or upcoming court bookings.</p>
              <button onClick={() => setActiveTab('book')} style={styles.bookButton}>
                Book a Court Session Now
              </button>
            </div>
          ) : (
            <div style={styles.bookingsTableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Court</th>
                    <th>Date</th>
                    <th>Session Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userBookings.filter(b => b.status === 'BOOKED' && b.booking_date >= getTodayString()).map((b) => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{b.court_name}</td>
                      <td>{b.booking_date}</td>
                      <td>{b.time_slot}</td>
                      <td>
                        <span 
                          style={{
                            ...styles.statusTag,
                            backgroundColor: 'rgba(34, 197, 94, 0.2)',
                            color: '#86efac',
                            borderColor: 'rgba(34, 197, 94, 0.4)'
                          }}
                        >
                          ACTIVE
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          disabled={actionLoading}
                          style={styles.cancelTableBtn}
                        >
                          <FaUndo style={{ marginRight: '6px' }} />
                          Cancel & Alert Players
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && selectedSlot && (
          <div style={styles.modalOverlay}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={styles.modalContent}
            >
              <h3>Confirm Court Reservation</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Please review your booking details before confirming.
              </p>

              <div style={styles.modalSummary}>
                <div style={styles.summaryRow}>
                  <span>Player:</span>
                  <strong>{user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Court:</span>
                  <strong style={{ color: 'var(--accent)' }}>{selectedSlot.court_name}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Date:</span>
                  <strong>{selectedDate}</strong>
                </div>
                <div style={styles.summaryRow}>
                  <span>Time Session:</span>
                  <strong>{selectedSlot.time_slot}</strong>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  style={styles.modalCancelBtn}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  style={styles.modalConfirmBtn}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Confirming...' : 'Confirm & Reserve Court'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  container: {
    padding: '100px 5% 60px',
    maxWidth: '1300px',
    margin: '0 auto',
    color: '#ffffff',
    minHeight: '85vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.4rem 1.2rem',
    borderRadius: '30px',
    backgroundColor: 'rgba(204, 219, 113, 0.1)',
    border: '1px solid rgba(204, 219, 113, 0.3)',
    color: '#ffffff',
    fontSize: '0.9rem',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2.8rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #ffffff 0%, #ccdb71 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.8rem',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'rgba(255, 255, 255, 0.7)',
    maxWidth: '750px',
    margin: '0 auto',
    lineHeight: 1.6,
  },
  notificationTicker: {
    backgroundColor: 'rgba(255, 183, 3, 0.08)',
    border: '1px solid rgba(255, 183, 3, 0.3)',
    borderRadius: '16px',
    padding: '1.2rem 1.5rem',
    marginBottom: '2rem',
  },
  tickerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: 700,
    fontSize: '1.05rem',
    color: '#ffb703',
    marginBottom: '0.8rem',
  },
  tickerTitle: {
    letterSpacing: '0.5px',
  },
  tickerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  notifItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.95rem',
    color: '#fef08a',
  },
  notifBullet: {
    color: '#ffb703',
    fontSize: '1.2rem',
  },
  notifTime: {
    marginLeft: 'auto',
    fontSize: '0.8rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  messageBanner: {
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    border: '1px solid',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 600,
  },
  controlsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
    marginBottom: '2rem',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: '1.2rem 1.5rem',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  tabButtons: {
    display: 'flex',
    gap: '1rem',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.7rem 1.5rem',
    borderRadius: '30px',
    border: '1px solid rgba(204, 219, 113, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.95rem',
  },
  datePickerContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  dateLabel: {
    marginRight: '10px',
    fontWeight: 600,
    fontSize: '0.95rem',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dateInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    padding: '0.6rem 1rem',
    borderRadius: '10px',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer',
    colorScheme: 'dark',
  },
  bookingSection: {},
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    marginBottom: '2rem',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  courtsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '2rem',
  },
  courtCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '1.8rem',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  },
  courtCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '1rem',
    marginBottom: '1.5rem',
  },
  courtHeaderIcon: {
    fontSize: '1.8rem',
    color: 'var(--accent)',
  },
  dateBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: '0.3rem 0.8rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  slotsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  slotRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.9rem 1.2rem',
    borderRadius: '14px',
    border: '1px solid',
    transition: 'all 0.2s ease',
  },
  slotTimeInfo: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  bookButton: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'var(--accent)',
    color: '#000000',
    border: 'none',
    padding: '0.5rem 1.2rem',
    borderRadius: '20px',
    fontWeight: 700,
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  myBookingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    color: '#fde047',
    padding: '0.3rem 0.8rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  cancelSmallBtn: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    color: '#ffffff',
    border: 'none',
    padding: '0.25rem 0.6rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  bookedBadge: {
    display: 'flex',
    alignItems: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  myBookingsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '2rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  bookingsTableContainer: {
    overflowX: 'auto',
    marginTop: '1.5rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  statusTag: {
    display: 'inline-block',
    padding: '0.3rem 0.8rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 700,
    border: '1px solid',
  },
  cancelTableBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    padding: '0.4rem 0.9rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modalContent: {
    backgroundColor: '#121212',
    border: '1px solid rgba(204, 219, 113, 0.3)',
    borderRadius: '24px',
    padding: '2rem',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
  },
  modalSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    padding: '1.2rem',
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.95rem',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  modalCancelBtn: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    padding: '0.7rem 1.5rem',
    borderRadius: '12px',
    cursor: 'pointer',
  },
  modalConfirmBtn: {
    backgroundColor: 'var(--accent)',
    border: 'none',
    color: '#000000',
    padding: '0.7rem 1.5rem',
    borderRadius: '12px',
    fontWeight: 700,
    cursor: 'pointer',
  }
};

export default CourtBookingPage;
