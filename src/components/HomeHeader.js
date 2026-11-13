import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  FadeIn,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { SearchX } from './icons';
import { LiveBadge } from './LiveBadge';
import { colors, space, type } from '../theme/tokens';

/** Large title that drifts up and fades out as the list scrolls. */
export const HeroHeader = memo(function HeroHeader({ scrollY, channelCount }) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 90], [1, 0], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [-120, 0, 120], [30, 0, -24], Extrapolation.CLAMP) },
      { scale: interpolate(scrollY.value, [-120, 0], [1.08, 1], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <Animated.View style={[styles.hero, style]}>
      <View style={styles.eyebrowRow}>
        <LiveBadge label="ON AIR" />
        <Text style={styles.count}>
          {channelCount} {channelCount === 1 ? 'channel' : 'channels'}
        </Text>
      </View>
      <Text style={styles.display} accessibilityRole="header">
        Live TV
      </Text>
      <Text style={styles.subtitle}>Music, news, movies and more, streaming now.</Text>
    </Animated.View>
  );
});

/** Slim frosted bar that slides in once the large title has scrolled away. */
export const CompactHeader = memo(function CompactHeader({ scrollY, topInset, channelCount }) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [70, 120], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [70, 120], [-10, 0], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.compact, { paddingTop: topInset }, style]}>
      <View style={styles.compactRow}>
        <Text style={styles.compactTitle}>Live TV</Text>
        <LiveBadge compact label={`${channelCount}`} />
      </View>
    </Animated.View>
  );
});

export const SectionHeader = memo(function SectionHeader({ icon: Icon, title, meta }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionLeft}>
        {Icon ? <Icon size={18} color={colors.violetSoft} strokeWidth={2.4} /> : null}
        <Text style={styles.sectionTitle} accessibilityRole="header">
          {title}
        </Text>
      </View>
      {meta ? <Text style={styles.sectionMeta}>{meta}</Text> : null}
    </View>
  );
});

export const EmptyState = memo(function EmptyState({ query }) {
  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.empty}>
      <View style={styles.emptyIcon}>
        <SearchX size={28} color={colors.violetSoft} strokeWidth={2} />
      </View>
      <Text style={styles.emptyTitle}>No channels found</Text>
      <Text style={styles.emptyText}>
        {query ? `Nothing matches “${query.trim()}”.` : 'There are no channels in this category yet.'}
      </Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  hero: { paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.xl, gap: 8 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  count: { ...type.caption, letterSpacing: 0.4 },
  display: { ...type.display, marginTop: 4 },
  subtitle: { color: colors.textMuted, fontSize: 15, fontWeight: '500' },
  compact: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.scrim,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glassBorder,
    zIndex: 10,
  },
  compactRow: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
  },
  compactTitle: { ...type.title, fontSize: 18 },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { ...type.title },
  sectionMeta: { ...type.caption },
  empty: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32, gap: 10 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorderStrong,
    marginBottom: 4,
  },
  emptyTitle: { ...type.title, fontSize: 18 },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
});
