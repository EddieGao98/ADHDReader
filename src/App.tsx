import { useState, useCallback, useEffect } from 'react';
import { Settings, Upload, Video, Sparkles } from 'lucide-react';
import FileUpload from './components/FileUpload';
import TextReader from './components/TextReader';
import SettingsPanel from './components/SettingsPanel';
import BackgroundVideo from './components/BackgroundVideo';
import type { ReaderSettings } from './types';
import { DEFAULT_SETTINGS } from './types';
import './App.css';

interface DocumentState {
  title: string;
  content: string;
}

function App() {
  const [document, setDocument] = useState<DocumentState | null>(null);
  const [settings, setSettings] = useState<ReaderSettings>(() => {
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

  useEffect(() => {
    localStorage.setItem('adhd-reader-settings', JSON.stringify(settings));
  }, [settings]);

  const handleFileLoaded = useCallback((title: string, content: string) => {
    setDocument({ title, content });
  }, []);

  const handleNewFile = () => {
    setDocument(null);
  };

  return (
    <div className="app">
      {/* Background Video */}
      <BackgroundVideo
        opacity={settings.backgroundEnabled ? settings.backgroundOpacity : 0}
        isPlaying={settings.backgroundEnabled}
      />

      {/* Header - only show when document is loaded */}
      {document && (
        <header className="app-header">
          <button className="header-button" onClick={handleNewFile}>
            <Upload size={20} />
            <span>New</span>
          </button>

          <div className="header-logo">
            <Sparkles size={20} className="logo-icon" />
            <span>ADHD Reader</span>
          </div>

          <button
            className="header-button settings-button"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings size={20} />
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
                Read documents with Subway Surfers playing in the background
              </p>

              <div className="features-grid">
                <div className="feature-card">
                  <Video size={24} />
                  <h3>Background Video</h3>
                  <p>Subway Surfers gameplay</p>
                </div>
                <div className="feature-card">
                  <Sparkles size={24} />
                  <h3>Focus Mode</h3>
                  <p>Distraction that helps focus</p>
                </div>
                <div className="feature-card">
                  <Settings size={24} />
                  <h3>Customizable</h3>
                  <p>Fonts, themes, opacity</p>
                </div>
              </div>

              <FileUpload onFileLoaded={handleFileLoaded} />

              <button
                className="settings-hint"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings size={16} />
                Customize settings
              </button>
            </div>
          </div>
        ) : (
          <TextReader
            content={document.content}
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
