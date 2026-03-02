import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CharacterSummary } from '../types';
import { getCharacterImageUrl } from '../utils/imageUtils';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

// ─── Rarity theming ──────────────────────────────────────────────────────────

const RARITY_BORDER: Record<string, string> = {
  LR:  '#FFD700',
  UR:  '#FF6B35',
  SSR: '#FFA500',
  SR:  '#4CAF50',
  R:   '#2196F3',
  N:   '#9E9E9E',
};

const RARITY_GLOW: Record<string, string> = {
  LR:  'rgba(255, 215,   0, 0.55)',
  UR:  'rgba(255, 107,  53, 0.45)',
  SSR: 'rgba(255, 165,   0, 0.40)',
  SR:  'rgba( 76, 175,  80, 0.35)',
  R:   'rgba( 33, 150, 243, 0.30)',
  N:   'rgba(158, 158, 158, 0.20)',
};

const TYPE_COLORS: Record<string, string> = {
  STR: '#e53e3e',
  AGL: '#3182ce',
  TEQ: '#38a169',
  INT: '#805ad5',
  PHY: '#d69e2e',
};

// Gradient stops: transparent at top, opaque dark at bottom
const CARD_GRADIENT: [string, string, string] = [
  'transparent',
  'rgba(10, 10, 30, 0.55)',
  'rgba(10, 10, 30, 0.97)',
];

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  character: CharacterSummary;
  cardWidth: number;
  onPress: (character: CharacterSummary) => void;
}

export function CharacterGridCard({ character, cardWidth, onPress }: Props) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = getCharacterImageUrl(character.id, imageError ? null : character.imageURL);
  const rarity    = character.rarity ?? 'N';
  const type      = character.type   ?? null;
  const borderColor = RARITY_BORDER[rarity] ?? RARITY_BORDER.N;
  const glowColor   = RARITY_GLOW[rarity]   ?? RARITY_GLOW.N;
  const typeColor   = type ? (TYPE_COLORS[type] ?? COLORS.card) : COLORS.card;

  // Card is slightly taller than a square to fit the info section
  const imageSize = cardWidth;
  const cardHeight = imageSize + 58;

  const cardStyle: ViewStyle = {
    width: cardWidth,
    height: cardHeight,
    borderColor,
    shadowColor: glowColor,
  };

  return (
    <TouchableOpacity
      style={[styles.card, cardStyle]}
      onPress={() => onPress(character)}
      activeOpacity={0.82}
    >
      {/* ── Character art ─────────────────────────────── */}
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { width: imageSize, height: imageSize }]}
        resizeMode="cover"
        onError={() => setImageError(true)}
      />

      {/* ── Gradient fade over the art bottom ─────────── */}
      <LinearGradient
        colors={CARD_GRADIENT}
        style={[styles.gradient, { width: imageSize, height: imageSize }]}
        start={{ x: 0, y: 0.35 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
      />

      {/* ── Rarity pill — top-right corner ────────────── */}
      <View style={[styles.rarityBadge, { backgroundColor: borderColor }]}>
        {rarity === 'LR' && <Text style={styles.rarityIcon}>★ </Text>}
        <Text style={styles.rarityText}>{rarity}</Text>
      </View>

      {/* ── Type badge — top-left corner ──────────────── */}
      {type && (
        <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
          <Text style={styles.typeText}>{type}</Text>
        </View>
      )}

      {/* ── Info section ──────────────────────────────── */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {character.name ?? 'Unknown'}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {character.title ?? ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    // Shadow (iOS)
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    // Shadow (Android)
    elevation: 6,
  },

  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: COLORS.card,
  },

  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  // ── Badges ────────────────────────────────────────

  rarityBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    // Slight dark border so it pops on any background
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.35)',
  },
  rarityIcon: {
    color: '#fff',
    fontSize: FONT_SIZES.xs - 1,
    lineHeight: 13,
  },
  rarityText: {
    color: '#fff',
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  typeBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.35)',
  },
  typeText: {
    color: '#fff',
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // ── Info section (sits below the art) ─────────────

  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 54,
    backgroundColor: 'rgba(10, 10, 30, 0.97)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    justifyContent: 'center',
    gap: 2,
  },
  name: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    lineHeight: 16,
  },
  title: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    lineHeight: 14,
  },
});
