import { useRef, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import type { ReaderSettings } from '../types';

interface TextReaderProps {
  content: string;
  settings: ReaderSettings;
  title: string;
}

const TextReader: React.FC<TextReaderProps> = ({ content, settings, title }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Theme styles
  const themeStyles = useMemo(() => {
    const themes = {
      light: {
        background: 'rgba(255, 255, 255, 0.92)',
        text: '#1a1a2e',
        textMuted: 'rgba(26, 26, 46, 0.6)',
      },
      dark: {
        background: 'rgba(26, 26, 46, 0.92)',
        text: 'rgba(255, 255, 255, 0.9)',
        textMuted: 'rgba(255, 255, 255, 0.5)',
      },
      sepia: {
        background: 'rgba(244, 234, 213, 0.92)',
        text: '#433422',
        textMuted: 'rgba(67, 52, 34, 0.6)',
      },
    };
    return themes[settings.theme];
  }, [settings.theme]);

  return (
    <div className="reader-container" style={{ background: themeStyles.background }}>
      {/* Header */}
      <div className="reader-header">
        <div className="reader-title">
          <BookOpen size={18} style={{ color: themeStyles.textMuted }} />
          <h1 style={{ color: themeStyles.text }}>{title}</h1>
        </div>
      </div>

      {/* Main content - plain text display */}
      <div
        className="reader-content"
        ref={containerRef}
        style={{
          color: themeStyles.text,
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
          fontFamily: settings.fontFamily,
        }}
      >
        {content}
      </div>

      <style>{`
        .reader-container {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 400px;
          max-width: 90vw;
          margin: 0 auto;
          border-radius: 0;
          box-shadow: 0 0 60px rgba(0, 0, 0, 0.5);
        }

        @media (min-width: 600px) {
          .reader-container {
            margin: 1.5rem auto;
            height: calc(100vh - 3rem);
            border-radius: 16px;
          }
        }

        .reader-header {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid rgba(128, 128, 128, 0.2);
        }

        .reader-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow: hidden;
        }

        .reader-title h1 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .reader-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .reader-content::-webkit-scrollbar {
          width: 6px;
        }

        .reader-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .reader-content::-webkit-scrollbar-thumb {
          background: rgba(128, 128, 128, 0.3);
          border-radius: 3px;
        }

        .reader-content::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 128, 128, 0.5);
        }
      `}</style>
    </div>
  );
};

export default TextReader;
