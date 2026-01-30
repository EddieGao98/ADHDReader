/**
 * Bionic Reading Transformer
 *
 * Bionic reading works by bolding the first portion of each word,
 * creating artificial fixation points that help the brain complete
 * word recognition more quickly. This is especially helpful for
 * people with ADHD as it helps maintain focus and reading flow.
 */

export type BionicIntensity = 'light' | 'medium' | 'strong';

/**
 * Calculate how many characters to bold based on word length and intensity
 */
function getBoldLength(wordLength: number, intensity: BionicIntensity): number {
  const ratios = {
    light: 0.3,
    medium: 0.5,
    strong: 0.7,
  };

  const ratio = ratios[intensity];

  // Special cases for very short words
  if (wordLength <= 1) return 1;
  if (wordLength <= 3) return Math.ceil(wordLength * ratio);

  return Math.ceil(wordLength * ratio);
}

/**
 * Transform a single word into bionic format with HTML
 */
function transformWord(word: string, intensity: BionicIntensity): string {
  // Skip if word is empty or just whitespace
  if (!word.trim()) return word;

  // Preserve leading/trailing whitespace and punctuation
  const leadingMatch = word.match(/^(\s*[^\w]*)/);
  const trailingMatch = word.match(/([^\w]*\s*)$/);

  const leading = leadingMatch ? leadingMatch[1] : '';
  const trailing = trailingMatch ? trailingMatch[1] : '';

  // Extract the actual word content
  const coreWord = word.slice(leading.length, word.length - trailing.length);

  if (!coreWord) return word;

  const boldLength = getBoldLength(coreWord.length, intensity);
  const boldPart = coreWord.slice(0, boldLength);
  const normalPart = coreWord.slice(boldLength);

  return `${leading}<b>${boldPart}</b>${normalPart}${trailing}`;
}

/**
 * Transform entire text into bionic reading format
 */
export function transformToBionic(text: string, intensity: BionicIntensity = 'medium'): string {
  // Split text while preserving whitespace and newlines
  const words = text.split(/(\s+)/);

  return words.map(segment => {
    // If it's purely whitespace, preserve it
    if (/^\s+$/.test(segment)) {
      return segment;
    }
    return transformWord(segment, intensity);
  }).join('');
}

/**
 * Transform text for React rendering (returns array of elements)
 */
export function transformToBionicElements(
  text: string,
  intensity: BionicIntensity = 'medium'
): Array<{ type: 'bold' | 'normal' | 'space'; content: string }> {
  const elements: Array<{ type: 'bold' | 'normal' | 'space'; content: string }> = [];
  const words = text.split(/(\s+)/);

  words.forEach(segment => {
    if (/^\s+$/.test(segment)) {
      elements.push({ type: 'space', content: segment });
      return;
    }

    if (!segment.trim()) return;

    // Handle punctuation at start
    const leadingMatch = segment.match(/^([^\w]*)/);
    const trailingMatch = segment.match(/([^\w]*)$/);

    const leading = leadingMatch ? leadingMatch[1] : '';
    const trailing = trailingMatch ? trailingMatch[1] : '';

    const coreWord = segment.slice(leading.length, segment.length - trailing.length);

    if (leading) {
      elements.push({ type: 'normal', content: leading });
    }

    if (coreWord) {
      const boldLength = getBoldLength(coreWord.length, intensity);
      const boldPart = coreWord.slice(0, boldLength);
      const normalPart = coreWord.slice(boldLength);

      elements.push({ type: 'bold', content: boldPart });
      if (normalPart) {
        elements.push({ type: 'normal', content: normalPart });
      }
    }

    if (trailing) {
      elements.push({ type: 'normal', content: trailing });
    }
  });

  return elements;
}
