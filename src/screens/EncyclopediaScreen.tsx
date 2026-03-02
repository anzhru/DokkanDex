import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { CharacterSummary, RootStackParamList } from '../types';
import { CharacterGridCard } from '../components/CharacterGridCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { useCharacters } from '../hooks/useCharacters';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

// ─── Layout constants ─────────────────────────────────────────────────────────

const COLUMNS        = 2;
const OUTER_PADDING  = SPACING.md;   // left/right screen padding
const CARD_GAP       = SPACING.sm;   // gap between columns

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>;

// ─── Component ────────────────────────────────────────────────────────────────

export function EncyclopediaScreen() {
  const navigation   = useNavigation<Nav>();
  const { width }    = useWindowDimensions();
  const inputRef     = useRef<TextInput>(null);

  const { characters, loading, error, refetch } = useCharacters();
  const [query, setQuery] = useState('');

  // ── Derived card width (responsive to screen size) ──────────────────
  const cardWidth = useMemo(
    () => Math.floor((width - OUTER_PADDING * 2 - CARD_GAP * (COLUMNS - 1)) / COLUMNS),
    [width],
  );

  // ── Client-side filter ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return characters;
    return characters.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q),
    );
  }, [characters, query]);

  const handlePress = useCallback(
    (character: CharacterSummary) => {
      navigation.navigate('CharacterDetail', { characterId: character.id });
    },
    [navigation],
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    inputRef.current?.blur();
  }, []);

  // ── Render ───────────────────────────────────────────────────────────

  if (loading) return <LoadingSpinner message="Loading characters…" />;
  if (error)   return <ErrorView message={error} onRetry={refetch} />;

  const showingAll    = query.trim() === '';
  const countLabel    = showingAll
    ? `${filtered.length} characters`
    : `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query.trim()}"`;

  return (
    <View style={styles.screen}>

      {/* ── Sticky search bar ─────────────────────────────────────── */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search by name or title…"
            placeholderTextColor={COLORS.text.muted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="never"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Result count */}
        <Text style={styles.countLabel}>{countLabel}</Text>
      </View>

      {/* ── Character grid ────────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={COLUMNS}
        renderItem={({ item }) => (
          <CharacterGridCard
            character={item}
            cardWidth={cardWidth}
            onPress={handlePress}
          />
        )}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        removeClippedSubviews
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={7}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔎</Text>
            <Text style={styles.emptyText}>No characters match "{query}"</Text>
          </View>
        }
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Search bar ──────────────────────────────────────────────────────

  searchContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: OUTER_PADDING,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 166, 35, 0.18)',   // subtle gold divider
    gap: SPACING.xs,
  },

  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : SPACING.xs,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 166, 35, 0.25)',
    gap: SPACING.sm,
  },

  searchIcon: {
    fontSize: 15,
  },

  searchInput: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.md,
    padding: 0,
  },

  clearButton: {
    color: COLORS.text.muted,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    paddingLeft: SPACING.xs,
  },

  countLabel: {
    color: COLORS.text.muted,
    fontSize: FONT_SIZES.xs,
    paddingHorizontal: SPACING.xs,
  },

  // ── Grid ────────────────────────────────────────────────────────────

  grid: {
    paddingHorizontal: OUTER_PADDING,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: CARD_GAP,
  },

  row: {
    gap: CARD_GAP,
    justifyContent: 'space-between',
  },

  // ── Empty state ─────────────────────────────────────────────────────

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxl * 2,
    gap: SPACING.md,
  },

  emptyEmoji: {
    fontSize: 52,
  },

  emptyText: {
    color: COLORS.text.muted,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
  },
});
