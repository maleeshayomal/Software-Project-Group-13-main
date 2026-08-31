import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserFriends, FaUser, FaTrophy, FaCalendarAlt, FaMedal } from 'react-icons/fa';
import actionImg from '../assets/badminton_action.jpg';
import playerImg from '../assets/badminton_player.jpg';
import juniorsImg from '../assets/badminton_juniors.jpg';
import smashImg from '../assets/badminton_smash.jpg';

const TrainingTournamentsPage = ({ onLoginClick, user }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const coaches = [
    {
      name: 'Michael Chen',
      role: 'Head Coach',
      experience: '15+ Years',
      image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Former national champion specializing in tactical play and advanced footwork.'
    },
    {
      name: 'Sarah Jenkins',
      role: 'Assistant Coach',
      experience: '8 Years',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Expert in junior development and strength conditioning.'
    },
    {
      name: 'David Lee',
      role: 'Assistant Coach',
      experience: '10 Years',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      description: 'Specializes in doubles strategies and explosive power training.'
    }
  ];

  const tournaments = [
    {
      id: 1,
      title: 'Yamundra Summer Open',
      date: 'Aug 15 - Aug 17, 2026',
      categories: 'Men\'s & Women\'s Singles, Doubles',
      prize: '$5,000 Pool',
      status: 'Open for Registration'
    },
    {
      id: 2,
      title: 'City Junior Championship',
      date: 'Sep 05 - Sep 06, 2026',
      categories: 'U13, U15, U17 Boys & Girls',
      prize: 'Trophies & Gear',
      status: 'Open for Registration'
    },
    {
      id: 3,
      title: 'Corporate Clash Tournament',
      date: 'Oct 10 - Oct 11, 2026',
      categories: 'Mixed Teams',
      prize: 'Corporate Cup',
      status: 'Upcoming'
    }
  ];

  return (
    <div style={styles.pageContainer}>
      {/* Hero Section */}
      <div style={styles.heroSection}>
        <div style={{ ...styles.heroBg, backgroundImage: `url(${actionImg})` }} />
        <div style={styles.heroOverlay} />
        <motion.div 
          style={styles.heroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span style={styles.heroTag}>ELEVATE YOUR GAME</span>
          <h1 style={styles.heroTitle}>Training & Tournaments</h1>
          <p style={styles.heroSubtitle}>
            Whether you're looking to refine your technique with our pro coaches or test your skills in competitive tournaments, we have the perfect platform for you.
          </p>
        </motion.div>
      </div>

      {/* Training Section */}
      <div style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>COACHING PROGRAMS</span>
            <h2 style={styles.sectionTitle}>Master the Court</h2>
            <div style={styles.divider}></div>
            <p style={styles.sectionDesc}>
              Our training programs are designed to cater to all skill levels. Choose the learning style that suits you best.
            </p>
          </div>

          <div style={styles.trainingGrid}>
            <motion.div 
              style={styles.trainingCard}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div style={styles.trainingImageContainer}>
                <div style={{...styles.trainingImage, backgroundImage: `url(${playerImg})`}} />
                <div style={styles.iconBadge}><FaUser /></div>
              </div>
              <div style={styles.trainingContent}>
                <h3 style={styles.trainingTitle}>Individual Practices</h3>
                <p style={styles.trainingDesc}>
                  One-on-one sessions tailored specifically to your needs. Perfect for correcting technique, learning advanced tactics, and focused physical conditioning.
                </p>
                <ul style={styles.featureList}>
                  <li>✓ Personalized training plans</li>
                  <li>✓ Video analysis & feedback</li>
                  <li>✓ Flexible scheduling</li>
                </ul>
                <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Book a Session</button>
              </div>
            </motion.div>

            <motion.div 
              style={styles.trainingCard}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div style={styles.trainingImageContainer}>
                <div style={{...styles.trainingImage, backgroundImage: `url(${juniorsImg})`}} />
                <div style={styles.iconBadge}><FaUserFriends /></div>
              </div>
              <div style={styles.trainingContent}>
                <h3 style={styles.trainingTitle}>Group Classes</h3>
                <p style={styles.trainingDesc}>
                  Join our energetic group sessions. Train with peers of similar skill levels, practice match situations, and improve your game in a fun, competitive environment.
                </p>
                <ul style={styles.featureList}>
                  <li>✓ Sparring opportunities</li>
                  <li>✓ Structured curriculum</li>
                  <li>✓ Affordable monthly packages</li>
                </ul>
                <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }}>View Schedule</button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Coaching Staff Section */}
      <div style={{...styles.section, backgroundColor: 'transparent'}}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>OUR EXPERTS</span>
            <h2 style={styles.sectionTitle}>Meet The Coaching Staff</h2>
            <div style={styles.divider}></div>
          </div>

          <div style={styles.coachesGrid}>
            {coaches.map((coach, index) => (
              <motion.div 
                key={index}
                style={styles.coachCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -10 }}
              >
                <div style={styles.coachImageWrapper}>
                  <img src={coach.image} alt={coach.name} style={styles.coachImage} />
                  <div style={styles.roleBadge}>{coach.role}</div>
                </div>
                <div style={styles.coachInfo}>
                  <h3 style={styles.coachName}>{coach.name}</h3>
                  <p style={styles.coachExp}>Experience: {coach.experience}</p>
                  <p style={styles.coachDesc}>{coach.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Tournaments Section */}
      <div style={styles.section}>
        <div style={styles.container}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>COMPETITION</span>
            <h2 style={styles.sectionTitle}>Upcoming Tournaments</h2>
            <div style={styles.divider}></div>
            <p style={styles.sectionDesc}>
              Ready to test your skills? Register for our upcoming local and regional tournaments.
            </p>
          </div>

          <div style={styles.tournamentsList}>
            {tournaments.map((tourney, index) => (
              <motion.div 
                key={tourney.id}
                style={styles.tournamentRow}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <div style={styles.tourneyDateBox}>
                  <FaCalendarAlt style={{ fontSize: '1.5rem', color: 'var(--accent)', marginBottom: '0.5rem' }} />
                  <div style={styles.tourneyDateText}>{tourney.date.split(',')[0]}</div>
                </div>
                <div style={styles.tourneyDetails}>
                  <h3 style={styles.tourneyTitle}>{tourney.title}</h3>
                  <div style={styles.tourneyMeta}>
                    <span><FaUserFriends style={{ marginRight: '0.4rem', color: 'var(--primary)' }}/> {tourney.categories}</span>
                    <span><FaTrophy style={{ marginRight: '0.4rem', color: '#ffd700' }}/> {tourney.prize}</span>
                  </div>
                </div>
                <div style={styles.tourneyAction}>
                  <div style={{
                    ...styles.statusBadge, 
                    backgroundColor: tourney.status === 'Open for Registration' ? 'rgba(204, 219, 113, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                    color: tourney.status === 'Open for Registration' ? 'var(--accent)' : 'var(--text-muted)'
                  }}>
                    {tourney.status}
                  </div>
                  {tourney.status === 'Open for Registration' && (
                    <button className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.9rem' }}>Register Now</button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <motion.div 
              style={styles.bannerContainer}
              whileHover={{ scale: 1.02 }}
            >
              <div style={{...styles.bannerBg, backgroundImage: `url(${smashImg})`}}></div>
              <div style={styles.bannerContent2}>
                <FaMedal style={{ fontSize: '3rem', color: '#ffd700', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#fff' }}>Want to host a tournament?</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>We offer facility rentals and tournament management services.</p>
                <button className="btn btn-secondary">Contact Us</button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    width: '100%',
    paddingTop: '80px', // account for navbar
    backgroundColor: 'transparent',
  },
  heroSection: {
    position: 'relative',
    height: '60vh',
    minHeight: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to bottom, rgba(18,18,18,0.7) 0%, rgba(18,18,18,1) 100%)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    maxWidth: '800px',
    padding: '0 2rem',
  },
  heroTag: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--accent)',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    marginBottom: '1rem',
    display: 'block',
  },
  heroTitle: {
    fontSize: '4rem',
    fontWeight: 800,
    color: '#ffffff',
    marginBottom: '1.5rem',
    lineHeight: 1.1,
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 1.6,
  },
  section: {
    padding: '6rem 5%',
  },
  container: {
    maxWidth: '1250px',
    margin: '0 auto',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  sectionTag: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--accent)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
    display: 'block',
  },
  sectionTitle: {
    fontSize: '2.8rem',
    fontWeight: 800,
    marginBottom: '1rem',
    color: 'var(--text-main)',
  },
  divider: {
    width: '70px',
    height: '4px',
    backgroundColor: 'var(--primary)',
    margin: '0 auto 1.5rem auto',
    borderRadius: '2px',
  },
  sectionDesc: {
    fontSize: '1.15rem',
    color: 'var(--text-muted)',
    maxWidth: '650px',
    margin: '0 auto',
  },
  trainingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '3rem',
  },
  trainingCard: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
  },
  trainingImageContainer: {
    position: 'relative',
    height: '250px',
  },
  trainingImage: {
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  iconBadge: {
    position: 'absolute',
    bottom: '-25px',
    right: '2rem',
    width: '60px',
    height: '60px',
    backgroundColor: 'var(--primary)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    color: '#fff',
    boxShadow: '0 5px 15px rgba(96, 131, 205, 0.4)',
    border: '4px solid var(--bg-card)',
  },
  trainingContent: {
    padding: '3rem 2rem 2rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  trainingTitle: {
    fontSize: '1.8rem',
    fontWeight: 700,
    marginBottom: '1rem',
    color: 'var(--text-main)',
  },
  trainingDesc: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
    lineHeight: 1.7,
    marginBottom: '1.5rem',
  },
  featureList: {
    listStyle: 'none',
    marginBottom: '2rem',
    flex: 1,
  },
  /* Need to target li inside featureList */
  coachesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2.5rem',
  },
  coachCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.4)',
    borderRadius: '16px',
    padding: '2rem',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'transform 0.3s ease',
  },
  coachImageWrapper: {
    position: 'relative',
    width: '140px',
    height: '140px',
    margin: '0 auto 1.5rem auto',
  },
  coachImage: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid rgba(255, 255, 255, 0.1)',
  },
  roleBadge: {
    position: 'absolute',
    bottom: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'var(--primary)',
    color: '#fff',
    padding: '0.3rem 1rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  coachInfo: {
    marginTop: '1.5rem',
  },
  coachName: {
    fontSize: '1.4rem',
    fontWeight: 700,
    marginBottom: '0.3rem',
    color: 'var(--text-main)',
  },
  coachExp: {
    fontSize: '0.9rem',
    color: 'var(--accent)',
    fontWeight: 600,
    marginBottom: '1rem',
  },
  coachDesc: {
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
  },
  tournamentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  tournamentRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.5rem 2rem',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'background-color 0.3s ease',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  tourneyDateBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '100px',
    paddingRight: '1.5rem',
    borderRight: '1px solid rgba(255,255,255,0.1)',
  },
  tourneyDateText: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    textAlign: 'center',
  },
  tourneyDetails: {
    flex: 1,
    minWidth: '250px',
  },
  tourneyTitle: {
    fontSize: '1.3rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: '#fff',
  },
  tourneyMeta: {
    display: 'flex',
    gap: '1.5rem',
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    flexWrap: 'wrap',
  },
  tourneyAction: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.8rem',
    minWidth: '150px',
  },
  statusBadge: {
    padding: '0.3rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  bannerContainer: {
    position: 'relative',
    borderRadius: '20px',
    overflow: 'hidden',
    padding: '4rem 2rem',
    display: 'inline-block',
    width: '100%',
    maxWidth: '900px',
  },
  bannerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'brightness(0.3) blur(2px)',
    zIndex: 1,
  },
  bannerContent2: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }
};

export default TrainingTournamentsPage;
