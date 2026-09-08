/**
 * JSON Tool Logic
 * Pure functions — no side effects, fully testable.
 */

export interface FormatResult {
  success: boolean;
  output: string;
  error?: string;
  errorLine?: number;
  errorColumn?: number;
}

/**
 * Format (pretty-print) JSON with configurable indentation.
 */
export function formatJSON(input: string, indent = 2): FormatResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: false, output: "", error: "Input is empty." };
  }

  try {
    const parsed = JSON.parse(trimmed);
    const output = JSON.stringify(parsed, null, indent);
    return { success: true, output };
  } catch (err) {
    return parseJSONError(err, input);
  }
}

/**
 * Validate JSON and return a detailed result.
 */
export function validateJSON(input: string): FormatResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: false, output: "", error: "Input is empty." };
  }

  try {
    JSON.parse(trimmed);
    return { success: true, output: "Valid JSON ✓" };
  } catch (err) {
    return parseJSONError(err, input);
  }
}

/**
 * Minify JSON by removing all unnecessary whitespace.
 */
export function minifyJSON(input: string): FormatResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { success: false, output: "", error: "Input is empty." };
  }

  try {
    const parsed = JSON.parse(trimmed);
    const output = JSON.stringify(parsed);
    return { success: true, output };
  } catch (err) {
    return parseJSONError(err, input);
  }
}

/**
 * Extract meaningful error information from a JSON parse error.
 */
function parseJSONError(err: unknown, input: string): FormatResult {
  const message = err instanceof Error ? err.message : "Invalid JSON";

  // Try to extract line/column from error message
  const lineMatch = message.match(/line (\d+)/i);
  const colMatch = message.match(/column (\d+)/i);
  const posMatch = message.match(/position (\d+)/i);

  let errorLine: number | undefined;
  let errorColumn: number | undefined;

  if (lineMatch) {
    errorLine = parseInt(lineMatch[1], 10);
  }
  if (colMatch) {
    errorColumn = parseInt(colMatch[1], 10);
  } else if (posMatch && !lineMatch) {
    // Calculate line from char position
    const pos = parseInt(posMatch[1], 10);
    const upToPos = input.slice(0, pos);
    errorLine = upToPos.split("\n").length;
    errorColumn = pos - upToPos.lastIndexOf("\n");
  }

  return {
    success: false,
    output: "",
    error: `Invalid JSON: ${message}`,
    errorLine,
    errorColumn,
  };
}
