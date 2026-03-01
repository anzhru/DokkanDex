import React from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Character, RootStackParamList } from '../types';
import { CharacterCard } from '../components/CharacterCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { useCharacters } from '../hooks/useCharacters';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export function EncyclopediaScreen() {
  const navigation = useNavigation<Nav>();
  const { characters, loading, error, refetch } = useCharacters();

  if (loading) return <LoadingSpinner message="Loading characters..." />;
  if (error) return <ErrorView message={error} onRetry={refetch} />;

  function handlePress(character: Character) {
    navigation.navigate('CharacterDetail', { character });
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={characters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CharacterCard character={item} onPress={handlePress} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No characters found.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
});
