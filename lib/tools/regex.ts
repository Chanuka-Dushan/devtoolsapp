/**
 * Regex Tester Tool Logic
 */

export interface RegexMatch {
  fullMatch: string;
  index: number;
  groups?: Record<string, string>;
  captureGroups?: string[];
}

export interface RegexResult {
  success: boolean;
  matches: RegexMatch[];
  matchCount: number;
  error?: string;
  /** The input string with match positions annotated */
  markedText?: string;
}

export type RegexFlag = "g" | "i" | "m" | "s" | "u" | "d";

/**
 * Test a regex pattern against an input string.
 */
export function testRegex(
  pattern: string,
  input: string,
  flags: RegexFlag[] = ["g"]
): RegexResult {
  if (!pattern) {
    return { success: false, matches: [], matchCount: 0, error: "Pattern is empty." };
  }

  let regex: RegExp;
  const flagStr = flags.join("");

  try {
    regex = new RegExp(pattern, flagStr);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid regex.";
    return {
      success: false,
      matches: [],
      matchCount: 0,
      error: `Invalid regular expression: ${message}`,
    };
  }

  if (!input) {
    return { success: true, matches: [], matchCount: 0 };
  }

  const matches: RegexMatch[] = [];

  try {
    if (regex.global || regex.sticky) {
      let match: RegExpExecArray | null;
      // Prevent infinite loops on zero-length matches
      let lastIndex = -1;
      while ((match = regex.exec(input)) !== null) {
        if (match.index === lastIndex) {
          regex.lastIndex++;
          continue;
        }
        lastIndex = match.index;

        matches.push({
          fullMatch: match[0],
          index: match.index,
          captureGroups: match.slice(1),
          groups: match.groups as Record<string, string> | undefined,
        });

        if (matches.length >= 500) break; // Safety limit
      }
    } else {
      const match = regex.exec(input);
      if (match) {
        matches.push({
          fullMatch: match[0],
          index: match.index,
          captureGroups: match.slice(1),
          groups: match.groups as Record<string, string> | undefined,
        });
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Match failed.";
    return {
      success: false,
      matches: [],
      matchCount: 0,
      error: message,
    };
  }

  return {
    success: true,
    matches,
    matchCount: matches.length,
  };
}
