import React from 'react';
import MoltenMetal from './MoltenMetal';

const GlobalBackground = () => {
  return (
    <div style={styles.fixedBackground}>
      <MoltenMetal
        color1="#5483cd"
        color2="#94c64b"
        color3="#FFFFFF"
        speed={0.2}
        scale={4}
        detail={3}
        glow={1.6}
        coreSize={0.1}
        swirl={1}
        fold={-0.2}
        blackPoint={0.05}
        brightness={1.3}
        colorMode="molten"
        grain={true}
        grainIntensity={0.05}
        mouseInteraction={false}
        mouseStrength={0.3}
        opacity={1.0}
      />
    </div>
  );
};

const styles = {
  fixedBackground: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: -1,
    overflow: 'hidden',
    backgroundColor: '#0a0a0a',
    opacity: 0.75,
  }
};

export default GlobalBackground;
