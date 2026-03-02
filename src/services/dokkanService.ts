import { Character, CharacterSummary } from '../types';

// ─── Data source ──────────────────────────────────────────────────────────────
//
// The original GraphQL API (dokkanapi.azurewebsites.net) is offline.
// We now fetch from the source data file in the same GitHub repo, which is
// publicly accessible via GitHub's raw CDN and never rate-limited for reads.
//
// The JSON is ~1.8 MB with 796 UR/LR characters.  It is fetched once per
// app session and kept in _cache so every subsequent call is instant.

const DATA_URL =
  'https://raw.githubusercontent.com/MNprojects/DokkanAPI/main/data/DokkanCharacterData.json';

// ─── In-memory cache (module-level singleton) ─────────────────────────────────

let _cache: Promise<Character[]> | null = null;

/** Load all characters once; return the cached promise on subsequent calls. */
function loadAll(): Promise<Character[]> {
  if (!_cache) {
    _cache = fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load character data: HTTP ${res.status}`);
        return res.json() as Promise<Record<string, unknown>[]>;
      })
      .then((raw) => raw.map(mapRaw))
      .catch((err) => {
        _cache = null; // allow a clean retry next time
        throw err;
      });
  }
  return _cache;
}

// ─── Raw → typed mapper ───────────────────────────────────────────────────────

function str(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}
function num(v: unknown): number | null {
  return typeof v === 'number' ? v : null;
}
function strArr(v: unknown): string[] | null {
  return Array.isArray(v) ? (v as string[]) : null;
}

function mapRaw(raw: Record<string, unknown>): Character {
  return {
    id:    str(raw.id)    ?? String(raw.id ?? ''),
    name:  str(raw.name),
    title: str(raw.title),

    imageURL: str(raw.imageURL),
    rarity:   str(raw.rarity)   as Character['rarity'],
    class:    str(raw.class)    as Character['class'],
    type:     str(raw.type)     as Character['type'],
    cost:     num(raw.cost),

    maxLevel:   num(raw.maxLevel),
    maxSALevel: num(raw.maxSALevel),

    leaderSkill:           str(raw.leaderSkill),
    ezaLeaderSkill:        str(raw.ezaLeaderSkill),
    superAttack:           str(raw.superAttack),
    ezaSuperAttack:        str(raw.ezaSuperAttack),
    ultraSuperAttack:      str(raw.ultraSuperAttack),
    ezaUltraSuperAttack:   str(raw.ezaUltraSuperAttack),
    passive:               str(raw.passive),
    ezaPassive:            str(raw.ezaPassive),
    activeSkill:           str(raw.activeSkill),
    activeSkillCondition:  str(raw.activeSkillCondition),
    ezaActiveSkill:        str(raw.ezaActiveSkill),
    ezaActiveSkillCondition: str(raw.ezaActiveSkillCondition),

    baseHP:          num(raw.baseHP),
    baseAttack:      num(raw.baseAttack),
    baseDefence:     num(raw.baseDefence),
    maxLevelHP:      num(raw.maxLevelHP),
    maxLevelAttack:  num(raw.maxLevelAttack),
    maxDefence:      num(raw.maxDefence),
    freeDupeHP:      num(raw.freeDupeHP),
    freeDupeAttack:  num(raw.freeDupeAttack),
    freeDupeDefence: num(raw.freeDupeDefence),
    rainbowHP:       num(raw.rainbowHP),
    rainbowAttack:   num(raw.rainbowAttack),
    rainbowDefence:  num(raw.rainbowDefence),

    links:      strArr(raw.links),
    categories: strArr(raw.categories),
    kiMeter:    strArr(raw.kiMeter),
    kiMultiplier:         str(raw.kiMultiplier),
    transformationCondition: str(raw.transformationCondition),

    transformations: Array.isArray(raw.transformations)
      ? (raw.transformations as Record<string, unknown>[]).map((t) => ({
          transformedName:          str(t.transformedName),
          transformedID:            str(t.transformedID),
          transformedClass:         str(t.transformedClass),
          transformedType:          str(t.transformedType),
          transformedSuperAttack:   str(t.transformedSuperAttack),
          transformedUltraSuperAttack: str(t.transformedUltraSuperAttack),
          transformedPassive:       str(t.transformedPassive),
          transformedImageURL:      str(t.transformedImageURL),
        }))
      : null,
  };
}

function toSummary(c: Character): CharacterSummary {
  return {
    id:       c.id,
    name:     c.name,
    title:    c.title,
    imageURL: c.imageURL,
    rarity:   c.rarity,
    class:    c.class,
    type:     c.type,
  };
}

// ─── Public API (same signatures as before — no changes needed in hooks/screens) ─

/**
 * Fetch all 796 UR/LR characters.  Cached after the first call.
 */
export async function fetchAllCharacters(): Promise<CharacterSummary[]> {
  const all = await loadAll();
  return all.map(toSummary);
}

/**
 * Return the full character record for a given ID.
 * Uses the in-memory cache — no extra network request after the first load.
 */
export async function fetchCharacterById(id: string): Promise<Character> {
  const all = await loadAll();
  const found = all.find((c) => c.id === id);
  if (!found) throw new Error(`Character "${id}" not found`);
  return found;
}

/**
 * Case-insensitive substring search across name AND title.
 * Instant after the initial load because filtering is done in-memory.
 */
export async function searchCharactersByName(query: string): Promise<CharacterSummary[]> {
  const all  = await loadAll();
  const q    = query.trim().toLowerCase();
  if (!q) return all.map(toSummary);
  return all
    .filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q),
    )
    .map(toSummary);
}

/**
 * Filter characters by type, rarity, class, and/or categories (AND logic).
 */
export async function filterCharacters(filters: {
  type?: string;
  rarity?: string;
  class?: string;
  categories?: string[];
}): Promise<CharacterSummary[]> {
  const all = await loadAll();
  return all
    .filter((c) => {
      if (filters.type   && c.type   !== filters.type)   return false;
      if (filters.rarity && c.rarity !== filters.rarity) return false;
      if (filters.class  && c.class  !== filters.class)  return false;
      if (filters.categories?.length) {
        const cCats = c.categories ?? [];
        if (!filters.categories.every((fc) => cCats.includes(fc))) return false;
      }
      return true;
    })
    .map(toSummary);
}
