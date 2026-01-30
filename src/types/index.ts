export interface TextChunk {
  id: string;
  content: string;
  bionicContent: string;
}

export interface ParsedDocument {
  title: string;
  content: string;
  chunks: TextChunk[];
}

export interface ReaderSettings {
  chunkSize: 'small' | 'medium' | 'large';
  bionicIntensity: 'light' | 'medium' | 'strong';
  bionicEnabled: boolean;
  backgroundEnabled: boolean;
  backgroundOpacity: number;
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  theme: 'light' | 'dark' | 'sepia';
  autoScroll: boolean;
  autoScrollSpeed: number;
}

export const DEFAULT_SETTINGS: ReaderSettings = {
  chunkSize: 'medium',
  bionicIntensity: 'medium',
  bionicEnabled: true,
  backgroundEnabled: true,
  backgroundOpacity: 0.3,
  fontSize: 18,
  lineHeight: 1.8,
  fontFamily: 'OpenDyslexic, Comic Sans MS, sans-serif',
  theme: 'dark',
  autoScroll: false,
  autoScrollSpeed: 50,
};

export type SupportedFormat = 'pdf' | 'docx' | 'doc' | 'epub' | 'mobi' | 'djvu' | 'azw3' | 'txt';
