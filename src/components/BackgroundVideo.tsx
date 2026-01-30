import React from 'react';

interface BackgroundVideoProps {
  opacity: number;
  isPlaying: boolean;
}

/**
 * Background video component that plays Subway Surfers gameplay
 * Provides visual stimulation for ADHD focus while reading
 */
const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ opacity, isPlaying }) => {
  // Using a long Subway Surfers gameplay video (no commentary, just gameplay)
  // This is a 1-hour gameplay video that loops well
  const videoId = 'XxGkYfCijNE';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: opacity,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '177.78vh', // 16:9 aspect ratio
          height: '100vh',
          minWidth: '100%',
          minHeight: '56.25vw', // 16:9 aspect ratio
          border: 'none',
          pointerEvents: 'none',
        }}
        allow="autoplay; encrypted-media"
        allowFullScreen
        title="Background gameplay video"
      />
    </div>
  );
};

export default BackgroundVideo;
