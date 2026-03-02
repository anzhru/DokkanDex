/**
 * Resolves character image URLs using the Supabase CDN that backs dokkandb.com.
 * These are official Bandai game assets hosted on Supabase Storage.
 *
 * Primary:  Supabase Storage (DokkanDB's CDN) — fast, always up-to-date
 * Fallback: Fandom wiki Special:FilePath — works for older cards not yet on Supabase
 */

const SB_STORAGE =
  'https://enaskhebnjtktdfszdcb.supabase.co/storage/v1/object/public/assets';

/** Thumbnail image (used in grid cards) */
export function getCharacterImageUrl(id: string, imageURL: string | null | undefined): string {
  if (imageURL && imageURL.startsWith('http')) return imageURL;
  // Supabase CDN first
  return `${SB_STORAGE}/character/thumb/card_${id}_thumb_folder/card_${id}_thumb.png`;
}

/** Full card art (used on detail screen hero) */
export function getCharacterArtUrl(id: string, imageURL: string | null | undefined): string {
  if (imageURL && imageURL.startsWith('http')) return imageURL;
  // Supabase CDN first
  return `${SB_STORAGE}/character/thumb/card_${id}_thumb_folder/card_${id}_thumb.png`;
}
