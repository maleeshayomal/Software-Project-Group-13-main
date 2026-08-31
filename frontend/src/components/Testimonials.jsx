import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import courtImg from '../assets/badminton_court.jpg';
import actionImg from '../assets/badminton_action.jpg';
import fitnessImg from '../assets/badminton_fitness.jpg';
import juniorsImg from '../assets/badminton_juniors.jpg';

const testimonials = [
  {
    name: 'Chanul vihanga',
    role: 'Royal college Colombo Badminton player',
    text: 'I like to make this time as an opportunity to say thank you to my coach Mr.Prabash Indrajith for Discovering success.From my first daay till now my coach help me to improve my skills.There is an other factor that helps badminton players to improve their skills.It is the badminton court that certain player practice.my coach given the opportunity to play in an international standard court for anyone who want to play badminton.',
    rating: 5,
    image: actionImg,
    stat: 'Top 10 National Rank'
  },
  {
    name: 'Lahiru Dahanayake',
    role: 'Amateur Tournament Winner',
    text: 'The complex has 2 badminton courts with newly build carpeted area for better experienced on courts. Well maintained, good lighting, with ample parking facility. There is a badminton shop within the premises convenient for players and a snack bar.',
    rating: 5,
    image: fitnessImg,
    stat: 'Division B Champion'
  },
  {
    name: 'Dhananjana Kongahawatte',
    role: 'Parent of Junior Squad Member',
    text: 'Well maintained stadium with newly carpeted badminton courts with well experienced coaches, also consists of a badminton shop and a snack bar.',
    rating: 5,
    image: juniorsImg,
    stat: 'Under-15 Squad'
  }
];

const Testimonials = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Deep section background parallax
  const bgImageY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const headerY = useTransform(scrollYProgress, [0, 1], ["40%", "-40%"]);
  const floatElementY = useTransform(scrollYProgress, [0, 1], ["80%", "-80%"]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <span key={index} style={{ color: index < rating ? 'var(--accent)' : '#444', fontSize: '1.2rem' }}>
        ★
      </span>
    ));
  };

  return (
    <section ref={containerRef} style={styles.section}>
      {/* Background removed to make section transparent */}

      <div style={styles.container}>
        <motion.div
          style={{ ...styles.header, y: headerY }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span style={styles.tagline}>COMMUNITY & EXCELLENCE</span>
          <h2 style={styles.title}>Member Success Stories</h2>
          <div style={styles.divider}></div>
          <p style={styles.subtitle}>See how Yamundra is elevating players from grassroots to gold medals.</p>
        </motion.div>

        <div style={styles.grid}>
          {testimonials.map((testimonial, index) => {
            // Staggered parallax rate for each testimonial card
            const cardY = useTransform(scrollYProgress, [0, 1], [`${30 + (index * 20)}%`, `-${30 + (index * 20)}%`]);

            return (
              <motion.div
                key={index}
                style={{ ...styles.card, y: cardY }}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -10, borderColor: 'rgba(96, 131, 205, 0.4)', transition: { duration: 0.2 } }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.rating}>{renderStars(testimonial.rating)}</div>
                  <span style={styles.statBadge}>{testimonial.stat}</span>
                </div>

                <div style={styles.quoteMark}>"</div>
                <p style={styles.text}>{testimonial.text}</p>

                <div style={styles.author}>
                  <div
                    style={{
                      ...styles.avatar,
                      backgroundImage: `url(${testimonial.image})`
                    }}
                  />
                  <div>
                    <h4 style={styles.name}>{testimonial.name}</h4>
                    <p style={styles.role}>{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Floating decorative element with inverse parallax */}
        <motion.div style={{ ...styles.floatingQuote, y: floatElementY }}>
          <span>🏸 "Badminton is not just a game, it's a way of life at Yamundra."</span>
        </motion.div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '9rem 5%',
    position: 'relative',
    overflow: 'hidden',
  },
  parallaxBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '140%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'brightness(0.3) blur(2px)',
    zIndex: 0,
  },
  bgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at center, rgba(18,18,18,0.7) 0%, rgba(18,18,18,0.95) 100%)',
    zIndex: 1,
  },
  container: {
    maxWidth: '1250px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
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
  },
  card: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '20px',
    padding: '2.5rem',
    position: 'relative',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  rating: {
    display: 'flex',
    gap: '0.2rem',
  },
  statBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--primary)',
    backgroundColor: 'rgba(96, 131, 205, 0.15)',
    padding: '0.35rem 0.8rem',
    borderRadius: '20px',
    letterSpacing: '0.5px',
  },
  quoteMark: {
    position: 'absolute',
    top: '3.5rem',
    right: '2rem',
    fontSize: '6rem',
    fontFamily: 'serif',
    color: 'rgba(255,255,255,0.04)',
    lineHeight: 1,
    pointerEvents: 'none',
  },
  text: {
    fontSize: '1.08rem',
    color: 'var(--text-main)',
    lineHeight: 1.7,
    fontStyle: 'italic',
    marginBottom: '2.5rem',
    position: 'relative',
    zIndex: 2,
    flex: 1,
  },
  author: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
  avatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    border: '2px solid var(--accent)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  },
  name: {
    fontSize: '1.15rem',
    fontWeight: 700,
    color: 'var(--text-main)',
    marginBottom: '0.2rem',
  },
  role: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  floatingQuote: {
    textAlign: 'center',
    marginTop: '6rem',
    fontSize: '1.2rem',
    fontWeight: 600,
    color: 'var(--accent)',
    letterSpacing: '1px',
    padding: '1.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '50px',
    maxWidth: '700px',
    margin: '6rem auto 0 auto',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  }
};

export default Testimonials;
