import React from 'react';
import logoImg from '../assets/logo.png';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.topSection}>
          <div style={styles.brand}>
            <div style={styles.logoContainer}>
              <img src={logoImg} alt="Yamundra Logo" style={styles.logoImage} />
              <h3 style={styles.logo}>Yamundra Academy</h3>
            </div>
            <p style={styles.description}>
              Empowering athletes to reach their full potential on and off the court.
            </p>
          </div>
          
          <div style={styles.linksSection}>
            <h4 style={styles.linksTitle}>Quick Links</h4>
            <ul style={styles.linkList}>
              <li><a href="#" style={styles.link}>Home</a></li>
              <li><a href="#" style={styles.link}>About Us</a></li>
              <li><a href="#" style={styles.link}>Services</a></li>
              <li><a href="#" style={styles.link}>Coaches</a></li>
            </ul>
          </div>
          
          <div style={styles.linksSection}>
            <h4 style={styles.linksTitle}>Support</h4>
            <ul style={styles.linkList}>
              <li><a href="#" style={styles.link}>FAQ</a></li>
              <li><a href="#" style={styles.link}>Contact</a></li>
              <li><a href="#" style={styles.link}>Privacy Policy</a></li>
              <li><a href="#" style={styles.link}>Terms of Service</a></li>
            </ul>
          </div>
          
          <div style={styles.socialSection}>
            <h4 style={styles.linksTitle}>Follow Us</h4>
            <div style={styles.socialIcons}>
              <a href="#" style={styles.socialIcon} aria-label="Facebook">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" style={styles.socialIcon} aria-label="Twitter">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" style={styles.socialIcon} aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" style={styles.socialIcon} aria-label="YouTube">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>
        </div>
        
        <div style={styles.bottomSection}>
          <p style={styles.copyright}>
            &copy; {new Date().getFullYear()} Yamundra Badminton Academy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#0a0a0a',
    padding: '4rem 5% 2rem 5%',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  topSection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4rem',
    marginBottom: '3rem',
    justifyContent: 'space-between',
  },
  brand: {
    flex: '1 1 300px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  logoImage: {
    height: '52px',
    width: 'auto',
    objectFit: 'contain',
    backgroundColor: '#ffffff',
    padding: '4px 8px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--primary)',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  description: {
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    fontSize: '0.95rem',
  },
  linksSection: {
    flex: '1 1 150px',
  },
  linksTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '1.5rem',
  },
  linkList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  },
  link: {
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  socialSection: {
    flex: '1 1 200px',
  },
  socialIcons: {
    display: 'flex',
    gap: '1rem',
  },
  socialIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#fff',
    transition: 'all 0.3s ease',
  },
  bottomSection: {
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '2rem',
    textAlign: 'center',
  },
  copyright: {
    color: '#666',
    fontSize: '0.9rem',
  }
};

export default Footer;
