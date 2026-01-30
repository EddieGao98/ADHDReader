import React from 'react';
import {
  Settings,
  Type,
  Video,
  Sun,
  Moon,
  Coffee,
  X,
  RotateCcw,
} from 'lucide-react';
import type { ReaderSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

interface SettingsPanelProps {
  settings: ReaderSettings;
  onSettingsChange: (settings: ReaderSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  isOpen,
  onClose,
}) => {
  const updateSetting = <K extends keyof ReaderSettings>(
    key: K,
    value: ReaderSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const resetSettings = () => {
    onSettingsChange(DEFAULT_SETTINGS);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="settings-overlay" onClick={onClose} />
      <div className="settings-panel">
        <div className="settings-header">
          <div className="settings-title">
            <Settings size={24} />
            <h2>Settings</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="settings-content">
          {/* Theme */}
          <div className="setting-group">
            <label className="setting-label">Theme</label>
            <div className="theme-buttons">
              <button
                className={`theme-btn ${settings.theme === 'light' ? 'active' : ''}`}
                onClick={() => updateSetting('theme', 'light')}
              >
                <Sun size={18} />
                Light
              </button>
              <button
                className={`theme-btn ${settings.theme === 'dark' ? 'active' : ''}`}
                onClick={() => updateSetting('theme', 'dark')}
              >
                <Moon size={18} />
                Dark
              </button>
              <button
                className={`theme-btn ${settings.theme === 'sepia' ? 'active' : ''}`}
                onClick={() => updateSetting('theme', 'sepia')}
              >
                <Coffee size={18} />
                Sepia
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div className="setting-group">
            <label className="setting-label">
              <Type size={18} />
              Font Size: {settings.fontSize}px
            </label>
            <input
              type="range"
              min="14"
              max="28"
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
              className="slider"
            />
          </div>

          {/* Line Height */}
          <div className="setting-group">
            <label className="setting-label">
              Line Spacing: {settings.lineHeight}x
            </label>
            <input
              type="range"
              min="1.4"
              max="2.5"
              step="0.1"
              value={settings.lineHeight}
              onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
              className="slider"
            />
          </div>

          {/* Font Family */}
          <div className="setting-group">
            <label className="setting-label">Font Style</label>
            <select
              value={settings.fontFamily}
              onChange={(e) => updateSetting('fontFamily', e.target.value)}
              className="font-select"
            >
              <option value="OpenDyslexic, Comic Sans MS, sans-serif">OpenDyslexic (ADHD-friendly)</option>
              <option value="'Comic Sans MS', cursive">Comic Sans</option>
              <option value="Georgia, serif">Georgia (Serif)</option>
              <option value="'Segoe UI', sans-serif">Segoe UI (Clean)</option>
              <option value="system-ui, sans-serif">System Default</option>
              <option value="monospace">Monospace</option>
            </select>
          </div>

          {/* Background Video */}
          <div className="setting-group">
            <div className="setting-header">
              <label className="setting-label">
                <Video size={18} />
                Background Video
              </label>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={settings.backgroundEnabled}
                  onChange={(e) => updateSetting('backgroundEnabled', e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
            {settings.backgroundEnabled && (
              <div className="opacity-control">
                <label>Opacity: {Math.round(settings.backgroundOpacity * 100)}%</label>
                <input
                  type="range"
                  min="0.2"
                  max="0.8"
                  step="0.05"
                  value={settings.backgroundOpacity}
                  onChange={(e) => updateSetting('backgroundOpacity', parseFloat(e.target.value))}
                  className="slider"
                />
              </div>
            )}
          </div>

          {/* Reset Button */}
          <button className="reset-button" onClick={resetSettings}>
            <RotateCcw size={18} />
            Reset to Defaults
          </button>
        </div>

        <style>{`
          .settings-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 100;
          }

          .settings-panel {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            width: 340px;
            max-width: 100vw;
            background: #1a1a2e;
            border-left: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 101;
            display: flex;
            flex-direction: column;
            animation: slideIn 0.3s ease;
          }

          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }

          .settings-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .settings-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            color: white;
          }

          .settings-title h2 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
          }

          .close-button {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 8px;
            transition: all 0.2s;
          }

          .close-button:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
          }

          .settings-content {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .setting-group {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .setting-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .setting-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: rgba(255, 255, 255, 0.9);
            font-size: 0.95rem;
            font-weight: 500;
          }

          .toggle {
            position: relative;
            display: inline-block;
            width: 48px;
            height: 26px;
          }

          .toggle input {
            opacity: 0;
            width: 0;
            height: 0;
          }

          .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255, 255, 255, 0.2);
            transition: 0.3s;
            border-radius: 26px;
          }

          .toggle-slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: 0.3s;
            border-radius: 50%;
          }

          .toggle input:checked + .toggle-slider {
            background-color: #00ff88;
          }

          .toggle input:checked + .toggle-slider:before {
            transform: translateX(22px);
          }

          .theme-buttons {
            display: flex;
            gap: 0.5rem;
          }

          .theme-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.875rem;
          }

          .theme-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
          }

          .theme-btn.active {
            background: rgba(0, 255, 136, 0.15);
            border-color: #00ff88;
            color: #00ff88;
          }

          .slider {
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: rgba(255, 255, 255, 0.1);
            outline: none;
            -webkit-appearance: none;
          }

          .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #00ff88;
            cursor: pointer;
            transition: transform 0.2s;
          }

          .slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
          }

          .font-select {
            width: 100%;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: white;
            font-size: 0.9rem;
            cursor: pointer;
            outline: none;
          }

          .font-select:focus {
            border-color: #00ff88;
          }

          .font-select option {
            background: #1a1a2e;
            color: white;
          }

          .opacity-control {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 0.75rem;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
          }

          .opacity-control label {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.6);
          }

          .reset-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.875rem;
            background: rgba(255, 71, 87, 0.1);
            border: 1px solid rgba(255, 71, 87, 0.3);
            border-radius: 8px;
            color: #ff6b6b;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9rem;
            margin-top: auto;
          }

          .reset-button:hover {
            background: rgba(255, 71, 87, 0.2);
          }
        `}</style>
      </div>
    </>
  );
};

export default SettingsPanel;
