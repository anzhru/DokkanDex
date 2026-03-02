/**
 * Resolves a character's thumbnail image URL.
 *
 * Priority:
 *  1. imageURL returned directly by the DokkanAPI (scraped from Fandom wiki)
 *  2. Fandom wiki Special:FilePath fallback, constructed from the character ID.
 *     The Dokkan wiki names card thumbs "Card_{id}_thumb.png", so
 *     Special:FilePath redirects to the real CDN URL automatically.
 */
export function getCharacterImageUrl(id: string, imageURL: string | null | undefined): string {
  if (imageURL) return imageURL;
  return `https://dbz-dokkanbattle.fandom.com/wiki/Special:FilePath/Card_${id}_thumb.png`;
}

/**
 * Resolves the full card art URL (higher res than thumb).
 */
export function getCharacterArtUrl(id: string, imageURL: string | null | undefined): string {
  if (imageURL) return imageURL;
  return `https://dbz-dokkanbattle.fandom.com/wiki/Special:FilePath/Card_${id}.png`;
}
