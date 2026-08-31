import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChartBar, FaCalendarCheck, FaUsers, FaCalendarAlt, FaCog, FaShoppingCart } from 'react-icons/fa';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalBookingsToday: 0,
    courtsAvailableNow: 0,
    cancellationsToday: 0,
    registeredMembers: 0,
    proShopSalesToday: 0,
    proShopRevenueToday: 0
  });
  const [proSales, setProSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [members, setMembers] = useState([]);

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/stats?username=${user.username}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Courts
  const fetchCourts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/courts');
      if (res.ok) {
        const data = await res.json();
        setCourts(data.courts);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Bookings
  const fetchBookings = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/bookings?username=${user.username}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Pro Shop Sales
  const fetchProShopSales = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/pro-shop-sales?username=${user.username}&limit=200`);
      if (res.ok) {
        const data = await res.json();
        setProSales(data.sales || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Members
  const fetchMembers = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/members?username=${user.username}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchStats();
      fetchCourts();
      fetchBookings();
      fetchMembers();
      fetchProShopSales();
    }
  }, [user]);

  const handleCancelBooking = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const res = await fetch(`http://localhost:5000/api/admin/bookings/${id}/cancel?username=${user.username}`, {
          method: 'PUT'
        });
        if (res.ok) {
          fetchBookings();
          fetchStats();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleMemberStatus = async (username, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (window.confirm(`Are you sure you want to ${newStatus === 'suspended' ? 'suspend' : 'activate'} this member?`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/admin/members/${username}/status?username=${user.username}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
          fetchMembers();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview & Stats', icon: <FaChartBar />, color: '#0f766e' },
    { id: 'proshop', label: 'Pro Shop Sales', icon: <FaShoppingCart />, color: '#065f46' },
    { id: 'courts', label: 'Court Management', icon: <FaCog />, color: '#1d4ed8' },
    { id: 'bookings', label: 'Booking Management', icon: <FaCalendarCheck />, color: '#b45309' },
    { id: 'members', label: 'Member Management', icon: <FaUsers />, color: '#a16207' },
    { id: 'schedule', label: 'Schedule View', icon: <FaCalendarAlt />, color: '#4338ca' }
  ];

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h2 style={{ color: '#fff' }}>Admin Panel</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Welcome, {user.firstName}</p>
        </div>
        
        <div style={styles.navMenu}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.navItem,
                backgroundColor: activeTab === tab.id ? tab.color : 'transparent',
                borderLeft: activeTab === tab.id ? `4px solid #fff` : '4px solid transparent',
              }}
            >
              <span style={{ marginRight: '10px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <motion.button
            onClick={onLogout}
            whileHover={{ backgroundColor: 'rgba(248, 113, 113, 0.1)' }}
            style={{
              ...styles.navItem,
              width: '100%',
              color: '#f87171',
              backgroundColor: 'transparent',
              borderRadius: '8px'
            }}
          >
            Log Out
          </motion.button>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* TOP BAR */}
        <div style={styles.topbar}>
          <h2 style={{ color: '#fff' }}>{tabs.find(t => t.id === activeTab)?.label}</h2>
        </div>

        <div style={styles.contentArea}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div style={styles.overviewGrid}>
                  <div style={{...styles.statCard, backgroundColor: '#0f766e'}}>
                    <h3>Total bookings today</h3>
                    <div style={styles.statNumber}>{stats.totalBookingsToday}</div>
                  </div>
                  <div style={{...styles.statCard, backgroundColor: '#334155'}}>
                    <h3>Courts available now</h3>
                    <div style={styles.statNumber}>{stats.courtsAvailableNow}</div>
                  </div>
                  <div style={{...styles.statCard, backgroundColor: '#475569'}}>
                    <h3>Cancellations today</h3>
                    <div style={styles.statNumber}>{stats.cancellationsToday}</div>
                  </div>
                  <div style={{...styles.statCard, backgroundColor: '#3f3f46'}}>
                    <h3>Registered members</h3>
                    <div style={styles.statNumber}>{stats.registeredMembers}</div>
                  </div>
                  <div style={{...styles.statCard, backgroundColor: '#064e3b'}}>
                    <h3>Pro shop sales today</h3>
                    <div style={styles.statNumber}>{stats.proShopSalesToday || 0}</div>
                    <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Revenue: ${stats.proShopRevenueToday || 0}</div>
                  </div>
                </div>
              )}

              {/* COURTS TAB */}
              {activeTab === 'courts' && (
                <div style={{...styles.sectionCard, borderTop: '4px solid #1d4ed8'}}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ color: '#fff' }}>Courts List</h3>
                    <button className="btn btn-primary" style={{ backgroundColor: '#1d4ed8' }}>+ Add Court</button>
                  </div>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price/Hr</th>
                        <th>Hours</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courts.map(court => (
                        <tr key={court.id}>
                          <td>{court.id}</td>
                          <td>{court.name}</td>
                          <td>${court.price_per_hour}</td>
                          <td>{court.availability_hours}</td>
                          <td>
                            <span style={{ 
                              color: court.is_active ? '#4ade80' : '#f87171',
                              fontWeight: 'bold'
                            }}>
                              {court.is_active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td>
                            <button style={styles.actionBtn}>Edit</button>
                          </td>
                        </tr>
                      ))}
                      {courts.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No courts found</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              {/* BOOKINGS TAB */}
              {activeTab === 'bookings' && (
                <div style={{...styles.sectionCard, borderTop: '4px solid #b45309'}}>
                  <h3 style={{ color: '#fff', marginBottom: '1rem' }}>All Bookings</h3>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time Slot</th>
                        <th>Court</th>
                        <th>Member</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(b => (
                        <tr key={b.id}>
                          <td>{b.booking_date}</td>
                          <td>{b.time_slot}</td>
                          <td>{b.court_name}</td>
                          <td>{b.username}</td>
                          <td>
                            <span style={{ 
                              color: b.status === 'BOOKED' ? '#4ade80' : '#f87171' 
                            }}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            {b.status === 'BOOKED' && (
                              <button 
                                style={{...styles.actionBtn, color: '#f87171'}}
                                onClick={() => handleCancelBooking(b.id)}
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No bookings found</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              {/* MEMBERS TAB */}
              {activeTab === 'members' && (
                <div style={{...styles.sectionCard, borderTop: '4px solid #a16207'}}>
                  <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Registered Members</h3>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map(m => (
                        <tr key={m.username}>
                          <td>{m.username}</td>
                          <td>{m.firstName} {m.lastName}</td>
                          <td>{m.email}</td>
                          <td>{m.phone}</td>
                          <td>
                            <span style={{ 
                              color: m.status === 'active' ? '#4ade80' : '#f87171' 
                            }}>
                              {m.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <button 
                              style={{...styles.actionBtn, color: m.status === 'active' ? '#fbbf24' : '#4ade80'}}
                              onClick={() => handleToggleMemberStatus(m.username, m.status)}
                            >
                              {m.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {members.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No members found</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PRO SHOP TAB */}
              {activeTab === 'proshop' && (
                <div style={{...styles.sectionCard, borderTop: '4px solid #065f46'}}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ color: '#fff' }}>Pro Shop Sales</h3>
                      <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Track and view pro shop purchases.</p>
                    </div>
                    <div>
                      <button className="btn btn-primary" onClick={fetchProShopSales} style={{ backgroundColor: '#065f46' }}>Refresh</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{...styles.statCard, backgroundColor: '#065f46', flex: 1}}>
                      <h4>Sales Today</h4>
                      <div style={styles.statNumber}>{stats.proShopSalesToday || 0}</div>
                    </div>
                    <div style={{...styles.statCard, backgroundColor: '#064e3b', flex: 1}}>
                      <h4>Revenue Today</h4>
                      <div style={styles.statNumber}>${stats.proShopRevenueToday || 0}</div>
                    </div>
                  </div>

                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Buyer</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proSales.map(s => (
                        <tr key={s.id}>
                          <td>{s.id}</td>
                          <td>{s.purchase_date}</td>
                          <td>{s.product_name}</td>
                          <td>{s.quantity}</td>
                          <td>${s.price}</td>
                          <td>${s.total_price}</td>
                          <td>{s.username}</td>
                          <td>
                            <button style={styles.actionBtn} onClick={() => setSelectedSale(s)}>Details</button>
                          </td>
                        </tr>
                      ))}
                      {proSales.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center' }}>No sales found</td></tr>}
                    </tbody>
                  </table>

                  {selectedSale && (
                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                      <h4 style={{ color: '#fff' }}>Sale Details</h4>
                      <p style={{ color: 'var(--text-muted)' }}><strong>Product:</strong> {selectedSale.product_name} (ID: {selectedSale.product_id || 'N/A'})</p>
                      <p style={{ color: 'var(--text-muted)' }}><strong>Buyer:</strong> {selectedSale.username}</p>
                      <p style={{ color: 'var(--text-muted)' }}><strong>Quantity:</strong> {selectedSale.quantity} — <strong>Price:</strong> ${selectedSale.price} — <strong>Total:</strong> ${selectedSale.total_price}</p>
                      <p style={{ color: 'var(--text-muted)' }}><strong>Purchase Date:</strong> {selectedSale.purchase_date} — <strong>Recorded:</strong> {selectedSale.created_at}</p>
                      <div style={{ marginTop: '0.5rem' }}>
                        <button className="btn" onClick={() => setSelectedSale(null)} style={{ background: 'transparent', color: '#f87171' }}>Close</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SCHEDULE TAB */}
              {activeTab === 'schedule' && (
                <div style={{...styles.sectionCard, borderTop: '4px solid #4338ca'}}>
                  <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Daily Schedule</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Select a date to view the booking timeline.</p>
                  <input type="date" style={styles.dateInput} defaultValue={new Date().toISOString().split('T')[0]} />
                  <div style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Calendar timeline visualization will render here.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const styles = {
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    paddingTop: '80px', // account for global navbar if kept
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    position: 'relative',
    zIndex: 10
  },
  sidebar: {
    width: '280px',
    backgroundColor: 'rgba(25, 25, 25, 0.98)',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 80px)',
    position: 'fixed',
    left: 0
  },
  sidebarHeader: {
    padding: '2rem 1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem 0',
  },
  navItem: {
    padding: '1rem 1.5rem',
    color: '#fff',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  mainContent: {
    flex: 1,
    marginLeft: '280px',
    display: 'flex',
    flexDirection: 'column'
  },
  topbar: {
    padding: '1.5rem 3rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(20, 20, 20, 0.8)'
  },
  contentArea: {
    padding: '2rem 3rem',
    flex: 1,
    overflowY: 'auto'
  },
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem'
  },
  statCard: {
    padding: '2rem',
    borderRadius: '12px',
    color: '#fff',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginTop: '0.5rem'
  },
  sectionCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    color: 'var(--text-main)'
  },
  dateInput: {
    padding: '0.75rem 1rem',
    backgroundColor: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '1rem',
    colorScheme: 'dark',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent)',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: '0.25rem 0.5rem'
  }
};

// Add some global CSS for the table to avoid inline clutter
const tableCSS = `
  th { text-align: left; padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); }
  td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
  tr:hover td { background-color: rgba(255,255,255,0.02); }
`;
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = tableCSS;
  document.head.appendChild(style);
}

export default AdminDashboard;
