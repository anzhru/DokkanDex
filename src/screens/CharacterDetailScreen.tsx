import React from 'react';
import { ScrollView, View, Text, Image, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

type Props = NativeStackScreenProps<RootStackParamList, 'CharacterDetail'>;

export function CharacterDetailScreen({ route }: Props) {
  const { character } = route.params;
  const typeColor = COLORS.type[character.type];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image
        source={{ uri: character.artUrl }}
        style={styles.art}
        resizeMode="contain"
      />

      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
          <Text style={styles.typeBadgeText}>{character.type}</Text>
        </View>
        <Text style={styles.rarity}>{character.rarity}</Text>
      </View>

      <Text style={styles.title}>{character.title}</Text>
      <Text style={styles.name}>{character.name}</Text>

      <Section label="Leader Skill" content={character.leaderSkill} />
      <Section label="Super Attack" content={character.superAttack} />
      <Section label="Passive Skill" content={character.passiveSkill} />

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Categories</Text>
        <View style={styles.tags}>
          {character.categories.map((cat) => (
            <View key={cat} style={styles.tag}>
              <Text style={styles.tagText}>{cat}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Links</Text>
        <View style={styles.tags}>
          {character.links.map((link) => (
            <View key={link} style={[styles.tag, styles.linkTag]}>
              <Text style={styles.tagText}>{link}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.stats}>
        <Stat label="Cost" value={character.cost} />
        <Stat label="Max Lv" value={character.maxLevel} />
        <Stat label="Max SA" value={character.maxSALevel} />
      </View>
    </ScrollView>
  );
}

function Section({ label, content }: { label: string; content: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text style={styles.sectionContent}>{content}</Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: SPACING.xxl,
  },
  art: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    gap: SPACING.sm,
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  rarity: {
    color: COLORS.gold,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  title: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.sm,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },
  name: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    paddingHorizontal: SPACING.lg,
    marginTop: 2,
    marginBottom: SPACING.lg,
  },
  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
  },
  sectionLabel: {
    color: COLORS.gold,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  tag: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  linkTag: {
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  tagText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.xs,
  },
  stats: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.text.muted,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
});
