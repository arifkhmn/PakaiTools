export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  lines: number;
  paragraphs: number;
  readingTimeMinutes: number;
}

export function analyzeText(text: string): TextStats {
  if (!text) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      lines: 0,
      paragraphs: 0,
      readingTimeMinutes: 0
    };
  }

  // Unicode-aware word match (matches sequences of letters/numbers)
  const wordsMatch = text.match(/[\p{L}\p{N}]+/gu);
  const words = wordsMatch ? wordsMatch.length : 0;

  // Characters
  const characters = [...text].length; // Handles surrogate pairs properly
  const charactersNoSpaces = [...text.replace(/\s/g, '')].length;

  // Lines
  const lines = text.split(/\r\n|\r|\n/).length;

  // Paragraphs (chunks separated by one or more blank lines)
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0).length;

  // Reading time (average adult reading speed ~ 200 words per minute)
  const readingTimeMinutes = Math.ceil(words / 200);

  return {
    words,
    characters,
    charactersNoSpaces,
    lines,
    paragraphs: Math.max(paragraphs, words > 0 ? 1 : 0),
    readingTimeMinutes
  };
}

// Case conversions
export function toUpperCase(text: string): string {
  return text.toUpperCase();
}

export function toLowerCase(text: string): string {
  return text.toLowerCase();
}

export function toTitleCase(text: string): string {
  // Indonesian and common small words that shouldn't be capitalized unless first word of sentence/line
  const minorWords = new Set(['dan', 'atau', 'di', 'ke', 'dari', 'yang', 'untuk', 'pada', 'dengan', 'adalah', 'ini', 'itu', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'a', 'an', 'the']);

  return text
    .split(/\r\n|\r|\n/)
    .map(line => {
      const words = line.split(' ');
      return words
        .map((word, index) => {
          if (!word) return word;
          const lower = word.toLowerCase();
          if (index > 0 && minorWords.has(lower)) {
            return lower;
          }
          return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join(' ');
    })
    .join('\n');
}

export function toSentenceCase(text: string): string {
  return text
    .toLowerCase()
    .replace(/(^\s*|[.?!]\s+)([\p{L}])/gu, (_match, sep, char) => sep + char.toUpperCase());
}

export function toCamelCase(text: string): string {
  const words = text.match(/[\p{L}\p{N}]+/gu);
  if (!words) return '';
  return words
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

export function toSnakeCase(text: string): string {
  const words = text.match(/[\p{L}\p{N}]+/gu);
  if (!words) return '';
  return words.map(w => w.toLowerCase()).join('_');
}

export function toKebabCase(text: string): string {
  const words = text.match(/[\p{L}\p{N}]+/gu);
  if (!words) return '';
  return words.map(w => w.toLowerCase()).join('-');
}

// Text cleaning options
export interface CleanOptions {
  trimEdges: boolean;
  removeDuplicateSpaces: boolean;
  removeBlankLines: boolean;
  removeDuplicateLines: boolean;
  normalizeLineEndings: boolean;
}

export function cleanText(text: string, options: CleanOptions): string {
  let result = text;

  if (options.normalizeLineEndings) {
    result = result.replace(/\r\n|\r/g, '\n');
  }

  if (options.removeDuplicateSpaces) {
    result = result.replace(/[ \t]+/g, ' ');
  }

  if (options.trimEdges) {
    result = result
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      .trim();
  }

  if (options.removeBlankLines) {
    result = result
      .split('\n')
      .filter(line => line.trim().length > 0)
      .join('\n');
  }

  if (options.removeDuplicateLines) {
    const lines = result.split('\n');
    const seen = new Set<string>();
    const uniqueLines: string[] = [];
    for (const line of lines) {
      if (!seen.has(line)) {
        seen.add(line);
        uniqueLines.push(line);
      }
    }
    result = uniqueLines.join('\n');
  }

  return result;
}

// URL encode / decode
export function encodeUrlComponent(text: string): string {
  return encodeURIComponent(text);
}

export function decodeUrlComponent(text: string): string {
  return decodeURIComponent(text);
}

export function encodeFullUrl(text: string): string {
  return encodeURI(text);
}

export function decodeFullUrl(text: string): string {
  return decodeURI(text);
}
