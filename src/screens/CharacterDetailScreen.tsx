import React, { useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Transformation } from '../types';
import { useCharacter } from '../hooks/useCharacter';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { getCharacterImageUrl } from '../utils/imageUtils';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { useFavorites } from '../context/FavoritesContext';

// ─── Local theme maps ─────────────────────────────────────────────────────────

const TYPE_COLOR: Record<string, string> = {
  STR: '#e53e3e',
  AGL: '#3182ce',
  TEQ: '#38a169',
  INT: '#805ad5',
  PHY: '#d69e2e',
};

const TYPE_ICON: Record<string, string> = {
  STR: '🔴',
  AGL: '🔵',
  TEQ: '🟢',
  INT: '🟣',
  PHY: '🟡',
};

const RARITY_COLOR: Record<string, string> = {
  LR:  '#FFD700',
  UR:  '#FF6B35',
  SSR: '#FFA500',
  SR:  '#4CAF50',
  R:   '#2196F3',
  N:   '#9E9E9E',
};

// Gradient: transparent image top → background colour at the bottom
const HERO_GRADIENT: readonly [string, string, string] = [
  'transparent',
  'rgba(26, 26, 46, 0.65)',
  COLORS.background,
] as const;

// ─── Screen ───────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<RootStackParamList, 'CharacterDetail'>;

export function CharacterDetailScreen({ route, navigation }: Props) {
  const { characterId } = route.params;
  const { character, loading, error, refetch } = useCharacter(characterId);
  const { width } = useWindowDimensions();
  const { isFavorite, toggleFavorite } = useFavorites();

  const heroHeight = Math.round(width * 0.9);
  const fav = isFavorite(characterId);

  useEffect(() => {
    navigation.setOptions({
      title: character?.name ?? '',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => toggleFavorite(characterId)}
          style={{ marginRight: 4, padding: 6 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={{ fontSize: 26 }}>{fav ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      ),
    });
  }, [character?.name, navigation, fav, characterId, toggleFavorite]);

  if (loading) return <LoadingSpinner message="Loading character…" />;
  if (error || !character) {
    return <ErrorView message={error ?? 'Character not found'} onRetry={refetch} />;
  }

  const typeColor   = character.type   ? TYPE_COLOR[character.type]     : COLORS.card;
  const rarityColor = character.rarity ? RARITY_COLOR[character.rarity] : COLORS.gold;
  const typeIcon    = character.type   ? TYPE_ICON[character.type]      : '';
  const imageUri    = getCharacterImageUrl(character.id, character.imageURL);

  // Rainbow stats exist → show full 4-tier table; otherwise show 2-tier
  const hasRainbow = !!(character.rainbowHP || character.rainbowAttack || character.rainbowDefence);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ━━━ HERO IMAGE with gradient overlay ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <View style={{ width, height: heroHeight }}>
        {/* Type-tinted background behind image */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: typeColor, opacity: 0.12 }]} />

        <Image
          source={{ uri: imageUri }}
          style={[StyleSheet.absoluteFill, { width, height: heroHeight }]}
          resizeMode="contain"
        />

        {/* Bottom gradient fade so the name text is always legible */}
        <LinearGradient
          colors={HERO_GRADIENT}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0.3 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />

        {/* Name / Title floating over gradient */}
        <View style={styles.heroText}>
          {character.title ? (
            <Text style={styles.heroTitle} numberOfLines={2}>{character.title}</Text>
          ) : null}
          <Text style={styles.heroName} numberOfLines={2}>
            {character.name ?? 'Unknown'}
          </Text>
        </View>
      </View>

      {/* ━━━ TYPE ACCENT BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <View style={[styles.typeBar, { backgroundColor: typeColor }]} />

      {/* ━━━ BADGES ROW ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <View style={styles.badgesRow}>
        {character.type && (
          <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
            <Text style={styles.badgeEmoji}>{typeIcon}</Text>
            <Text style={styles.badgeLabel}>{character.type}</Text>
          </View>
        )}
        {character.rarity && (
          <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
            {character.rarity === 'LR' && <Text style={styles.badgeEmoji}>★ </Text>}
            <Text style={styles.badgeLabel}>{character.rarity}</Text>
          </View>
        )}
        {character.class && (
          <View style={styles.classBadge}>
            <Text style={styles.classBadgeLabel}>{character.class}</Text>
          </View>
        )}
      </View>

      {/* ━━━ INFO PILLS (Cost / Max Level / Max SA) ━━━━━━━━━━━━━━━━━━━━━━━ */}
      {(character.cost || character.maxLevel || character.maxSALevel) && (
        <View style={styles.infoRow}>
          <InfoPill icon="💰" label="Cost"   value={character.cost} />
          <Divider />
          <InfoPill icon="⬆️" label="Max Lv" value={character.maxLevel} />
          <Divider />
          <InfoPill icon="⚡" label="Max SA" value={character.maxSALevel} />
        </View>
      )}

      {/* ━━━ SKILLS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

      {character.leaderSkill && (
        <SkillCard
          icon="👑"
          label="Leader Skill"
          content={character.leaderSkill}
          ezaContent={character.ezaLeaderSkill}
          accentColor={COLORS.gold}
        />
      )}

      {character.superAttack && (
        <SkillCard
          icon="⚡"
          label="Super Attack"
          content={character.superAttack}
          ezaContent={character.ezaSuperAttack}
          accentColor={typeColor}
        />
      )}

      {character.ultraSuperAttack && (
        <SkillCard
          icon="🌟"
          label="Ultra Super Attack"
          content={character.ultraSuperAttack}
          ezaContent={character.ezaUltraSuperAttack}
          accentColor={typeColor}
        />
      )}

      {character.passive && (
        <SkillCard
          icon="✨"
          label="Passive Skill"
          content={character.passive}
          ezaContent={character.ezaPassive}
          accentColor="#a855f7"
        />
      )}

      {character.activeSkill && (
        <SkillCard
          icon="🎯"
          label="Active Skill"
          content={character.activeSkill}
          subNote={character.activeSkillCondition ?? undefined}
          accentColor={COLORS.accent}
        />
      )}

      {/* ━━━ STATS TABLE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {(character.baseHP || character.baseAttack || character.baseDefence) && (
        <SectionCard icon="📊" label="Stats">
          {/* Column headers */}
          <View style={styles.statsHeaderRow}>
            <View style={styles.statsLabelCol} />
            <Text style={styles.statsColHeader}>Base</Text>
            <Text style={styles.statsColHeader}>Max Lv</Text>
            {hasRainbow && <Text style={[styles.statsColHeader, styles.rainbowHeader]}>Rainbow</Text>}
          </View>
          <StatRow
            icon="❤️"
            label="HP"
            base={character.baseHP}
            max={character.maxLevelHP}
            rainbow={hasRainbow ? character.rainbowHP : undefined}
          />
          <StatRow
            icon="⚔️"
            label="ATK"
            base={character.baseAttack}
            max={character.maxLevelAttack}
            rainbow={hasRainbow ? character.rainbowAttack : undefined}
          />
          <StatRow
            icon="🛡️"
            label="DEF"
            base={character.baseDefence}
            max={character.maxDefence}
            rainbow={hasRainbow ? character.rainbowDefence : undefined}
          />
        </SectionCard>
      )}

      {/* ━━━ CATEGORIES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {!!character.categories?.length && (
        <SectionCard icon="📂" label="Categories">
          <View style={styles.tagWrap}>
            {character.categories.map((cat) => (
              <View key={cat} style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{cat}</Text>
              </View>
            ))}
          </View>
        </SectionCard>
      )}

      {/* ━━━ LINK SKILLS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {!!character.links?.length && (
        <SectionCard icon="🔗" label="Link Skills">
          <View style={styles.tagWrap}>
            {character.links.map((link) => (
              <View key={link} style={styles.linkTag}>
                <Text style={styles.linkTagText}>{link}</Text>
              </View>
            ))}
          </View>
        </SectionCard>
      )}

      {/* ━━━ KI MULTIPLIER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {character.kiMultiplier && (
        <SectionCard icon="🔮" label="Ki Multiplier">
          <Text style={styles.bodyText}>{character.kiMultiplier}</Text>
        </SectionCard>
      )}

      {/* ━━━ TRANSFORMATIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {!!character.transformations?.length && (
        <SectionCard icon="🔄" label="Transformations">
          {character.transformations.map((t, i) => (
            <TransformCard key={t.transformedID ?? i} t={t} />
          ))}
        </SectionCard>
      )}
    </ScrollView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Divider() {
  return <View style={styles.pillDivider} />;
}

function InfoPill({ icon, label, value }: { icon: string; label: string; value: number | null }) {
  if (value == null) return null;
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoPillIcon}>{icon}</Text>
      <Text style={styles.infoPillValue}>{value}</Text>
      <Text style={styles.infoPillLabel}>{label}</Text>
    </View>
  );
}

// Generic section wrapper with header
function SectionCard({
  icon, label, children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderIcon}>{icon}</Text>
        <Text style={styles.cardHeaderLabel}>{label}</Text>
      </View>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

// Skill section — supports EZA variant and sub-note (active skill condition)
function SkillCard({
  icon, label, content, ezaContent, subNote, accentColor,
}: {
  icon: string;
  label: string;
  content: string;
  ezaContent?: string | null;
  subNote?: string;
  accentColor: string;
}) {
  return (
    <View style={[styles.card, { borderLeftColor: accentColor, borderLeftWidth: 3 }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderIcon}>{icon}</Text>
        <Text style={[styles.cardHeaderLabel, { color: accentColor }]}>{label}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.bodyText}>{content}</Text>
        {subNote ? (
          <Text style={styles.subNote}>⏱ Activates when: {subNote}</Text>
        ) : null}
        {ezaContent ? (
          <View style={styles.ezaBlock}>
            <View style={styles.ezaDivider}>
              <View style={styles.ezaLine} />
              <View style={styles.ezaPill}>
                <Text style={styles.ezaPillText}>EZA</Text>
              </View>
              <View style={styles.ezaLine} />
            </View>
            <Text style={styles.bodyText}>{ezaContent}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

// Stats comparison row (one stat across Base / Max Lv / Rainbow tiers)
function StatRow({
  icon, label, base, max, rainbow,
}: {
  icon: string;
  label: string;
  base: number | null;
  max: number | null;
  rainbow?: number | null;
}) {
  const fmt = (n: number | null | undefined) =>
    n != null ? n.toLocaleString() : '—';

  return (
    <View style={styles.statsRow}>
      <View style={styles.statsLabelCol}>
        <Text style={styles.statsIcon}>{icon}</Text>
        <Text style={styles.statsLabel}>{label}</Text>
      </View>
      <Text style={styles.statsCell}>{fmt(base)}</Text>
      <Text style={styles.statsCell}>{fmt(max)}</Text>
      {rainbow !== undefined && (
        <Text style={[styles.statsCell, styles.rainbowCell]}>{fmt(rainbow)}</Text>
      )}
    </View>
  );
}

// Single transformation entry
function TransformCard({ t }: { t: Transformation }) {
  const tTypeColor = t.transformedType
    ? (TYPE_COLOR[t.transformedType] ?? COLORS.card)
    : COLORS.card;

  return (
    <View style={styles.transformCard}>
      {t.transformedImageURL ? (
        <Image
          source={{ uri: t.transformedImageURL }}
          style={styles.transformImg}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.transformImg, styles.transformImgPlaceholder]}>
          <Text style={{ fontSize: 28 }}>❓</Text>
        </View>
      )}
      <View style={styles.transformBody}>
        {t.transformedType ? (
          <View style={[styles.transformTypeBadge, { backgroundColor: tTypeColor }]}>
            <Text style={styles.badgeLabel}>{t.transformedType}</Text>
          </View>
        ) : null}
        <Text style={styles.transformName}>{t.transformedName ?? 'Unknown form'}</Text>
        {t.transformedPassive ? (
          <Text style={styles.transformPassive} numberOfLines={4}>
            {t.transformedPassive}
          </Text>
        ) : null}
        {t.transformedSuperAttack ? (
          <Text style={styles.transformSA} numberOfLines={2}>
            ⚡ {t.transformedSuperAttack}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 64 },

  // ── Hero ──────────────────────────────────────────────────────────────

  heroText: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  heroTitle: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroName: {
    color: '#ffffff',
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    lineHeight: 36,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },

  // ── Type accent bar ───────────────────────────────────────────────────

  typeBar: {
    height: 3,
    width: '100%',
    opacity: 0.9,
  },

  // ── Badges row ────────────────────────────────────────────────────────

  badgesRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    flexWrap: 'wrap',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  classBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.text.muted,
  },
  badgeEmoji:      { fontSize: 12 },
  badgeLabel:      { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700' },
  classBadgeLabel: { color: COLORS.text.secondary, fontSize: FONT_SIZES.sm, fontWeight: '600' },

  // ── Info pills ────────────────────────────────────────────────────────

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: SPACING.md,
  },
  infoPill: { alignItems: 'center', flex: 1 },
  infoPillIcon:  { fontSize: 18, marginBottom: 2 },
  infoPillValue: { color: COLORS.text.primary, fontSize: FONT_SIZES.xl, fontWeight: '800' },
  infoPillLabel: { color: COLORS.text.muted,   fontSize: FONT_SIZES.xs, marginTop: 2 },
  pillDivider:   { width: 1, height: 36, backgroundColor: COLORS.surface },

  // ── Section cards ─────────────────────────────────────────────────────

  card: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  cardHeaderIcon:  { fontSize: 16 },
  cardHeaderLabel: {
    color: COLORS.gold,
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardBody: { padding: SPACING.md },

  // ── Body text / sub-notes / EZA ───────────────────────────────────────

  bodyText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
  },
  subNote: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.sm,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
    lineHeight: 18,
  },
  ezaBlock: { marginTop: SPACING.md },
  ezaDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  ezaLine: { flex: 1, height: 1, backgroundColor: COLORS.accent, opacity: 0.5 },
  ezaPill: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ezaPillText: { color: '#fff', fontSize: FONT_SIZES.xs, fontWeight: '800', letterSpacing: 0.5 },

  // ── Stats table ───────────────────────────────────────────────────────

  statsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  statsLabelCol: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statsColHeader: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.text.muted,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  rainbowHeader: { color: COLORS.gold },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  statsIcon:  { fontSize: 14 },
  statsLabel: {
    color: COLORS.text.secondary,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  statsCell: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  rainbowCell: { color: COLORS.gold, fontWeight: '700' },

  // ── Category tags ─────────────────────────────────────────────────────

  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  categoryTag: {
    backgroundColor: 'rgba(245, 166, 35, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.35)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  categoryTagText: {
    color: COLORS.gold,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },

  // ── Link skill tags ───────────────────────────────────────────────────

  linkTag: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 179, 237, 0.5)',   // soft blue
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  linkTagText: {
    color: '#90cdf4',                          // light blue
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },

  // ── Transformation card ───────────────────────────────────────────────

  transformCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  transformImg: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: COLORS.card,
  },
  transformImgPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  transformBody:     { flex: 1 },
  transformTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  transformName:    { color: COLORS.text.primary,   fontSize: FONT_SIZES.md, fontWeight: '700', marginBottom: 4 },
  transformPassive: { color: COLORS.text.secondary, fontSize: FONT_SIZES.xs, lineHeight: 16 },
  transformSA:      { color: COLORS.text.muted,     fontSize: FONT_SIZES.xs, lineHeight: 16, marginTop: 4 },
});
