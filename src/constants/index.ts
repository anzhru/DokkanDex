export const COLORS = {
  // Dokkan-inspired palette
  background: '#1a1a2e',
  surface: '#16213e',
  card: '#0f3460',
  accent: '#e94560',
  gold: '#f5a623',
  text: {
    primary: '#ffffff',
    secondary: '#a0aec0',
    muted: '#718096',
  },
  type: {
    STR: '#e53e3e',
    AGL: '#3182ce',
    TEQ: '#38a169',
    INT: '#805ad5',
    PHY: '#d69e2e',
  },
  rarity: {
    N: '#718096',
    R: '#3182ce',
    SR: '#38a169',
    SSR: '#d69e2e',
    UR: '#e53e3e',
    LR: '#f5a623',
  },
} as const;

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const GRAPHQL_URL = 'https://dokkanapi.azurewebsites.net/graphql';
