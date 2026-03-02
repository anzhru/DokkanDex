import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFavorites } from '../context/FavoritesContext';
import { useCharacters } from '../hooks/useCharacters';
import { CharacterGridCard } from '../components/CharacterGridCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { RootStackParamList } from '../types';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

// ─── Screen ───────────────────────────────────────────────────────────────────

export function FavoritesScreen() {
  const navigation   = useNavigation<NavProp>();
  const { favoriteIds } = useFavorites();
  const { characters, loading } = useCharacters();
  const { width }    = useWindowDimensions();

  const cardWidth = Math.floor((width - SPACING.lg * 3) / 2);

  // Filter the full list down to only favorited characters
  const favorites = useMemo(
    () => characters.filter((c) => favoriteIds.has(c.id)),
    [characters, favoriteIds],
  );

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner message="Loading…" />;

  // ── Empty state ───────────────────────────────────────────────────────────
  if (favorites.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>⭐</Text>
        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
        <Text style={styles.emptySubtitle}>
          Open any character and tap the ☆ in the top-right corner to save them here.
        </Text>
      </View>
    );
  }

  // ── Character grid ────────────────────────────────────────────────────────
  return (
    <FlatList
      data={favorites}
      keyExtractor={(c) => c.id}
      numColumns={2}
      contentContainerStyle={styles.list}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
      initialNumToRender={12}
      windowSize={7}
      renderItem={({ item }) => (
        <CharacterGridCard
          character={item}
          cardWidth={cardWidth}
          onPress={() => navigation.navigate('CharacterDetail', { characterId: item.id })}
        />
      )}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Empty state ──────────────────────────────────────────────────────────
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: COLORS.text.muted,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Grid ─────────────────────────────────────────────────────────────────
  list: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 64,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
});
