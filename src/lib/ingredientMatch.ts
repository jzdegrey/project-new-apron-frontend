/**
 * Splits a direction step's text into segments, flagging the ones that match
 * a recipe ingredient's name so the UI can highlight them (tap-to-see-details
 * when viewing, live highlight while writing).
 */

export interface TextSegment {
  text: string;
  ingredientIndex: number | null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function matchIngredientSegments(text: string, ingredientNames: string[]): TextSegment[] {
  const namedEntries = ingredientNames
    .map((name, index) => ({ name: name.trim(), index }))
    .filter((entry) => entry.name.length > 0)
    // Longest names first, so "brown sugar" matches before "sugar" inside it.
    .sort((a, b) => b.name.length - a.name.length);

  if (!text || namedEntries.length === 0) {
    return [{ text, ingredientIndex: null }];
  }

  const pattern = namedEntries.map((entry) => escapeRegExp(entry.name)).join("|");
  const regex = new RegExp(`\\b(${pattern})\\b`, "gi");

  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), ingredientIndex: null });
    }
    const matchedText = match[0];
    const ingredientIndex = ingredientNames.findIndex(
      (name) => name.trim().toLowerCase() === matchedText.toLowerCase()
    );
    segments.push({ text: matchedText, ingredientIndex });
    lastIndex = match.index + matchedText.length;
  }
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), ingredientIndex: null });
  }
  return segments;
}
