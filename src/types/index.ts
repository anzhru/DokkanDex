// ─── Enums / Literals ────────────────────────────────────────────────────────

export type Rarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'LR';
export type CardType = 'STR' | 'AGL' | 'TEQ' | 'INT' | 'PHY';
export type CharacterClass = 'Super' | 'Extreme';

// ─── API Types (match DokkanAPI GraphQL schema exactly) ──────────────────────

export interface Transformation {
  transformedName: string | null;
  transformedID: string | null;
  transformedClass: string | null;
  transformedType: string | null;
  transformedSuperAttack: string | null;
  transformedUltraSuperAttack: string | null;
  transformedPassive: string | null;
  transformedImageURL: string | null;
}

/** Full character — returned by the `character(id)` query */
export interface Character {
  id: string;
  name: string | null;
  title: string | null;

  imageURL: string | null;
  rarity: Rarity | null;
  class: CharacterClass | null;
  type: CardType | null;
  cost: number | null;

  // Leveling
  maxLevel: number | null;
  maxSALevel: number | null;

  // Skills
  leaderSkill: string | null;
  ezaLeaderSkill: string | null;
  superAttack: string | null;
  ezaSuperAttack: string | null;
  ultraSuperAttack: string | null;
  ezaUltraSuperAttack: string | null;
  passive: string | null;
  ezaPassive: string | null;
  activeSkill: string | null;
  activeSkillCondition: string | null;
  ezaActiveSkill: string | null;
  ezaActiveSkillCondition: string | null;

  // Stats — base
  baseHP: number | null;
  baseAttack: number | null;
  baseDefence: number | null;

  // Stats — max level
  maxLevelHP: number | null;
  maxLevelAttack: number | null;
  maxDefence: number | null;

  // Stats — free dupe
  freeDupeHP: number | null;
  freeDupeAttack: number | null;
  freeDupeDefence: number | null;

  // Stats — rainbow (max potential)
  rainbowHP: number | null;
  rainbowAttack: number | null;
  rainbowDefence: number | null;

  // Collections
  links: string[] | null;
  categories: string[] | null;
  kiMeter: string[] | null;
  kiMultiplier: string | null;

  // Transformations
  transformations: Transformation[] | null;
  transformationCondition: string | null;
}

/** Lightweight character — used in list / search results */
export interface CharacterSummary {
  id: string;
  name: string | null;
  title: string | null;
  imageURL: string | null;
  rarity: Rarity | null;
  class: CharacterClass | null;
  type: CardType | null;
}

// ─── Navigation Types ─────────────────────────────────────────────────────────

export type RootStackParamList = {
  Main: undefined;
  CharacterDetail: { characterId: string };
};

export type BottomTabParamList = {
  Encyclopedia: undefined;
  Search: undefined;
  Favorites: undefined;
};
