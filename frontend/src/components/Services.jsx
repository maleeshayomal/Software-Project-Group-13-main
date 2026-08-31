import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PiStudent, PiCalendarPlus, PiTrophy, PiStorefront, PiBarbell, PiUsers } from 'react-icons/pi';
import courtImg from '../assets/badminton_court.jpg';
import playerImg from '../assets/badminton_player.jpg';
import smashImg from '../assets/badminton_smash.jpg';
import juniorsImg from '../assets/badminton_juniors.jpg';
import fitnessImg from '../assets/badminton_fitness.jpg';
import actionImg from '../assets/badminton_action.jpg';

const services = [
  {
    title: 'Professional Coaching',
    description: 'Personalized training programs designed by world-class athletes to elevate your technique, footwork, and tactical awareness.',
    icon: <PiStudent />,
    image: actionImg,
    tag: 'TRAINING'
  },
  {
    title: 'Court Booking',
    description: 'Access to premium, BWF-approved synthetic courts with optimal LED anti-glare lighting and shock-absorbing flooring.',
    icon: <PiCalendarPlus />,
    image: courtImg,
    tag: 'FACILITIES'
  },
  {
    title: 'Tournament Hosting',
    description: 'Regular competitive leagues, ranking tournaments, and inter-academy championships to test your skills under pressure.',
    icon: <PiTrophy />,
    image: playerImg,
    tag: 'COMPETITION'
  },
  {
    title: 'Pro Shop & Stringing',
    description: 'On-site store offering the latest rackets, shoes, apparel, and electronic precision stringing services from top brands.',
    icon: <PiStorefront />,
    image: smashImg,
    tag: 'EQUIPMENT'
  },
  {
    title: 'Fitness & Conditioning',
    description: 'Dedicated badminton-specific fitness area with agility drills, core strength training, and injury prevention counseling.',
    icon: <PiBarbell />,
    image: fitnessImg,
    tag: 'FITNESS'
  },
  {
    title: 'Junior Academy',
    description: 'Structured, fun developmental programs for children and teenagers focusing on motor skills, discipline, and sportsmanship.',
    icon: <PiUsers />,
    image: juniorsImg,
    tag: 'YOUTH'
  }
];

// Sub-component for individual card parallax image
const ServiceCard = ({ service, index }) => {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  // Individual image parallax inside the card header
  const imageY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const cardY = useTransform(scrollYProgress, [0, 1], [`${30 + (index % 3) * 15}%`, `-${30 + (index % 3) * 15}%`]);

  return (
    <motion.div
      ref={cardRef}
      style={{ ...styles.card, y: cardY }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.15 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <div style={styles.imageContainer}>
        <motion.div
          style={{
            ...styles.cardImage,
            backgroundImage: `url(${service.image})`,
            y: imageY
          }}
        />
        <div style={styles.imageOverlay} />
        <span style={styles.tagBadge}>{service.tag}</span>
        <div style={styles.iconWrapper}>
          <span style={styles.icon}>{service.icon}</span>
        </div>
      </div>

      <div style={styles.cardContent}>
        <h3 style={styles.cardTitle}>{service.title}</h3>
        <p style={styles.cardDescription}>{service.description}</p>
        <div style={styles.learnMore}>
          <span>Learn More</span>
          <span style={styles.arrow}>→</span>
        </div>
      </div>
    </motion.div>
  );
};

const Services = ({ onNavigate }) => {
  const containerRef = useRef(null);
  const bannerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const { scrollYProgress: bannerScroll } = useScroll({
    target: bannerRef,
    offset: ["start end", "end start"]
  });

  const headerY = useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]);
  const bannerImageY = useTransform(bannerScroll, [0, 1], ["-25%", "25%"]);

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
          <span style={styles.tagline}>WHAT WE OFFER</span>
          <h2 style={styles.title}>Our Services & Facilities</h2>
          <div style={styles.divider}></div>
          <p style={styles.subtitle}>Comprehensive badminton offerings designed for the complete athlete.</p>
        </motion.div>

        <div style={styles.grid}>
          {services.map((service, index) => (
            <ServiceCard key={index} service={service} index={index} />
          ))}
        </div>

        {/* Parallax Featured Facility Banner */}
        <div ref={bannerRef} style={styles.parallaxBanner}>
          <motion.div
            style={{
              ...styles.bannerImage,
              backgroundImage: `url(${courtImg})`,
              y: bannerImageY
            }}
          />
          <div style={styles.bannerOverlay} />
          <motion.div
            style={styles.bannerContent}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span style={styles.bannerTag}>PRO EXPERIENCE</span>
            <h3 style={styles.bannerTitle}>Train on World-Class Synthetic Courts</h3>
            <p style={styles.bannerSubtitle}>
              Experience the difference of BWF-certified cushioning, zero-glare lighting, and climate-controlled indoor arenas.
            </p>
            <button
              className="btn btn-primary"
              style={{ padding: '0.9rem 2.2rem', marginTop: '1rem', cursor: 'pointer', border: 'none' }}
              onClick={() => {
                if (onNavigate) onNavigate('court-booking');
              }}
            >
              Book a Court Now
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '8rem 5%',
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
    backgroundColor: 'var(--secondary)',
    margin: '0 auto 1.5rem auto',
    borderRadius: '2px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: 'var(--text-muted)',
    maxWidth: '600px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '2.5rem',
    marginBottom: '6rem',
  },
  card: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
  },
  imageContainer: {
    position: 'relative',
    height: '220px',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '130%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'absolute',
    top: '-15%',
    left: 0,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(30,30,30,0.9) 100%)',
  },
  tagBadge: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    padding: '0.35rem 0.85rem',
    backgroundColor: 'rgba(18, 18, 18, 0.7)',
    backdropFilter: 'blur(8px)',
    borderRadius: '20px',
    color: 'var(--accent)',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '1px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  iconWrapper: {
    position: 'absolute',
    bottom: '-25px',
    right: '1.5rem',
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 20px rgba(96, 131, 205, 0.4)',
    zIndex: 2,
  },
  icon: {
    fontSize: '1.8rem',
    display: 'flex',
  },
  cardContent: {
    padding: '2.5rem 2rem 2rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  cardTitle: {
    fontSize: '1.4rem',
    fontWeight: 700,
    marginBottom: '0.85rem',
    color: 'var(--text-main)',
  },
  cardDescription: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    lineHeight: 1.7,
    marginBottom: '1.5rem',
    flex: 1,
  },
  learnMore: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--primary)',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'color 0.3s ease',
  },
  arrow: {
    transition: 'transform 0.3s ease',
  },
  parallaxBanner: {
    position: 'relative',
    height: '400px',
    borderRadius: '24px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  bannerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '150%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(18,18,18,0.85) 0%, rgba(96,131,205,0.4) 50%, rgba(18,18,18,0.85) 100%)',
  },
  bannerContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '750px',
    padding: '0 2rem',
  },
  bannerTag: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--accent)',
    letterSpacing: '2px',
    marginBottom: '0.75rem',
    display: 'block',
  },
  bannerTitle: {
    fontSize: '2.6rem',
    fontWeight: 800,
    color: '#ffffff',
    marginBottom: '1rem',
    lineHeight: 1.2,
  },
  bannerSubtitle: {
    fontSize: '1.15rem',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 1.6,
    marginBottom: '1.5rem',
  }
};

export default Services;
