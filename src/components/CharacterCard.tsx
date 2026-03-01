import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Character } from '../types';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

interface Props {
  character: Character;
  onPress: (character: Character) => void;
}

export function CharacterCard({ character, onPress }: Props) {
  const typeColor = COLORS.type[character.type];
  const rarityColor = COLORS.rarity[character.rarity];

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(character)} activeOpacity={0.8}>
      <Image
        source={{ uri: character.thumbnailUrl }}
        style={[styles.thumbnail, { borderColor: typeColor }]}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: typeColor }]}>
            <Text style={styles.badgeText}>{character.type}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: rarityColor }]}>
            <Text style={styles.badgeText}>{character.rarity}</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>{character.title}</Text>
        <Text style={styles.name} numberOfLines={1}>{character.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    padding: SPACING.sm,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: COLORS.surface,
  },
  info: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  badges: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  badge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  title: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.sm,
    marginBottom: 2,
  },
  name: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
});
