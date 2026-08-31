import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import courtImg from '../assets/badminton_court.jpg';
import playerImg from '../assets/badminton_player.jpg';
import smashImg from '../assets/badminton_smash.jpg';
import juniorsImg from '../assets/badminton_juniors.jpg';
import fitnessImg from '../assets/badminton_fitness.jpg';
import actionImg from '../assets/badminton_action.jpg';

const carouselImages = [
  {
    url: actionImg,
    title: 'Championship Jump Smash',
    subtitle: 'Experience world-class athletic power and precision'
  },
  {
    url: courtImg,
    title: 'BWF Approved Synthetic Courts',
    subtitle: 'Optimal LED lighting and shock-absorbing flooring'
  },
  {
    url: playerImg,
    title: 'Elite Coaching Academy',
    subtitle: 'Train under international badminton champions'
  },
  {
    url: smashImg,
    title: 'Precision & Racket Control',
    subtitle: 'Master the finer details of grip, tension, and shuttle dynamics'
  },
  {
    url: fitnessImg,
    title: 'Athletic Conditioning & Agility',
    subtitle: 'Specialized court drills to enhance stamina, reflexes, and core strength'
  },
  {
    url: juniorsImg,
    title: 'Junior Development Squads',
    subtitle: 'Empowering the next generation with fun, disciplined badminton training'
  }
];

const BadmintonCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef(null);

  // Parallax scrolling effect
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const translateY = useTransform(scrollYProgress, [0, 1], ["0%", "45%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + carouselImages.length) % carouselImages.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
  };

  return (
    <div 
      ref={containerRef}
      style={styles.carouselContainer}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div 
        style={{ ...styles.parallaxWrapper, y: translateY, scale, opacity }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            style={styles.slide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            <div 
              style={{
                ...styles.imageBackground,
                backgroundImage: `url(${carouselImages[currentIndex].url})`
              }} 
            />
            
            {/* Subtle floating badge for current slide */}
            <motion.div 
              style={styles.slideBadge}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <span style={styles.badgeIndex}>{currentIndex + 1} / {carouselImages.length}</span>
              <span style={styles.badgeText}>{carouselImages[currentIndex].title}</span>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Premium multi-layered gradient overlays for text readability and aesthetic integration */}
        <div style={styles.radialOverlay} />
        <div style={styles.gradientOverlay} />
      </motion.div>

      {/* Navigation Arrows */}
      <div style={styles.navArrows}>
        <button 
          onClick={handlePrev} 
          style={styles.arrowButton}
          aria-label="Previous Slide"
        >
          &#10094;
        </button>
        <button 
          onClick={handleNext} 
          style={styles.arrowButton}
          aria-label="Next Slide"
        >
          &#10095;
        </button>
      </div>

      {/* Navigation Dots */}
      <div style={styles.dotsContainer}>
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              ...styles.dot,
              backgroundColor: index === currentIndex ? 'var(--accent)' : 'rgba(255, 255, 255, 0.3)',
              width: index === currentIndex ? '32px' : '10px',
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

const styles = {
  carouselContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    overflow: 'hidden',
    backgroundColor: 'var(--bg-dark)',
  },
  parallaxWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  slide: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'contrast(1.05) saturate(1.1)',
  },
  radialOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at center, rgba(18, 18, 18, 0.2) 0%, rgba(18, 18, 18, 0.6) 80%, rgba(18, 18, 18, 0.9) 100%)',
    pointerEvents: 'none',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to bottom, rgba(18, 18, 18, 0.5) 0%, rgba(18, 18, 18, 0.3) 50%, var(--bg-dark) 100%)',
    pointerEvents: 'none',
  },
  slideBadge: {
    position: 'absolute',
    bottom: '120px',
    left: '5%',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.6rem 1.2rem',
    backgroundColor: 'rgba(18, 18, 18, 0.65)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '30px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    zIndex: 5,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  badgeIndex: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--accent)',
    letterSpacing: '1px',
    paddingRight: '0.75rem',
    borderRight: '1px solid rgba(255, 255, 255, 0.2)',
  },
  badgeText: {
    fontSize: '0.95rem',
    color: '#ffffff',
    fontWeight: '500',
    letterSpacing: '0.5px',
  },
  navArrows: {
    position: 'absolute',
    top: '50%',
    left: '0',
    right: '0',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 2.5%',
    transform: 'translateY(-50%)',
    zIndex: 5,
    pointerEvents: 'none',
  },
  arrowButton: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    backgroundColor: 'rgba(18, 18, 18, 0.45)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    pointerEvents: 'auto',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: '35px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '0.6rem',
    zIndex: 5,
    alignItems: 'center',
  },
  dot: {
    height: '10px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
  }
};

export default BadmintonCarousel;
