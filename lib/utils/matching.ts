import { getDistanceBetweenCoordinates } from "./distance";

export interface MatchableItem {
  id: number;
  name: string;
  description: string;
  type: string;
  location: string[];
  itemdate: string;
  email: string;
  image?: string;
  islost: boolean;
}

export interface ItemMatch {
  item: MatchableItem;
  score: number;
}

const STOPWORDS = new Set([
  "the", "and", "for", "was", "with", "this", "that", "have", "has",
  "are", "not", "from", "but", "its", "mine", "my", "our", "your",
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  );
}

/**
 * Computes a match score (0–100) between a lost item and a found item.
 * Higher score = more likely to be the same item.
 */
export function computeMatchScore(
  lostItem: MatchableItem,
  foundItem: MatchableItem
): number {
  let score = 0;

  // Type match is the strongest single signal (40 pts)
  if (lostItem.type === foundItem.type) score += 40;

  // Keyword overlap across name + description (up to 40 pts)
  const lostWords = tokenize(`${lostItem.name} ${lostItem.description}`);
  const foundWords = tokenize(`${foundItem.name} ${foundItem.description}`);
  const intersectionSize = [...lostWords].filter((w) => foundWords.has(w)).length;
  const unionSize = new Set([...lostWords, ...foundWords]).size;
  if (unionSize > 0) {
    score += Math.round((intersectionSize / unionSize) * 40);
  }

  // Found date on or after lost date (10 pts)
  const lostDate = new Date(lostItem.itemdate);
  const foundDate = new Date(foundItem.itemdate);
  if (foundDate >= lostDate) score += 10;

  // Location proximity bonus — within 1000 feet (10 pts)
  if (lostItem.location?.length >= 2 && foundItem.location?.length >= 2) {
    const dist = getDistanceBetweenCoordinates(
      {
        lat: parseFloat(lostItem.location[0]),
        lng: parseFloat(lostItem.location[1]),
      },
      {
        lat: parseFloat(foundItem.location[0]),
        lng: parseFloat(foundItem.location[1]),
      }
    );
    if (dist <= 1000) score += 10;
  }

  return score;
}

/**
 * Returns all found items that score at or above the match threshold,
 * sorted by score descending.
 */
export function findMatches(
  lostItem: MatchableItem,
  foundItems: MatchableItem[],
  threshold = 40
): ItemMatch[] {
  return foundItems
    .map((found) => ({ item: found, score: computeMatchScore(lostItem, found) }))
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score);
}
