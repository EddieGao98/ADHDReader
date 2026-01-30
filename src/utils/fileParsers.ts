import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import ePub from 'epubjs';
import type { SupportedFormat } from '../types';

// Set up PDF.js worker using the bundled worker from pdfjs-dist
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker;

/**
 * Detect file format from file extension or MIME type
 */
export function detectFormat(file: File): SupportedFormat | null {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type.toLowerCase();

  const formatMap: Record<string, SupportedFormat> = {
    'pdf': 'pdf',
    'docx': 'docx',
    'doc': 'doc',
    'epub': 'epub',
    'mobi': 'mobi',
    'djvu': 'djvu',
    'azw3': 'azw3',
    'azw': 'azw3',
    'txt': 'txt',
    'text': 'txt',
  };

  if (extension && formatMap[extension]) {
    return formatMap[extension];
  }

  // Check MIME types
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('msword')) return 'docx';
  if (mimeType.includes('epub')) return 'epub';
  if (mimeType.includes('text/plain')) return 'txt';

  return null;
}

/**
 * Parse PDF files using PDF.js
 */
async function parsePDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    textParts.push(pageText);
  }

  return textParts.join('\n\n');
}

/**
 * Parse DOCX files using Mammoth
 */
async function parseDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Parse EPUB files using epub.js
 */
async function parseEPUB(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const book = ePub(arrayBuffer);

  await book.ready;

  const spine = book.spine as any;
  const textParts: string[] = [];

  // Get all spine items (chapters)
  const spineItems = spine.items || spine.spineItems || [];

  for (const item of spineItems) {
    try {
      const doc = await book.load(item.href);
      if (doc) {
        // Extract text from the HTML document
        const tempDiv = document.createElement('div');
        if (typeof doc === 'string') {
          tempDiv.innerHTML = doc;
        } else if (doc instanceof Document) {
          tempDiv.innerHTML = doc.body?.innerHTML || '';
        }
        const text = tempDiv.textContent || tempDiv.innerText || '';
        if (text.trim()) {
          textParts.push(text.trim());
        }
      }
    } catch (e) {
      console.warn('Failed to load spine item:', item.href, e);
    }
  }

  book.destroy();
  return textParts.join('\n\n');
}

/**
 * Parse plain text files
 */
async function parseTXT(file: File): Promise<string> {
  return await file.text();
}

/**
 * Parse MOBI files
 * MOBI is a proprietary format. We'll attempt basic extraction.
 */
async function parseMOBI(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const dataView = new DataView(arrayBuffer);

  // Check for MOBI magic number
  const magic = String.fromCharCode(
    dataView.getUint8(60),
    dataView.getUint8(61),
    dataView.getUint8(62),
    dataView.getUint8(63)
  );

  if (magic !== 'MOBI' && magic !== 'BOOK') {
    // Try to extract text content anyway
    const text = await extractTextFromBinary(arrayBuffer);
    if (text.length > 100) {
      return text;
    }
    throw new Error('Invalid MOBI file format. Please try converting to EPUB or TXT.');
  }

  // Basic MOBI parsing - extract readable text
  const text = await extractTextFromBinary(arrayBuffer);
  return text;
}

/**
 * Parse AZW3 (Kindle Format 8) files
 * AZW3 is similar to MOBI but with additional features
 */
async function parseAZW3(file: File): Promise<string> {
  // AZW3 and MOBI share similar structure
  return parseMOBI(file);
}

/**
 * Parse DJVU files
 * DJVU is a complex format primarily for scanned documents
 */
async function parseDJVU(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  // Check for DJVU magic number "AT&TFORM"
  const header = new Uint8Array(arrayBuffer.slice(0, 8));
  const magic = String.fromCharCode(...header);

  if (!magic.startsWith('AT&T')) {
    throw new Error('Invalid DJVU file format');
  }

  // DJVU parsing is complex - attempt to extract embedded text layer
  const text = await extractTextFromBinary(arrayBuffer);

  if (text.length < 50) {
    throw new Error(
      'This DJVU file appears to be image-based without a text layer. ' +
      'Please use OCR software to convert it to a text format first.'
    );
  }

  return text;
}

/**
 * Extract readable text from binary file
 * Used as fallback for proprietary formats
 */
async function extractTextFromBinary(arrayBuffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(arrayBuffer);
  const chunks: string[] = [];
  let currentChunk = '';

  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];

    // Check for readable ASCII characters and common extended chars
    if (
      (byte >= 32 && byte <= 126) || // Printable ASCII
      byte === 9 || // Tab
      byte === 10 || // Newline
      byte === 13 // Carriage return
    ) {
      currentChunk += String.fromCharCode(byte);
    } else if (currentChunk.length > 0) {
      // End of text segment
      if (currentChunk.trim().length > 20) {
        // Only keep chunks with substantial text
        chunks.push(currentChunk.trim());
      }
      currentChunk = '';
    }
  }

  if (currentChunk.trim().length > 20) {
    chunks.push(currentChunk.trim());
  }

  // Filter out non-text chunks (binary data that happens to be printable)
  const textChunks = chunks.filter(chunk => {
    // Check if chunk contains mostly letters and spaces (text-like)
    const letterRatio = (chunk.match(/[a-zA-Z\s]/g) || []).length / chunk.length;
    return letterRatio > 0.7;
  });

  return textChunks.join('\n\n');
}

/**
 * Clean and normalize extracted text
 */
function cleanText(text: string): string {
  return text
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive whitespace
    .replace(/[ \t]+/g, ' ')
    // Normalize multiple newlines to double newline (paragraph break)
    .replace(/\n{3,}/g, '\n\n')
    // Trim lines
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Final trim
    .trim();
}

/**
 * Main file parser function
 */
export async function parseFile(file: File): Promise<{ title: string; content: string }> {
  const format = detectFormat(file);

  if (!format) {
    throw new Error(
      `Unsupported file format. Supported formats: PDF, DOCX, EPUB, MOBI, DJVU, AZW3, TXT`
    );
  }

  let content: string;

  try {
    switch (format) {
      case 'pdf':
        content = await parsePDF(file);
        break;
      case 'docx':
      case 'doc':
        content = await parseDOCX(file);
        break;
      case 'epub':
        content = await parseEPUB(file);
        break;
      case 'mobi':
        content = await parseMOBI(file);
        break;
      case 'azw3':
        content = await parseAZW3(file);
        break;
      case 'djvu':
        content = await parseDJVU(file);
        break;
      case 'txt':
        content = await parseTXT(file);
        break;
      default:
        throw new Error(`Parser not implemented for format: ${format}`);
    }
  } catch (error) {
    console.error('Parsing error:', error);
    throw new Error(
      `Failed to parse ${format.toUpperCase()} file: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }

  const cleanedContent = cleanText(content);

  if (cleanedContent.length < 10) {
    throw new Error(
      'Could not extract meaningful text from this file. ' +
      'The file may be image-based, encrypted, or corrupted.'
    );
  }

  // Extract title from filename
  const title = file.name.replace(/\.[^/.]+$/, '');

  return { title, content: cleanedContent };
}

/**
 * Get supported file extensions for file input accept attribute
 */
export function getSupportedExtensions(): string {
  return '.pdf,.docx,.doc,.epub,.mobi,.djvu,.azw3,.azw,.txt';
}

/**
 * Get human-readable list of supported formats
 */
export function getSupportedFormatsText(): string {
  return 'PDF, DOCX, EPUB, MOBI, DJVU, AZW3, TXT';
}
