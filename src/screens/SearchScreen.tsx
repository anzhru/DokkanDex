import React, { useState, useCallback } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Character, RootStackParamList } from '../types';
import { CharacterCard } from '../components/CharacterCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { searchCharacters } from '../services/dokkanService';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const data = await searchCharacters(text.trim());
      setResults(data);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search characters..."
          placeholderTextColor={COLORS.text.muted}
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <LoadingSpinner message="Searching..." />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CharacterCard
              character={item}
              onPress={(c) => navigation.navigate('CharacterDetail', { character: c })}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            searched ? (
              <Text style={styles.empty}>No characters found for "{query}"</Text>
            ) : (
              <Text style={styles.hint}>Enter at least 2 characters to search</Text>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  input: {
    backgroundColor: COLORS.card,
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
  },
  list: {
    paddingVertical: SPACING.sm,
  },
  empty: {
    color: COLORS.text.muted,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },
  hint: {
    color: COLORS.text.muted,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },
});
