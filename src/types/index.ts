export interface ReaderSettings {
  backgroundEnabled: boolean;
  backgroundOpacity: number;
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  theme: 'light' | 'dark' | 'sepia';
}

export const DEFAULT_SETTINGS: ReaderSettings = {
  backgroundEnabled: true,
  backgroundOpacity: 0.5,
  fontSize: 16,
  lineHeight: 1.7,
  fontFamily: "'Segoe UI', sans-serif",
  theme: 'dark',
};

export type SupportedFormat = 'pdf' | 'docx' | 'doc' | 'epub' | 'mobi' | 'djvu' | 'azw3' | 'txt';
