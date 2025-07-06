// Sanitize the AI response by removing mentions
export function sanitizeResponse(text: string): string {
  if (!text || text.trim() === "") {
    return "I apologize, but I cannot provide a meaningful response at this time.";
  }

  return text
    .replace(/@everyone/gi, "everyone") // Replace everyone mentions
    .replace(/@here/gi, "here") // Replace here mentions
    .replace(/<web_search_query>.*?<\/web_search_query>/g, " ") // Remove <web_search_query> and its content
    .replace(/<web_search(?:_[^>]*)?\/?>/gi, "") // Remove <web_search> and <web_search_***> tags
    .replace(/<search_result\/?>/gi, "") // Remove <search_result> tags
    .trim();
}

// Helper function to split messages that exceed Discord's character limit
export function splitMessage(text: string, maxLength = 2_000): string[] {
  const chunks: string[] = [];
  let currentChunk = "";

  const lines = text.split("\n");

  for (const line of lines) {
    // If adding this line would exceed the limit, push the current chunk and start a new one
    if (currentChunk.length + line.length + 1 > maxLength) {
      chunks.push(currentChunk);
      currentChunk = line + "\n";
    } else {
      currentChunk += line + "\n";
    }
  }

  // Don't forget the last chunk
  if (currentChunk) {
    chunks.push(sanitizeResponse(currentChunk));
  }

  return chunks;
}

// Function to calculate the Levenshtein distance between two strings
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = Array(b.length + 1)
    .fill(0)
    .map(() => Array(a.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1];
      } else {
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // Insertion
          matrix[j - 1][i] + 1, // Deletion
          matrix[j - 1][i - 1] + 1 // Substitution
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
