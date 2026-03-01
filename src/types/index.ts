export type Rarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'LR';

export type CardType = 'STR' | 'AGL' | 'TEQ' | 'INT' | 'PHY';

export type CharacterClass = 'Super' | 'Extreme';

export interface Character {
  id: number;
  name: string;
  title: string;
  rarity: Rarity;
  type: CardType;
  characterClass: CharacterClass;
  cost: number;
  maxLevel: number;
  maxSALevel: number;
  leaderSkill: string;
  superAttack: string;
  passiveSkill: string;
  categories: string[];
  links: string[];
  thumbnailUrl: string;
  artUrl: string;
}

export type RootStackParamList = {
  Main: undefined;
  CharacterDetail: { character: Character };
};

export type BottomTabParamList = {
  Encyclopedia: undefined;
  Search: undefined;
  Favorites: undefined;
};
