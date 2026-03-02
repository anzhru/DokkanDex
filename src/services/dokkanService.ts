/**
 * DokkanDex Data Service — powered by DokkanDB (dokkandb.com) / Supabase
 *
 * Data source: the public Supabase database behind dokkandb.com, which mirrors
 * the official Dokkan Battle EN game database and is updated within days of
 * each global patch.  The anon key embedded here is safe to ship — it is the
 * same key the website uses in its own client-side JavaScript and only grants
 * read access to publicly-facing data.
 *
 * Coverage: ~10 000+ UR + LR cards (vs 796 in the old MNprojects JSON),
 * updated through the most recent global banner as of the build date.
 */

import { Character, CharacterSummary, Rarity, CardType, CharacterClass } from '../types';

// ─── Supabase config ──────────────────────────────────────────────────────────

const SB_BASE = 'https://enaskhebnjtktdfszdcb.supabase.co/rest/v1';
const SB_KEY  =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuYXNraGVibmp0a3RkZnN6ZGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NjM1NDIsImV4cCI6MjA2MDUzOTU0Mn0' +
  '.LS5ZGNF_WimW10kIqk1_h1ntWcQlSuozOZmqBfOsPHo';

const SB_STORAGE =
  'https://enaskhebnjtktdfszdcb.supabase.co/storage/v1/object/public/assets';

/** Append the apikey to any Supabase REST path and return the response. */
function sbFetch(path: string, opts?: RequestInit): Promise<Response> {
  const sep = path.includes('?') ? '&' : '?';
  return fetch(`${SB_BASE}${path}${sep}apikey=${SB_KEY}`, opts);
}

// ─── Image helpers ────────────────────────────────────────────────────────────

export function cardThumbUrl(cardId: number | string): string {
  return `${SB_STORAGE}/character/thumb/card_${cardId}_thumb_folder/card_${cardId}_thumb.png`;
}

// ─── Rarity / element mappings ────────────────────────────────────────────────

const RARITY_MAP: Record<number, Rarity> = {
  5: 'LR', 4: 'UR', 3: 'SSR', 2: 'SR', 1: 'R', 0: 'N',
};

const TYPE_MAP: readonly CardType[] = ['STR', 'AGL', 'TEQ', 'INT', 'PHY'];

/** element % 10 → STR / AGL / TEQ / INT / PHY */
function elementType(element: number): CardType {
  return TYPE_MAP[element % 10] ?? 'STR';
}

/** floor(element / 10) → 0 = Super, 1 = Extreme, 2+ = Super (DAIMA, etc.) */
function elementClass(element: number): CharacterClass {
  return Math.floor(element / 10) === 1 ? 'Extreme' : 'Super';
}

// ─── Raw row shapes from Supabase ────────────────────────────────────────────

interface RawCard {
  id: number;
  name: string;                     // Japanese for newer cards; EN for older
  rarity: number;
  element: number;
  card_unique_info_id: number;
  passive_skill_set_id: number | null;
  leader_skill_set_id: number | null;
  link_skill1_id: number | null;
  link_skill2_id: number | null;
  link_skill3_id: number | null;
  link_skill4_id: number | null;
  link_skill5_id: number | null;
  link_skill6_id: number | null;
  link_skill7_id: number | null;
  cost: number | null;
  lv_max: number | null;
  skill_lv_max: number | null;
  hp_init: number | null;
  hp_max: number | null;
  atk_init: number | null;
  atk_max: number | null;
  def_init: number | null;
  def_max: number | null;
}

const CARD_SELECT = [
  'id', 'name', 'rarity', 'element', 'card_unique_info_id',
  'passive_skill_set_id', 'leader_skill_set_id',
  'link_skill1_id', 'link_skill2_id', 'link_skill3_id',
  'link_skill4_id', 'link_skill5_id', 'link_skill6_id', 'link_skill7_id',
  'cost', 'lv_max', 'skill_lv_max',
  'hp_init', 'hp_max', 'atk_init', 'atk_max', 'def_init', 'def_max',
].join(',');

// ─── Lookup tables ────────────────────────────────────────────────────────────

interface Lookup {
  titles:     Map<number, string>;  // card_unique_info_id → display name
  categories: Map<number, string>;  // category_id → name
  links:      Map<number, string>;  // link_skill_id → name
}

let _lookup: Promise<Lookup> | null = null;

function loadLookup(): Promise<Lookup> {
  if (_lookup) return _lookup;
  _lookup = Promise.all([
    sbFetch('/card_unique_infos?select=id,name&limit=10000').then(r => r.json()),
    sbFetch('/card_categories?select=id,name&limit=1000').then(r => r.json()),
    sbFetch('/link_skills?select=id,name&limit=1000').then(r => r.json()),
  ])
    .then(([infos, cats, lnks]: [any[], any[], any[]]) => ({
      titles:     new Map(infos.map(x => [x.id as number, (x.name as string) ?? ''])),
      categories: new Map(cats.map(x  => [x.id as number, (x.name as string) ?? ''])),
      links:      new Map(lnks.map(x  => [x.id as number, (x.name as string) ?? ''])),
    }))
    .catch(err => { _lookup = null; throw err; });
  return _lookup;
}

// ─── Card list (all UR + LR) ──────────────────────────────────────────────────

const PAGE_SIZE = 1000;

/** Fetch UR+LR cards in parallel pages; returns a flat array. */
async function fetchAllRawCards(): Promise<RawCard[]> {
  // First call: get total count from Content-Range header
  const probe = await sbFetch(
    `/cards?rarity=gte.4&select=id&limit=1`,
    { headers: { Prefer: 'count=exact' } },
  );
  const range   = probe.headers.get('content-range') ?? '';   // "0-0/10395"
  const total   = parseInt(range.split('/')[1] ?? '12000', 10) || 12000;
  const nPages  = Math.ceil(total / PAGE_SIZE);

  const pages = await Promise.all(
    Array.from({ length: nPages }, (_, i) =>
      sbFetch(
        `/cards?rarity=gte.4&select=${CARD_SELECT}&order=rarity.desc,id.desc&limit=${PAGE_SIZE}&offset=${i * PAGE_SIZE}`,
      ).then(r => r.json() as Promise<RawCard[]>),
    ),
  );

  return pages.flat();
}

// Combined module-level cache
interface AllData {
  cards:  RawCard[];
  lookup: Lookup;
}

let _all: Promise<AllData> | null = null;

function loadAll(): Promise<AllData> {
  if (_all) return _all;
  _all = Promise.all([fetchAllRawCards(), loadLookup()])
    .then(([cards, lookup]) => ({ cards, lookup }))
    .catch(err => { _all = null; throw err; });
  return _all;
}

// ─── Summary builder ──────────────────────────────────────────────────────────

function toSummary(raw: RawCard, lookup: Lookup): CharacterSummary {
  const title = lookup.titles.get(raw.card_unique_info_id) ?? null;
  return {
    id:       String(raw.id),
    name:     title ?? raw.name ?? null,
    title:    null,
    imageURL: cardThumbUrl(raw.id),
    rarity:   RARITY_MAP[raw.rarity] ?? null,
    class:    elementClass(raw.element),
    type:     elementType(raw.element),
  };
}

// ─── Detail fetcher (on-demand, cached per card ID) ───────────────────────────

const _detailCache = new Map<string, Character>();

/** Returns true if the string looks like English/ASCII (not Japanese). */
function looksEnglish(s: string | null | undefined): boolean {
  if (!s) return false;
  // Allow ASCII printable chars + common punctuation
  return /^[\x00-\x7F\n]+$/.test(s);
}

async function buildDetail(id: string, raw: RawCard, lookup: Lookup): Promise<Character> {
  if (_detailCache.has(id)) return _detailCache.get(id)!;

  const cid = raw.id;

  // ── Parallel first-tier fetches ──────────────────────────────────────────
  const [leaderRows, passiveRows, specialsRows, activesRows, catRows] =
    await Promise.all([
      raw.leader_skill_set_id
        ? sbFetch(`/leader_skill_sets?id=eq.${raw.leader_skill_set_id}&select=name,description`).then(r => r.json())
        : Promise.resolve([] as any[]),

      raw.passive_skill_set_id
        ? sbFetch(`/passive_skill_sets?id=eq.${raw.passive_skill_set_id}&select=name,description`).then(r => r.json())
        : Promise.resolve([] as any[]),

      sbFetch(`/card_specials?card_id=eq.${cid}&select=special_set_id,style,lv_start&order=lv_start.asc`).then(r => r.json()),

      sbFetch(`/card_active_skills?card_id=eq.${cid}&select=active_skill_set_id`).then(r => r.json()),

      sbFetch(`/card_card_categories?card_id=eq.${cid}&select=card_category_id&order=num.asc`).then(r => r.json()),
    ]);

  // ── Resolve special sets ─────────────────────────────────────────────────
  const baseSpecials = (specialsRows as any[]).filter(s => s.lv_start === 0);
  const ezaSpecials  = (specialsRows as any[]).filter(s => s.lv_start > 0);
  const allSpecialIds = [...new Set(
    [...baseSpecials, ...ezaSpecials].map(s => s.special_set_id as number),
  )];

  const activeSetId: number | undefined = (activesRows as any[])[0]?.active_skill_set_id;

  const [specialSets, activeSetRows] = await Promise.all([
    allSpecialIds.length
      ? sbFetch(`/special_sets?id=in.(${allSpecialIds.join(',')})&select=id,name,description`).then(r => r.json())
      : Promise.resolve([] as any[]),

    activeSetId
      ? sbFetch(`/active_skill_sets?id=eq.${activeSetId}&select=name,effect_description,condition_description`).then(r => r.json())
      : Promise.resolve([] as any[]),
  ]);

  const specialMap = new Map<number, { name: string; description: string }>(
    (specialSets as any[]).map(s => [s.id as number, s]),
  );

  /** Return "Move Name: effect text" for a given SA style and EZA flag.
   *  Returns null if no matching special exists or the text is non-English. */
  function saText(style: 'Normal' | 'Hyper', eza: boolean): string | null {
    const pool = eza ? ezaSpecials : baseSpecials;
    const hit  = pool.find(s => s.style === style);
    if (!hit) return null;
    const set  = specialMap.get(hit.special_set_id);
    if (!set)  return null;
    const desc = set.description ?? '';
    const name = set.name ?? '';
    const combined = desc ? `${name}: ${desc}` : name;
    // Only show English text; Japanese text shows as garbled in an EN app
    return looksEnglish(combined) ? combined : null;
  }

  // ── Categories & links ──────────────────────────────────────────────────
  const categories = (catRows as any[])
    .map(r => lookup.categories.get(r.card_category_id))
    .filter((n): n is string => !!n);

  const linkIds = [
    raw.link_skill1_id, raw.link_skill2_id, raw.link_skill3_id,
    raw.link_skill4_id, raw.link_skill5_id, raw.link_skill6_id,
    raw.link_skill7_id,
  ].filter((x): x is number => !!x);

  const links = linkIds
    .map(lid => lookup.links.get(lid))
    .filter((n): n is string => !!n);

  const displayName = lookup.titles.get(raw.card_unique_info_id) ?? raw.name ?? null;
  const leaderDesc  = (leaderRows as any[])[0]?.description ?? null;
  const passiveDesc = (passiveRows as any[])[0]?.description ?? null;
  const activeRow   = (activeSetRows as any[])[0] ?? null;

  const character: Character = {
    id:    String(cid),
    name:  displayName,
    title: null,

    imageURL: cardThumbUrl(cid),
    rarity:   RARITY_MAP[raw.rarity] ?? null,
    class:    elementClass(raw.element),
    type:     elementType(raw.element),
    cost:     raw.cost,

    maxLevel:   raw.lv_max,
    maxSALevel: raw.skill_lv_max,

    leaderSkill:          looksEnglish(leaderDesc) ? leaderDesc : null,
    ezaLeaderSkill:       null,
    superAttack:          saText('Normal', false),
    ezaSuperAttack:       saText('Normal', true),
    ultraSuperAttack:     saText('Hyper',  false),
    ezaUltraSuperAttack:  saText('Hyper',  true),
    passive:              looksEnglish(passiveDesc) ? passiveDesc : null,
    ezaPassive:           null,
    activeSkill:          activeRow?.effect_description ?? null,
    activeSkillCondition: activeRow?.condition_description ?? null,
    ezaActiveSkill:       null,
    ezaActiveSkillCondition: null,

    baseHP:      raw.hp_init,
    baseAttack:  raw.atk_init,
    baseDefence: raw.def_init,
    maxLevelHP:     raw.hp_max,
    maxLevelAttack: raw.atk_max,
    maxDefence:     raw.def_max,
    freeDupeHP:     null,
    freeDupeAttack: null,
    freeDupeDefence: null,
    rainbowHP:    null,
    rainbowAttack: null,
    rainbowDefence: null,

    links,
    categories,
    kiMeter:      null,
    kiMultiplier: null,
    transformationCondition: null,
    transformations: null,
  };

  _detailCache.set(id, character);
  return character;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch all ~10 000 UR + LR character summaries.
 * Results are cached after the first load; subsequent calls are instant.
 */
export async function fetchAllCharacters(): Promise<CharacterSummary[]> {
  const { cards, lookup } = await loadAll();
  return cards.map(raw => toSummary(raw, lookup));
}

/**
 * Fetch the full Character record for the given ID.
 * The card list is loaded from the module cache; skill / category data is
 * fetched on-demand from Supabase and cached per card.
 */
export async function fetchCharacterById(id: string): Promise<Character> {
  const { cards, lookup } = await loadAll();
  const raw = cards.find(c => String(c.id) === id);
  if (!raw) throw new Error(`Character "${id}" not found`);
  return buildDetail(id, raw, lookup);
}

/**
 * Case-insensitive substring search across the character's display name.
 * Runs entirely in-memory after the initial load.
 */
export async function searchCharactersByName(query: string): Promise<CharacterSummary[]> {
  const { cards, lookup } = await loadAll();
  const q = query.trim().toLowerCase();
  if (!q) return cards.map(raw => toSummary(raw, lookup));
  return cards
    .filter(raw => {
      const title = lookup.titles.get(raw.card_unique_info_id) ?? '';
      return title.toLowerCase().includes(q) || (raw.name ?? '').toLowerCase().includes(q);
    })
    .map(raw => toSummary(raw, lookup));
}

/**
 * Filter characters by type, rarity, and/or class.
 */
export async function filterCharacters(filters: {
  type?: string;
  rarity?: string;
  class?: string;
  categories?: string[];
}): Promise<CharacterSummary[]> {
  const { cards, lookup } = await loadAll();
  return cards
    .filter(raw => {
      if (filters.type   && elementType(raw.element)  !== filters.type)   return false;
      if (filters.rarity && RARITY_MAP[raw.rarity]    !== filters.rarity) return false;
      if (filters.class  && elementClass(raw.element) !== filters.class)  return false;
      return true;
    })
    .map(raw => toSummary(raw, lookup));
}
