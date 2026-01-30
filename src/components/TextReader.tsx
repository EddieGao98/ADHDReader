import React, { useRef, useEffect, useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, BookOpen, Hash, Play, Pause } from 'lucide-react';
import type { TextChunk, ReaderSettings } from '../types';

interface TextReaderProps {
  chunks: TextChunk[];
  settings: ReaderSettings;
  title: string;
}

const TextReader: React.FC<TextReaderProps> = ({ chunks, settings, title }) => {
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<number | null>(null);

  // Theme styles
  const themeStyles = useMemo(() => {
    const themes = {
      light: {
        background: 'rgba(255, 255, 255, 0.95)',
        text: '#1a1a2e',
        textMuted: 'rgba(26, 26, 46, 0.6)',
        chunkBg: 'rgba(0, 0, 0, 0.03)',
        chunkActiveBg: 'rgba(0, 255, 136, 0.08)',
        chunkBorder: 'rgba(0, 0, 0, 0.08)',
        chunkActiveBorder: 'rgba(0, 255, 136, 0.3)',
        bold: '#000',
      },
      dark: {
        background: 'rgba(26, 26, 46, 0.95)',
        text: 'rgba(255, 255, 255, 0.9)',
        textMuted: 'rgba(255, 255, 255, 0.5)',
        chunkBg: 'rgba(255, 255, 255, 0.03)',
        chunkActiveBg: 'rgba(0, 255, 136, 0.08)',
        chunkBorder: 'rgba(255, 255, 255, 0.05)',
        chunkActiveBorder: 'rgba(0, 255, 136, 0.3)',
        bold: '#00ff88',
      },
      sepia: {
        background: 'rgba(244, 234, 213, 0.95)',
        text: '#433422',
        textMuted: 'rgba(67, 52, 34, 0.6)',
        chunkBg: 'rgba(67, 52, 34, 0.05)',
        chunkActiveBg: 'rgba(180, 140, 80, 0.15)',
        chunkBorder: 'rgba(67, 52, 34, 0.1)',
        chunkActiveBorder: 'rgba(180, 140, 80, 0.4)',
        bold: '#8B4513',
      },
    };
    return themes[settings.theme];
  }, [settings.theme]);

  // Scroll current chunk into view
  useEffect(() => {
    const chunkElements = containerRef.current?.querySelectorAll('.text-chunk');
    if (chunkElements && chunkElements[currentChunkIndex]) {
      chunkElements[currentChunkIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentChunkIndex]);

  // Auto-scroll functionality
  useEffect(() => {
    if (isAutoScrolling) {
      const scrollInterval = 6000 - settings.autoScrollSpeed * 50; // 1000ms to 5500ms
      autoScrollRef.current = window.setInterval(() => {
        setCurrentChunkIndex((prev) => {
          if (prev < chunks.length - 1) {
            return prev + 1;
          }
          setIsAutoScrolling(false);
          return prev;
        });
      }, scrollInterval);
    }

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [isAutoScrolling, settings.autoScrollSpeed, chunks.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j' || e.key === ' ') {
        e.preventDefault();
        setCurrentChunkIndex((prev) => Math.min(prev + 1, chunks.length - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        setCurrentChunkIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentChunkIndex(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentChunkIndex(chunks.length - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chunks.length]);

  const navigateChunk = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentChunkIndex((prev) => Math.max(prev - 1, 0));
    } else {
      setCurrentChunkIndex((prev) => Math.min(prev + 1, chunks.length - 1));
    }
  };

  const progress = ((currentChunkIndex + 1) / chunks.length) * 100;

  return (
    <div className="reader-container" style={{ background: themeStyles.background }}>
      {/* Header */}
      <div className="reader-header">
        <div className="reader-title">
          <BookOpen size={20} style={{ color: themeStyles.textMuted }} />
          <h1 style={{ color: themeStyles.text }}>{title}</h1>
        </div>
        <div className="reader-stats" style={{ color: themeStyles.textMuted }}>
          <Hash size={16} />
          <span>
            {currentChunkIndex + 1} / {chunks.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Main content */}
      <div className="reader-content" ref={containerRef}>
        {chunks.map((chunk, index) => {
          const isActive = index === currentChunkIndex;
          const distance = Math.abs(index - currentChunkIndex);
          const opacity = isActive ? 1 : Math.max(0.3, 1 - distance * 0.15);

          return (
            <div
              key={chunk.id}
              className={`text-chunk ${isActive ? 'active' : ''}`}
              style={{
                opacity,
                background: isActive ? themeStyles.chunkActiveBg : themeStyles.chunkBg,
                borderColor: isActive ? themeStyles.chunkActiveBorder : themeStyles.chunkBorder,
                color: themeStyles.text,
                fontSize: `${settings.fontSize}px`,
                lineHeight: settings.lineHeight,
                fontFamily: settings.fontFamily,
                ['--bold-color' as any]: themeStyles.bold,
              }}
              onClick={() => setCurrentChunkIndex(index)}
            >
              {settings.bionicEnabled ? (
                <span
                  className="bionic-text"
                  dangerouslySetInnerHTML={{ __html: chunk.bionicContent }}
                />
              ) : (
                <span>{chunk.content}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation controls */}
      <div className="reader-controls">
        <button
          className="nav-button"
          onClick={() => navigateChunk('prev')}
          disabled={currentChunkIndex === 0}
        >
          <ChevronUp size={24} />
        </button>

        <button
          className={`auto-scroll-button ${isAutoScrolling ? 'active' : ''}`}
          onClick={() => setIsAutoScrolling(!isAutoScrolling)}
        >
          {isAutoScrolling ? <Pause size={20} /> : <Play size={20} />}
          {isAutoScrolling ? 'Pause' : 'Auto-Read'}
        </button>

        <button
          className="nav-button"
          onClick={() => navigateChunk('next')}
          disabled={currentChunkIndex === chunks.length - 1}
        >
          <ChevronDown size={24} />
        </button>
      </div>

      <style>{`
        .reader-container {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          height: 100vh;
          max-width: 800px;
          margin: 0 auto;
          border-radius: 0;
          box-shadow: 0 0 60px rgba(0, 0, 0, 0.3);
        }

        @media (min-width: 900px) {
          .reader-container {
            margin: 2rem auto;
            height: calc(100vh - 4rem);
            border-radius: 20px;
          }
        }

        .reader-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(128, 128, 128, 0.2);
        }

        .reader-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          overflow: hidden;
        }

        .reader-title h1 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .reader-stats {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .progress-bar-container {
          height: 3px;
          background: rgba(128, 128, 128, 0.2);
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #00ff88, #00d4ff);
          transition: width 0.3s ease;
        }

        .reader-content {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          scroll-behavior: smooth;
        }

        .text-chunk {
          padding: 1.25rem 1.5rem;
          border-radius: 12px;
          border: 2px solid;
          cursor: pointer;
          transition: all 0.3s ease;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .text-chunk:hover {
          transform: translateX(4px);
        }

        .text-chunk.active {
          transform: scale(1.01);
          box-shadow: 0 4px 20px rgba(0, 255, 136, 0.15);
        }

        .bionic-text b {
          font-weight: 700;
          color: var(--bold-color);
        }

        .reader-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1rem;
          border-top: 1px solid rgba(128, 128, 128, 0.2);
        }

        .nav-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: rgba(128, 128, 128, 0.1);
          border: none;
          border-radius: 50%;
          color: rgba(128, 128, 128, 0.8);
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-button:hover:not(:disabled) {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
        }

        .nav-button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .auto-scroll-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(0, 255, 136, 0.15);
          border: 1px solid rgba(0, 255, 136, 0.3);
          border-radius: 25px;
          color: #00ff88;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .auto-scroll-button:hover {
          background: rgba(0, 255, 136, 0.25);
        }

        .auto-scroll-button.active {
          background: #00ff88;
          color: #1a1a2e;
        }

        /* Keyboard hints */
        .reader-content:focus-visible {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default TextReader;
