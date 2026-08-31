import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars } from 'react-icons/fa';
import logoImg from '../assets/logo.png';
import NotificationCenter from './Notification';

const Navbar = ({ onLoginClick, user, onLogout, onNavigate, currentView = 'home' }) => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 880);
      if (window.innerWidth > 880) {
        setMobileMenuOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      if (currentView === 'home') {
        const sections = ['about', 'services', 'testimonials', 'contact'];
        let current = 'home';
        
        for (const section of sections) {
          const el = document.getElementById(section);
          if (el) {
            const rect = el.getBoundingClientRect();
            // If the section top is less than a third of the viewport height down, consider it active
            if (rect.top <= window.innerHeight / 3) {
              current = section;
            }
          }
        }
        setActiveSection(current);
      }
    };
    
    // Call once to set initial state
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: offsetTop - 80, // Adjust for navbar height
        behavior: 'smooth'
      });
    }
  };

  const handleNavClick = (view, sectionId = null) => {
    if (onNavigate) onNavigate(view);
    if (sectionId) {
      setTimeout(() => {
        scrollTo(sectionId);
      }, 150);
    } else if (view === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', action: () => handleNavClick('home') },
    { id: 'about', label: 'About', action: () => handleNavClick('home', 'about') },
    { id: 'services', label: 'Services', action: () => handleNavClick('home', 'services') },
    { id: 'testimonials', label: 'Testimonials', action: () => handleNavClick('home', 'testimonials') },
    { id: 'contact', label: 'Contact', action: () => handleNavClick('home', 'contact') },
    { id: 'training', label: 'Training & Tournaments', action: () => handleNavClick('training'), isSpecial: true },
    { id: 'court-booking', label: 'Court Booking', action: () => handleNavClick('court-booking'), isSpecial: true },
    { id: 'shop', label: 'Pro Shop', action: () => handleNavClick('shop'), isSpecial: true },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        ...styles.navbar,
        backgroundColor: scrolled || currentView !== 'home' ? 'rgba(15, 15, 15, 0.92)' : 'transparent',
        backdropFilter: scrolled || currentView !== 'home' ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled || currentView !== 'home' ? 'blur(16px)' : 'none',
        borderBottom: scrolled || currentView !== 'home' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
        boxShadow: scrolled || currentView !== 'home' ? '0 4px 30px rgba(0, 0, 0, 0.5)' : 'none',
      }}
    >
      <div style={styles.logoContainer} onClick={() => handleNavClick('home')}>
        <img src={logoImg} alt="Yamundra Badminton Academy Logo" style={styles.logoImage} />
        <span style={styles.logo}>Yamundra</span>
      </div>

      {!isMobile && (
        <motion.div
          style={styles.linksContainer}
          onMouseLeave={() => setHoveredTab(null)}
          whileHover={{
            backgroundColor: 'rgba(255, 255, 255, 0.07)',
            borderColor: 'rgba(255, 255, 255, 0.18)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
            transition: { duration: 0.3 }
          }}
        >
          {navItems.map((item) => {
            const isActive = (currentView === 'home' && item.id === activeSection) || 
                             (item.id === 'shop' && currentView === 'shop') || 
                             (item.id === 'training' && currentView === 'training') ||
                             (item.id === 'court-booking' && currentView === 'court-booking');
            const isHovered = hoveredTab === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={item.action}
                onMouseEnter={() => setHoveredTab(item.id)}
                style={{
                  ...styles.link,
                  position: 'relative',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '30px',
                  color: isActive || isHovered ? (item.isSpecial ? 'var(--accent)' : '#ffffff') : 'var(--text-main)',
                  fontWeight: isActive || isHovered ? 700 : 500,
                  zIndex: 1,
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Floating pill background on hover */}
                {isHovered && (
                  <motion.div
                    layoutId="navHoverPill"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: item.isSpecial ? 'rgba(204, 219, 113, 0.25)' : 'rgba(255, 255, 255, 0.16)',
                      borderRadius: '30px',
                      border: item.isSpecial ? '1px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: item.isSpecial ? '0 0 18px rgba(204, 219, 113, 0.35)' : '0 4px 15px rgba(0, 0, 0, 0.3)',
                      zIndex: -1,
                    }}
                  />
                )}

                {/* Active indicator pill background when not hovered */}
                {isActive && !isHovered && (
                  <motion.div
                    layoutId="navActivePill"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: item.isSpecial ? 'rgba(204, 219, 113, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '30px',
                      border: item.isSpecial ? '1px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.12)',
                      zIndex: -1,
                    }}
                  />
                )}

                <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      <div style={styles.rightSection}>
        {isMobile && (
          <div style={styles.mobileMenuContainer}>
            <button style={styles.hamburgerBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <FaBars />
            </button>
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={styles.mobileDropdown}
                >
                  <button style={styles.dropdownItem} onClick={() => { handleNavClick('home'); setMobileMenuOpen(false); }}>Home</button>
                  <button style={styles.dropdownItem} onClick={() => { handleNavClick('home', 'about'); setMobileMenuOpen(false); }}>About</button>
                  <button style={styles.dropdownItem} onClick={() => { handleNavClick('home', 'services'); setMobileMenuOpen(false); }}>Services</button>
                  <button style={styles.dropdownItem} onClick={() => { handleNavClick('home', 'testimonials'); setMobileMenuOpen(false); }}>Testimonials</button>
                  <button style={styles.dropdownItem} onClick={() => { handleNavClick('home', 'contact'); setMobileMenuOpen(false); }}>Contact</button>
                  <button style={styles.dropdownItem} onClick={() => { handleNavClick('training'); setMobileMenuOpen(false); }}>Training & Tournaments</button>
                  <div style={styles.dropdownDivider}></div>
                  <button style={{ ...styles.dropdownItem, color: 'var(--accent)', fontWeight: 700 }} onClick={() => { handleNavClick('court-booking'); setMobileMenuOpen(false); }}>Court Booking</button>
                  <button style={{ ...styles.dropdownItem, color: 'var(--accent)', fontWeight: 700 }} onClick={() => { handleNavClick('shop'); setMobileMenuOpen(false); }}>Pro Shop</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div style={styles.authContainer}>
          {user && <NotificationCenter />}
          {user ? (
            <div style={styles.userMenu}>
              <motion.div
                style={styles.avatar}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {user.username.charAt(0).toUpperCase()}
              </motion.div>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={styles.dropdown}
                  >
                    <div style={styles.dropdownHeader}>
                      <span style={styles.userName}>{user.username}</span>
                    </div>
                    <div style={styles.dropdownDivider}></div>
                    <motion.button
                      style={styles.dropdownItem}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                      onClick={() => {
                        if (onNavigate) onNavigate('account');
                        setDropdownOpen(false);
                      }}
                    >
                      Manage account
                    </motion.button>
                    {user.role === 'admin' && (
                      <>
                        <div style={styles.dropdownDivider}></div>
                        <motion.button
                          style={styles.dropdownItem}
                          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                          onClick={() => {
                            if (onNavigate) onNavigate('admin');
                            setDropdownOpen(false);
                          }}
                        >
                          Admin Panel
                        </motion.button>
                      </>
                    )}
                    <div style={styles.dropdownDivider}></div>
                    <motion.button
                      style={{ ...styles.dropdownItem, color: '#ff6b6b' }}
                      whileHover={{ backgroundColor: 'rgba(255, 107, 107, 0.1)' }}
                      onClick={() => {
                        onLogout();
                        setDropdownOpen(false);
                      }}
                    >
                      Log out
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              onClick={onLoginClick}
              style={styles.loginBtn}
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.15)'
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Log In
            </motion.button>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

const styles = {
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '80px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 5%',
    zIndex: 100,
    transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease, border-bottom 0.3s ease, box-shadow 0.3s ease',
  },
  logoContainer: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoImage: {
    height: '52px',
    width: 'auto',
    objectFit: 'contain',
    backgroundColor: '#ffffff',
    padding: '3px 6px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: 'var(--primary)',
    letterSpacing: '-0.5px',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  linksContainer: {
    display: 'flex',
    gap: '0.35rem',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: '0.35rem 0.55rem',
    borderRadius: '40px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(12px)',
    transition: 'all 0.3s ease',
  },
  link: {
    background: 'none',
    border: 'none',
    color: 'var(--text-main)',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    outline: 'none',
  },
  authContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  loginBtn: {
    padding: '0.55rem 1.6rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-main)',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '30px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  userMenu: {
    position: 'relative',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: '2px solid rgba(255, 255, 255, 0.1)',
  },
  dropdown: {
    position: 'absolute',
    top: '55px',
    right: 0,
    backgroundColor: 'rgba(25, 25, 25, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '0.5rem',
    minWidth: '200px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
  },
  dropdownHeader: {
    padding: '0.75rem 1rem',
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    color: 'var(--text-main)',
    fontSize: '1.05rem',
    fontWeight: '600',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: '0.25rem 0',
  },
  dropdownItem: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-main)',
    padding: '0.75rem 1rem',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: '8px',
    fontSize: '0.95rem',
    transition: 'background-color 0.2s',
  },
  mobileMenuContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  hamburgerBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-main)',
    fontSize: '1.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileDropdown: {
    position: 'absolute',
    top: '55px',
    right: 0,
    backgroundColor: 'rgba(25, 25, 25, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '0.5rem',
    minWidth: '160px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
  }
};

export default Navbar;
