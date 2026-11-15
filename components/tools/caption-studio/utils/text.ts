import { CaptionSegment, CaptionWord } from "../types";

export function formatToMaxTwoLines(text: string, maxCharsPerLine = 34): string {
  if (!text) return "";
  const clean = text.trim();

  const existingLines = clean.split("\n").map((l) => l.trim()).filter(Boolean);
  if (existingLines.length === 1) {
    if (clean.length > maxCharsPerLine) {
      const words = clean.split(" ");
      if (words.length > 1) {
        const midChar = Math.floor(clean.length / 2);
        let currentLen = 0;
        let splitIdx = 1;
        for (let i = 0; i < words.length; i++) {
          currentLen += words[i].length + 1;
          if (currentLen >= midChar) {
            splitIdx = Math.max(1, i + 1);
            break;
          }
        }
        const line1 = words.slice(0, splitIdx).join(" ");
        const line2 = words.slice(splitIdx).join(" ");
        return `${line1}\n${line2}`;
      }
    }
    return clean;
  } else if (existingLines.length === 2) {
    return existingLines.join("\n");
  } else {
    const half = Math.ceil(existingLines.length / 2);
    const line1 = existingLines.slice(0, half).join(" ");
    const line2 = existingLines.slice(half).join(" ");
    return `${line1}\n${line2}`;
  }
}

export function getCaptionWordsWithTimings(caption: CaptionSegment): CaptionWord[] {
  if (!caption) return [];
  if (caption.words && caption.words.length > 0) {
    return caption.words;
  }

  const rawWords = caption.text.trim().replace(/\n/g, " ").split(/\s+/).filter(Boolean);
  if (rawWords.length === 0) return [];

  const totalChars = rawWords.reduce((sum, w) => sum + w.length, 0);
  const totalDuration = Math.max(0.4, caption.end - caption.start);
  let accumulatedTime = caption.start;

  return rawWords.map((word) => {
    const fraction = word.length / Math.max(1, totalChars);
    const wordDur = Math.max(0.12, fraction * totalDuration);
    const start = accumulatedTime;
    const end = Math.min(caption.end, start + wordDur);
    accumulatedTime = end;
    return {
      word,
      start: Math.round(start * 100) / 100,
      end: Math.round(end * 100) / 100,
    };
  });
}

export function convertToSingleLineRapidFrames(
  captions: CaptionSegment[],
  maxWordsPerFrame = 4
): CaptionSegment[] {
  const result: CaptionSegment[] = [];
  let idCounter = 1;

  for (const cap of captions) {
    const words = getCaptionWordsWithTimings(cap);

    if (words.length <= maxWordsPerFrame) {
      result.push({
        id: idCounter++,
        start: cap.start,
        end: cap.end,
        text: words.map((w) => w.word).join(" ").trim(),
        words: words,
      });
    } else {
      for (let i = 0; i < words.length; i += maxWordsPerFrame) {
        const chunkWords = words.slice(i, i + maxWordsPerFrame);
        const chunkStart = chunkWords[0].start;
        const chunkEnd = chunkWords[chunkWords.length - 1].end;
        const chunkText = chunkWords.map((w) => w.word).join(" ").trim();

        result.push({
          id: idCounter++,
          start: Math.round(chunkStart * 100) / 100,
          end: Math.round(chunkEnd * 100) / 100,
          text: chunkText,
          words: chunkWords,
        });
      }
    }
  }

  return result;
}

export function rechunkCaptionsToTwoLinesMax(
  captions: CaptionSegment[],
  maxWords = 8
): CaptionSegment[] {
  const result: CaptionSegment[] = [];
  let idCounter = 1;

  for (const cap of captions) {
    const words = getCaptionWordsWithTimings(cap);

    if (words.length <= maxWords) {
      result.push({
        id: idCounter++,
        start: cap.start,
        end: cap.end,
        text: formatToMaxTwoLines(cap.text),
        words: words,
      });
    } else {
      for (let i = 0; i < words.length; i += maxWords) {
        const chunkWords = words.slice(i, i + maxWords);
        const chunkStart = chunkWords[0].start;
        const chunkEnd = chunkWords[chunkWords.length - 1].end;
        const chunkRawText = chunkWords.map((w) => w.word).join(" ");

        result.push({
          id: idCounter++,
          start: Math.round(chunkStart * 100) / 100,
          end: Math.round(chunkEnd * 100) / 100,
          text: formatToMaxTwoLines(chunkRawText),
          words: chunkWords,
        });
      }
    }
  }

  return result;
}

export function splitCaptionIntoTwoLinesOfWords(caption: CaptionSegment): {
  line1Words: CaptionWord[];
  line2Words: CaptionWord[];
} {
  const words = getCaptionWordsWithTimings(caption);
  if (words.length === 0) return { line1Words: [], line2Words: [] };

  if (caption.text && caption.text.includes("\n")) {
    const lines = caption.text.split("\n");
    const line1Text = lines[0].trim();
    const line1WordCount = line1Text.split(/\s+/).filter(Boolean).length;

    return {
      line1Words: words.slice(0, line1WordCount),
      line2Words: words.slice(line1WordCount),
    };
  }

  if (words.length >= 6) {
    const mid = Math.ceil(words.length / 2);
    return {
      line1Words: words.slice(0, mid),
      line2Words: words.slice(mid),
    };
  }

  return {
    line1Words: words,
    line2Words: [],
  };
}

export function isSinhala(text: string): boolean {
  if (!text) return false;
  return /[\u0D80-\u0DFF]/.test(text);
}
