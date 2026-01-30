import { useState, useCallback, useMemo, useEffect } from 'react';
import { Settings, Upload, BookOpen, Sparkles } from 'lucide-react';
import FileUpload from './components/FileUpload';
import TextReader from './components/TextReader';
import SettingsPanel from './components/SettingsPanel';
import BackgroundGame from './components/BackgroundGame';
import { chunkText, applyBionicToChunks } from './utils/chunkText';
import type { TextChunk, ReaderSettings, ParsedDocument } from './types';
import { DEFAULT_SETTINGS } from './types';
import './App.css';

function App() {
  const [document, setDocument] = useState<ParsedDocument | null>(null);
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    // Load settings from localStorage if available
    const saved = localStorage.getItem('adhd-reader-settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('adhd-reader-settings', JSON.stringify(settings));
  }, [settings]);

  // Process text into chunks when document or settings change
  const chunks = useMemo<TextChunk[]>(() => {
    if (!document) return [];
    return chunkText(document.content, settings.chunkSize, settings.bionicIntensity);
  }, [document, settings.chunkSize, settings.bionicIntensity]);

  // Re-apply bionic formatting when intensity changes
  const processedChunks = useMemo(() => {
    if (!settings.bionicEnabled) return chunks;
    return applyBionicToChunks(chunks, settings.bionicIntensity);
  }, [chunks, settings.bionicEnabled, settings.bionicIntensity]);

  const handleFileLoaded = useCallback((title: string, content: string) => {
    setDocument({ title, content, chunks: [] });
  }, []);

  const handleNewFile = () => {
    setDocument(null);
  };

  return (
    <div className="app">
      {/* Background Game */}
      <BackgroundGame
        opacity={settings.backgroundEnabled ? settings.backgroundOpacity : 0}
        isPlaying={settings.backgroundEnabled && document !== null}
      />

      {/* Header - only show when document is loaded */}
      {document && (
        <header className="app-header">
          <button className="header-button" onClick={handleNewFile}>
            <Upload size={20} />
            <span>New File</span>
          </button>

          <div className="header-logo">
            <Sparkles size={24} className="logo-icon" />
            <span>ADHD Reader</span>
          </div>

          <button
            className="header-button settings-button"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </header>
      )}

      {/* Main Content */}
      <main className="app-main">
        {!document ? (
          <div className="welcome-screen">
            <div className="welcome-content">
              <div className="welcome-logo">
                <Sparkles size={48} className="logo-icon animated" />
                <h1>ADHD Reader</h1>
              </div>

              <p className="welcome-subtitle">
                Transform any document into an ADHD-friendly reading experience
              </p>

              <div className="features-grid">
                <div className="feature-card">
                  <BookOpen size={24} />
                  <h3>Smart Chunking</h3>
                  <p>Breaks text into digestible pieces</p>
                </div>
                <div className="feature-card">
                  <Sparkles size={24} />
                  <h3>Bionic Reading</h3>
                  <p>Bold text guides your focus</p>
                </div>
                <div className="feature-card">
                  <Settings size={24} />
                  <h3>Customizable</h3>
                  <p>Fonts, colors, and more</p>
                </div>
              </div>

              <FileUpload onFileLoaded={handleFileLoaded} />

              <button
                className="settings-hint"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings size={16} />
                Customize your reading experience
              </button>
            </div>
          </div>
        ) : (
          <TextReader
            chunks={processedChunks}
            settings={settings}
            title={document.title}
          />
        )}
      </main>

      {/* Settings Panel */}
      <SettingsPanel
        settings={settings}
        onSettingsChange={setSettings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
