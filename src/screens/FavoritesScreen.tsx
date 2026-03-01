import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

export function FavoritesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>⭐</Text>
      <Text style={styles.title}>Favorites</Text>
      <Text style={styles.subtitle}>Coming soon — save your favorite cards here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.text.muted,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
});
