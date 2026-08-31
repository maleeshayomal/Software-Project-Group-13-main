import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import actionImg from '../assets/badminton_action.jpg';
import juniorsImg from '../assets/badminton_juniors.jpg';

const AboutUs = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax rates for different elements to create deep layered depth
  const headerY = useTransform(scrollYProgress, [0, 1], ["40%", "-40%"]);
  const mainImageY = useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]);
  const subImageY = useTransform(scrollYProgress, [0, 1], ["-20%", "40%"]);
  const badgeY = useTransform(scrollYProgress, [0, 1], ["60%", "-20%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["50%", "-30%"]);

  return (
    <section ref={containerRef} style={styles.section}>
      <div style={styles.container}>
        {/* Section Header */}
        <motion.div 
          style={{ ...styles.header, y: headerY }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span style={styles.tagline}>THE YAMUNDRA DIFFERENCE</span>
          <h2 style={styles.title}>About Yamundra Academy</h2>
          <div style={styles.divider}></div>
        </motion.div>

        {/* 2-Column Asymmetric Parallax Layout */}
        <div style={styles.grid}>
          {/* Left Column: Interactive Parallax Image Collage */}
          <div style={styles.imageCollage}>
            <motion.div 
              style={{ ...styles.mainImageCard, y: mainImageY }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div 
                style={{
                  ...styles.image,
                  backgroundImage: `url(${actionImg})`
                }} 
              />
              <div style={styles.imageOverlay} />
              <div style={styles.imageCaption}>Elite Jump Smash Mastery</div>
            </motion.div>

            <motion.div 
              style={{ ...styles.subImageCard, y: subImageY }}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div 
                style={{
                  ...styles.image,
                  backgroundImage: `url(${juniorsImg})`
                }} 
              />
            </motion.div>

            <motion.div 
              style={{ ...styles.floatingBadge, y: badgeY }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div style={styles.badgeIcon}>🏆</div>
              <div>
                <div style={styles.badgeTitle}>BWF Approved</div>
                <div style={styles.badgeSubtitle}>Championship Standard Courts</div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Narrative and Stats */}
          <motion.div style={{ ...styles.textContainer, y: textY }}>
            <p style={styles.leadText}>
              Founded with a passion for excellence, Yamundra Badminton Academy is the premier destination for players of all skill levels. Our mission is to nurture talent, promote sportsmanship, and build a vibrant community around the fastest racket sport in the world.
            </p>
            <p style={styles.text}>
              Whether you are a beginner looking to master footwork and grip basics or a high-performance athlete aiming for national tournaments, our international coaching staff provides tailored regimens. We believe in holistic development—combining physical agility, tactical court awareness, and mental toughness.
            </p>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
              <div style={styles.statBox}>
                <h3 style={styles.statNumber}>15+</h3>
                <p style={styles.statLabel}>Expert Coaches</p>
              </div>
              <div style={styles.statBox}>
                <h3 style={styles.statNumber}>10</h3>
                <p style={styles.statLabel}>Synthetic Courts</p>
              </div>
              <div style={styles.statBox}>
                <h3 style={styles.statNumber}>500+</h3>
                <p style={styles.statLabel}>Active Champions</p>
              </div>
            </div>
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
    position: 'relative',
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
    backgroundColor: 'var(--primary)',
    margin: '0 auto',
    borderRadius: '2px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '4rem',
    alignItems: 'center',
  },
  imageCollage: {
    position: 'relative',
    height: '520px',
    width: '100%',
    maxWidth: '550px',
    margin: '0 auto',
  },
  mainImageCard: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '78%',
    height: '420px',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  subImageCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '55%',
    height: '260px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.6)',
    border: '2px solid var(--bg-card)',
    zIndex: 2,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    transition: 'transform 0.5s ease',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%)',
  },
  imageCaption: {
    position: 'absolute',
    bottom: '1.5rem',
    left: '1.5rem',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '1.1rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  floatingBadge: {
    position: 'absolute',
    top: '30px',
    left: '-15px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.5rem',
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '16px',
    border: '1px solid rgba(204, 219, 113, 0.3)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
    zIndex: 3,
  },
  badgeIcon: {
    fontSize: '2rem',
  },
  badgeTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--accent)',
  },
  badgeSubtitle: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  leadText: {
    fontSize: '1.3rem',
    color: 'var(--text-main)',
    lineHeight: 1.7,
    fontWeight: 500,
    marginBottom: '1.5rem',
  },
  text: {
    fontSize: '1.1rem',
    color: 'var(--text-muted)',
    lineHeight: 1.8,
    marginBottom: '2.5rem',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  statNumber: {
    fontSize: '2.8rem',
    fontWeight: 800,
    color: 'var(--primary)',
    marginBottom: '0.3rem',
  },
  statLabel: {
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--text-muted)',
    fontWeight: 600,
  }
};

export default AboutUs;
