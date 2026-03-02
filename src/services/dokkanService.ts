import { Character, CharacterSummary } from '../types';

// ─── Config ───────────────────────────────────────────────────────────────────

const GRAPHQL_URL = 'https://dokkanapi.azurewebsites.net/graphql';

// ─── GraphQL Fragments ────────────────────────────────────────────────────────

/** Minimal fields needed for list / search cards */
const SUMMARY_FIELDS = `
  id
  name
  title
  imageURL
  rarity
  class
  type
`;

/** All fields for the detail screen */
const FULL_FIELDS = `
  id
  name
  title
  imageURL
  rarity
  class
  type
  cost
  maxLevel
  maxSALevel

  leaderSkill
  ezaLeaderSkill
  superAttack
  ezaSuperAttack
  ultraSuperAttack
  ezaUltraSuperAttack
  passive
  ezaPassive
  activeSkill
  activeSkillCondition
  ezaActiveSkill
  ezaActiveSkillCondition

  baseHP
  baseAttack
  baseDefence
  maxLevelHP
  maxLevelAttack
  maxDefence
  freeDupeHP
  freeDupeAttack
  freeDupeDefence
  rainbowHP
  rainbowAttack
  rainbowDefence

  links
  categories
  kiMeter
  kiMultiplier
  transformationCondition

  transformations {
    transformedName
    transformedID
    transformedClass
    transformedType
    transformedSuperAttack
    transformedUltraSuperAttack
    transformedPassive
    transformedImageURL
  }
`;

// ─── Core fetch helper ────────────────────────────────────────────────────────

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

async function gqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Network error: ${response.status} ${response.statusText}`);
  }

  const json: GraphQLResponse<T> = await response.json();

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('; '));
  }

  if (json.data === undefined) {
    throw new Error('GraphQL response contained no data');
  }

  return json.data;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch all characters with summary fields (name, title, id, image, type, etc.).
 * NOTE: The API only covers UR and LR rarity characters.
 */
export async function fetchAllCharacters(): Promise<CharacterSummary[]> {
  const query = `
    query FetchAllCharacters {
      characters {
        ${SUMMARY_FIELDS}
      }
    }
  `;

  const data = await gqlFetch<{ characters: CharacterSummary[] }>(query);
  return data.characters ?? [];
}

/**
 * Fetch a single character by ID with full stats, skills, categories, links,
 * leader skill, and transformation data.
 */
export async function fetchCharacterById(id: string): Promise<Character> {
  const query = `
    query FetchCharacterById($id: String!) {
      character(id: $id) {
        ${FULL_FIELDS}
      }
    }
  `;

  const data = await gqlFetch<{ character: Character | null }>(query, { id });

  if (!data.character) {
    throw new Error(`Character with id "${id}" not found`);
  }

  return data.character;
}

/**
 * Search characters by name (case-insensitive substring match).
 * Returns summary fields suitable for a results list.
 */
export async function searchCharactersByName(name: string): Promise<CharacterSummary[]> {
  const query = `
    query SearchCharacters($name: String!) {
      characters(name: $name) {
        ${SUMMARY_FIELDS}
      }
    }
  `;

  const data = await gqlFetch<{ characters: CharacterSummary[] }>(query, { name });
  return data.characters ?? [];
}

/**
 * Filter characters by type, rarity, class, or categories.
 * All provided filters are combined with AND logic.
 */
export async function filterCharacters(filters: {
  type?: string;
  rarity?: string;
  class?: string;
  categories?: string[];
}): Promise<CharacterSummary[]> {
  const query = `
    query FilterCharacters(
      $type: String
      $rarity: String
      $class: String
      $categories: [String]
    ) {
      characters(
        type: $type
        rarity: $rarity
        class: $class
        categories: $categories
      ) {
        ${SUMMARY_FIELDS}
      }
    }
  `;

  const data = await gqlFetch<{ characters: CharacterSummary[] }>(query, filters);
  return data.characters ?? [];
}
