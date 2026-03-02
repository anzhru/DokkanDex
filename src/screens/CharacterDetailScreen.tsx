import React, { useEffect } from 'react';
import { ScrollView, View, Text, Image, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Transformation } from '../types';
import { useCharacter } from '../hooks/useCharacter';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { getCharacterImageUrl } from '../utils/imageUtils';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

type Props = NativeStackScreenProps<RootStackParamList, 'CharacterDetail'>;

export function CharacterDetailScreen({ route, navigation }: Props) {
  const { characterId } = route.params;
  const { character, loading, error, refetch } = useCharacter(characterId);

  // Set header title once character is loaded
  useEffect(() => {
    if (character?.name) {
      navigation.setOptions({ title: character.name });
    }
  }, [character?.name, navigation]);

  if (loading) return <LoadingSpinner message="Loading character..." />;
  if (error || !character) return <ErrorView message={error ?? 'Character not found'} onRetry={refetch} />;

  const typeColor = character.type ? COLORS.type[character.type] : COLORS.card;
  const rarityColor = character.rarity ? COLORS.rarity[character.rarity] : COLORS.gold;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero image */}
      <Image
        source={{ uri: getCharacterImageUrl(character.id, character.imageURL) }}
        style={styles.art}
        resizeMode="contain"
      />

      {/* Type / Rarity / Class badges */}
      <View style={styles.header}>
        {character.type && (
          <View style={[styles.badge, { backgroundColor: typeColor }]}>
            <Text style={styles.badgeText}>{character.type}</Text>
          </View>
        )}
        {character.rarity && (
          <View style={[styles.badge, { backgroundColor: rarityColor }]}>
            <Text style={styles.badgeText}>{character.rarity}</Text>
          </View>
        )}
        {character.class && (
          <View style={[styles.badge, styles.classBadge]}>
            <Text style={styles.badgeText}>{character.class}</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{character.title ?? ''}</Text>
      <Text style={styles.name}>{character.name ?? 'Unknown'}</Text>

      {/* Base stats grid */}
      <View style={styles.statsGrid}>
        <StatColumn
          label="Base"
          hp={character.baseHP}
          atk={character.baseAttack}
          def={character.baseDefence}
        />
        <StatColumn
          label="Max Lv"
          hp={character.maxLevelHP}
          atk={character.maxLevelAttack}
          def={character.maxDefence}
        />
        <StatColumn
          label="Free Dupe"
          hp={character.freeDupeHP}
          atk={character.freeDupeAttack}
          def={character.freeDupeDefence}
        />
        <StatColumn
          label="Rainbow"
          hp={character.rainbowHP}
          atk={character.rainbowAttack}
          def={character.rainbowDefence}
        />
      </View>

      {/* Cost / Level row */}
      <View style={styles.infoRow}>
        <InfoPill label="Cost" value={character.cost} />
        <InfoPill label="Max Lv" value={character.maxLevel} />
        <InfoPill label="Max SA" value={character.maxSALevel} />
      </View>

      {/* Skills */}
      {character.leaderSkill && (
        <SkillSection label="Leader Skill" content={character.leaderSkill} ezaContent={character.ezaLeaderSkill} />
      )}
      {character.superAttack && (
        <SkillSection label="Super Attack" content={character.superAttack} ezaContent={character.ezaSuperAttack} />
      )}
      {character.ultraSuperAttack && (
        <SkillSection label="Ultra Super Attack" content={character.ultraSuperAttack} ezaContent={character.ezaUltraSuperAttack} />
      )}
      {character.passive && (
        <SkillSection label="Passive Skill" content={character.passive} ezaContent={character.ezaPassive} />
      )}
      {character.activeSkill && (
        <SkillSection
          label="Active Skill"
          content={character.activeSkill}
          subContent={character.activeSkillCondition ?? undefined}
        />
      )}

      {/* Categories */}
      {!!character.categories?.length && (
        <TagSection label="Categories" tags={character.categories} />
      )}

      {/* Links */}
      {!!character.links?.length && (
        <TagSection label="Links" tags={character.links} highlighted />
      )}

      {/* Ki Multiplier */}
      {character.kiMultiplier && (
        <Section label="Ki Multiplier" content={character.kiMultiplier} />
      )}

      {/* Transformations */}
      {!!character.transformations?.length && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Transformations</Text>
          {character.transformations.map((t, i) => (
            <TransformationCard key={t.transformedID ?? i} transformation={t} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatColumn({
  label, hp, atk, def,
}: {
  label: string;
  hp: number | null;
  atk: number | null;
  def: number | null;
}) {
  if (!hp && !atk && !def) return null;
  return (
    <View style={styles.statCol}>
      <Text style={styles.statColLabel}>{label}</Text>
      <StatRow icon="❤️" value={hp} />
      <StatRow icon="⚔️" value={atk} />
      <StatRow icon="🛡️" value={def} />
    </View>
  );
}

function StatRow({ icon, value }: { icon: string; value: number | null }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value?.toLocaleString() ?? '—'}</Text>
    </View>
  );
}

function InfoPill({ label, value }: { label: string; value: number | null }) {
  if (value == null) return null;
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoPillValue}>{value}</Text>
      <Text style={styles.infoPillLabel}>{label}</Text>
    </View>
  );
}

function SkillSection({
  label, content, ezaContent, subContent,
}: {
  label: string;
  content: string;
  ezaContent?: string | null;
  subContent?: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text style={styles.sectionContent}>{content}</Text>
      {subContent && (
        <Text style={styles.subContent}>Condition: {subContent}</Text>
      )}
      {ezaContent && (
        <>
          <Text style={styles.ezaLabel}>EZA</Text>
          <Text style={styles.sectionContent}>{ezaContent}</Text>
        </>
      )}
    </View>
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

function TagSection({ label, tags, highlighted = false }: { label: string; tags: string[]; highlighted?: boolean }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.tags}>
        {tags.map((tag) => (
          <View key={tag} style={[styles.tag, highlighted && styles.tagHighlighted]}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function TransformationCard({ transformation }: { transformation: Transformation }) {
  const typeColor = transformation.transformedType
    ? COLORS.type[transformation.transformedType as keyof typeof COLORS.type] ?? COLORS.card
    : COLORS.card;

  return (
    <View style={styles.transformCard}>
      {transformation.transformedImageURL && (
        <Image
          source={{ uri: transformation.transformedImageURL }}
          style={styles.transformImage}
          resizeMode="contain"
        />
      )}
      <View style={styles.transformInfo}>
        {transformation.transformedType && (
          <View style={[styles.badge, { backgroundColor: typeColor, alignSelf: 'flex-start', marginBottom: SPACING.xs }]}>
            <Text style={styles.badgeText}>{transformation.transformedType}</Text>
          </View>
        )}
        <Text style={styles.transformName}>{transformation.transformedName ?? 'Unknown'}</Text>
        {transformation.transformedPassive && (
          <Text style={styles.transformPassive} numberOfLines={3}>{transformation.transformedPassive}</Text>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: SPACING.xxl },

  art: { width: '100%', height: 280, backgroundColor: COLORS.surface },

  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  classBadge: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.text.muted,
  },
  badgeText: { color: COLORS.text.primary, fontSize: FONT_SIZES.sm, fontWeight: '700' },

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

  // Stat grid
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  statCol: { flex: 1, alignItems: 'center', gap: 4 },
  statColLabel: {
    color: COLORS.gold,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statIcon: { fontSize: 10 },
  statValue: { color: COLORS.text.primary, fontSize: FONT_SIZES.xs, fontWeight: '600' },

  // Info pills
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
  },
  infoPill: { alignItems: 'center' },
  infoPillValue: { color: COLORS.text.primary, fontSize: FONT_SIZES.xl, fontWeight: '700' },
  infoPillLabel: { color: COLORS.text.muted, fontSize: FONT_SIZES.xs, marginTop: 2 },

  // Sections
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
  sectionContent: { color: COLORS.text.primary, fontSize: FONT_SIZES.md, lineHeight: 20 },
  subContent: { color: COLORS.text.secondary, fontSize: FONT_SIZES.sm, marginTop: SPACING.xs, fontStyle: 'italic' },
  ezaLabel: {
    color: COLORS.accent,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
  },

  // Tags
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  tag: { backgroundColor: COLORS.surface, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: 6 },
  tagHighlighted: { borderWidth: 1, borderColor: COLORS.gold },
  tagText: { color: COLORS.text.primary, fontSize: FONT_SIZES.xs },

  // Transformations
  transformCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  transformImage: { width: 72, height: 72, borderRadius: 8, backgroundColor: COLORS.card },
  transformInfo: { flex: 1 },
  transformName: { color: COLORS.text.primary, fontSize: FONT_SIZES.md, fontWeight: '700', marginBottom: 4 },
  transformPassive: { color: COLORS.text.secondary, fontSize: FONT_SIZES.sm, lineHeight: 18 },
});
