import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import courtImg from '../assets/badminton_court.jpg';

const ContactUs = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const headerY = useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]);
  const infoY = useTransform(scrollYProgress, [0, 1], ["50%", "-30%"]);
  const formY = useTransform(scrollYProgress, [0, 1], ["80%", "-50%"]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for reaching out! A Yamundra Academy representative will contact you shortly.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section ref={containerRef} style={styles.section}>
      <div style={styles.container}>
        <motion.div
          style={{ ...styles.header, y: headerY }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span style={styles.tagline}>CONNECT WITH US</span>
          <h2 style={styles.title}>Get In Touch</h2>
          <div style={styles.divider}></div>
          <p style={styles.subtitle}>Have questions about membership, court bookings, or coaching? We're here to help.</p>
        </motion.div>

        <div style={styles.content}>
          {/* Left Side: Parallax Image Showcase Card with Contact Details */}
          <motion.div
            style={{ ...styles.contactCard, y: infoY }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            {/* Background Parallax Image */}
            <motion.div
              style={{
                ...styles.contactBgImage,
                backgroundImage: `url(${courtImg})`,
                y: imageY
              }}
            />
            <div style={styles.cardOverlay} />

            <div style={styles.contactDetailsWrapper}>
              <h3 style={styles.cardHeaderTitle}>Yamundra Arena HQ</h3>
              <p style={styles.cardHeaderSubtitle}>Visit our state-of-the-art badminton complex.</p>

              <div style={styles.infoList}>
                <div style={styles.infoBlock}>
                  <div style={styles.iconWrapper}>📍</div>
                  <div>
                    <h4 style={styles.infoTitle}>Our Location</h4>
                    <p style={styles.infoText}>Kohumola watta, Malagama, Wadduwa<br />Metropolis, NY 10001</p>
                  </div>
                </div>

                <div style={styles.infoBlock}>
                  <div style={styles.iconWrapper}>📞</div>
                  <div>
                    <h4 style={styles.infoTitle}>Phone Number</h4>
                    <p style={styles.infoText}>+1 (555) 123-4567<br />Mon-Sun, 6am - 10pm</p>
                  </div>
                </div>

                <div style={styles.infoBlock}>
                  <div style={styles.iconWrapper}>✉️</div>
                  <div>
                    <h4 style={styles.infoTitle}>Email Address</h4>
                    <p style={styles.infoText}>info@yamundra.lk</p>
                  </div>
                </div>
              </div>

              <div style={styles.facilityBadge}>
                <span>🏸 10 BWF Synthetic Courts • Pro Shop • Cafeteria</span>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Glassmorphic Contact Form */}
          <motion.div
            style={{ ...styles.formContainer, y: formY }}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h3 style={styles.formTitle}>Send Us a Message</h3>
            <p style={styles.formSubtitle}>We respond to all inquiries within 24 hours.</p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div className="input-group">
                <label htmlFor="contact-name">Full Name</label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  className="input-field"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="contact-email">Email Address</label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  className="input-field"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="contact-message">Your Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  className="input-field"
                  placeholder="Tell us about your skill level or what service you are interested in..."
                  rows="5"
                  style={{ resize: 'vertical' }}
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', marginTop: '0.5rem' }}>
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '9rem 5%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  container: {
    maxWidth: '1250px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '5rem',
  },
  tagline: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--accent)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
    display: 'block',
  },
  title: {
    fontSize: '3.2rem',
    fontWeight: 800,
    marginBottom: '1rem',
    color: 'var(--text-main)',
  },
  divider: {
    width: '70px',
    height: '4px',
    backgroundColor: 'var(--accent)',
    margin: '0 auto 1.5rem auto',
    borderRadius: '2px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: 'var(--text-muted)',
    maxWidth: '600px',
    margin: '0 auto',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
    gap: '3.5rem',
    alignItems: 'stretch',
  },
  contactCard: {
    position: 'relative',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
  },
  contactBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '140%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    zIndex: 0,
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(18,18,18,0.92) 0%, rgba(18,18,18,0.75) 50%, rgba(18,18,18,0.95) 100%)',
    zIndex: 1,
  },
  contactDetailsWrapper: {
    position: 'relative',
    zIndex: 2,
    padding: '3rem 2.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1,
  },
  cardHeaderTitle: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#ffffff',
    marginBottom: '0.4rem',
  },
  cardHeaderSubtitle: {
    fontSize: '1.05rem',
    color: 'var(--accent)',
    marginBottom: '2.5rem',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    marginBottom: '2.5rem',
  },
  infoBlock: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.5rem',
  },
  iconWrapper: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    backgroundColor: 'rgba(204, 219, 113, 0.15)',
    border: '1px solid rgba(204, 219, 113, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    flexShrink: 0,
  },
  infoTitle: {
    fontSize: '1.15rem',
    fontWeight: 700,
    marginBottom: '0.4rem',
    color: 'var(--text-main)',
  },
  infoText: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
  },
  facilityBadge: {
    padding: '1rem 1.2rem',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    textAlign: 'center',
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-main)',
  },
  formContainer: {
    backgroundColor: 'rgba(30, 30, 30, 0.55)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    padding: '3rem 2.5rem',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: '1.8rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: '0.4rem',
  },
  formSubtitle: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  }
};

export default ContactUs;
