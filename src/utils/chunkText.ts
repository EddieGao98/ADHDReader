import type { TextChunk } from '../types';
import { transformToBionic } from './bionicReading';
import type { BionicIntensity } from './bionicReading';

export type ChunkSize = 'small' | 'medium' | 'large';

interface ChunkConfig {
  maxSentences: number;
  maxCharacters: number;
}

const CHUNK_CONFIGS: Record<ChunkSize, ChunkConfig> = {
  small: { maxSentences: 1, maxCharacters: 150 },
  medium: { maxSentences: 2, maxCharacters: 300 },
  large: { maxSentences: 4, maxCharacters: 500 },
};

/**
 * Split text into sentences while preserving punctuation
 */
function splitIntoSentences(text: string): string[] {
  // Match sentences ending with . ! ? and followed by space or end of string
  // Also handle cases like "Dr." "Mr." "etc." that shouldn't split
  const sentenceRegex = /[^.!?]*[.!?]+(?:\s+|$)/g;
  const sentences = text.match(sentenceRegex) || [text];

  return sentences.filter(s => s.trim());
}

/**
 * Split text into paragraphs based on double newlines
 */
function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

/**
 * Generate a unique ID for a chunk
 */
function generateChunkId(index: number): string {
  return `chunk-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Chunk text into ADHD-friendly segments
 *
 * The algorithm:
 * 1. First split by paragraphs
 * 2. For each paragraph, split into sentences
 * 3. Group sentences into chunks based on size config
 * 4. Never break mid-sentence
 */
export function chunkText(
  text: string,
  size: ChunkSize = 'medium',
  bionicIntensity: BionicIntensity = 'medium'
): TextChunk[] {
  const config = CHUNK_CONFIGS[size];
  const chunks: TextChunk[] = [];
  let chunkIndex = 0;

  const paragraphs = splitIntoParagraphs(text);

  paragraphs.forEach(paragraph => {
    const sentences = splitIntoSentences(paragraph);
    let currentChunk: string[] = [];
    let currentLength = 0;

    sentences.forEach(sentence => {
      const sentenceLength = sentence.length;

      // Check if adding this sentence would exceed limits
      const wouldExceedSentences = currentChunk.length >= config.maxSentences;
      const wouldExceedChars = currentLength + sentenceLength > config.maxCharacters;

      // If current chunk has content and would exceed limits, save it and start new one
      if (currentChunk.length > 0 && (wouldExceedSentences || wouldExceedChars)) {
        const content = currentChunk.join(' ').trim();
        chunks.push({
          id: generateChunkId(chunkIndex++),
          content,
          bionicContent: transformToBionic(content, bionicIntensity),
        });
        currentChunk = [];
        currentLength = 0;
      }

      // Handle very long sentences by splitting at clause boundaries
      if (sentenceLength > config.maxCharacters && currentChunk.length === 0) {
        // Split at commas, semicolons, or dashes for very long sentences
        const clauses = sentence.split(/([,;—–-]\s*)/);
        let clauseBuffer = '';

        clauses.forEach(clause => {
          if (clauseBuffer.length + clause.length <= config.maxCharacters) {
            clauseBuffer += clause;
          } else {
            if (clauseBuffer.trim()) {
              const content = clauseBuffer.trim();
              chunks.push({
                id: generateChunkId(chunkIndex++),
                content,
                bionicContent: transformToBionic(content, bionicIntensity),
              });
            }
            clauseBuffer = clause;
          }
        });

        if (clauseBuffer.trim()) {
          currentChunk.push(clauseBuffer.trim());
          currentLength = clauseBuffer.length;
        }
      } else {
        currentChunk.push(sentence.trim());
        currentLength += sentenceLength;
      }
    });

    // Don't forget the last chunk in the paragraph
    if (currentChunk.length > 0) {
      const content = currentChunk.join(' ').trim();
      chunks.push({
        id: generateChunkId(chunkIndex++),
        content,
        bionicContent: transformToBionic(content, bionicIntensity),
      });
    }
  });

  return chunks;
}

/**
 * Re-apply bionic formatting to existing chunks
 */
export function applyBionicToChunks(
  chunks: TextChunk[],
  bionicIntensity: BionicIntensity
): TextChunk[] {
  return chunks.map(chunk => ({
    ...chunk,
    bionicContent: transformToBionic(chunk.content, bionicIntensity),
  }));
}
