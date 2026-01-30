# ADHD Reader

Transform any document into an ADHD-friendly reading experience with bionic reading, smart text chunking, and background visual stimulation.

## Features

### Bionic Reading
Bold the beginning of each word to create artificial fixation points. This helps your brain complete word recognition more quickly, improving reading speed and focus.

### Smart Text Chunking
Automatically breaks large paragraphs into smaller, digestible chunks. Choose from three sizes:
- **Small**: 1 sentence per chunk
- **Medium**: 2-3 sentences per chunk
- **Large**: 4+ sentences per chunk

### Background Stimulation
An optional background game (endless runner style) provides visual stimulation while reading, similar to the "Subway Surfers" videos that help people with ADHD focus.

### Customizable Experience
- Multiple themes: Dark, Light, and Sepia
- Adjustable font size and line spacing
- ADHD-friendly fonts including OpenDyslexic
- Adjustable background opacity
- Auto-scroll functionality with variable speed

## Supported File Formats

- **PDF** - Adobe Portable Document Format
- **DOCX/DOC** - Microsoft Word documents
- **EPUB** - E-book format
- **MOBI** - Kindle format
- **AZW3** - Kindle Format 8
- **DJVU** - Scanned document format (with text layer)
- **TXT** - Plain text files

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Usage

1. Drop a document file onto the upload area or click to browse
2. Use arrow keys (↑↓) or click chunks to navigate
3. Press Space to advance to the next chunk
4. Open Settings to customize your reading experience
5. Toggle the background game for extra focus stimulation

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ↓ / j / Space | Next chunk |
| ↑ / k | Previous chunk |
| Home | Go to beginning |
| End | Go to end |

## Technologies

- React 18 with TypeScript
- Vite for fast development
- PDF.js for PDF parsing
- Mammoth.js for DOCX parsing
- EPUB.js for EPUB parsing
- Custom parsers for MOBI/AZW3/DJVU formats

## License

MIT
