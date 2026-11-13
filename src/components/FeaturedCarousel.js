import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Play } from './icons';
import { ChannelLogo } from './ChannelLogo';
import { LiveBadge } from './LiveBadge';
import { accentFor, colors, radii, withAlpha } from '../theme/tokens';

const GAP = 14;

/**
 * 3D coverflow: the centered card faces forward while its neighbours rotate
 * away on the Y axis, shrink and dim. Swipe or tap; cards snap to center.
 */
export const FeaturedCarousel = memo(function FeaturedCarousel({ data, onSelect }) {
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = Math.min(screenWidth * 0.74, 340);
  const snap = itemWidth + GAP;
  const sidePadding = (screenWidth - itemWidth) / 2 - GAP / 2;
  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler(event => {
    scrollX.value = event.contentOffset.x;
  });

  if (!data.length) {
    return null;
  }

  return (
    <View>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snap}
        decelerationRate="fast"
        disableIntervalMomentum
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.track, { paddingHorizontal: sidePadding }]}>
        {data.map((item, index) => (
          <CoverCard
            key={item.key}
            item={item}
            index={index}
            width={itemWidth}
            snap={snap}
            scrollX={scrollX}
            onSelect={onSelect}
          />
        ))}
      </Animated.ScrollView>
      {data.length > 1 && <Pagination count={data.length} snap={snap} scrollX={scrollX} />}
    </View>
  );
});

const CoverCard = memo(function CoverCard({ item, index, width, snap, scrollX, onSelect }) {
  const [from, to] = accentFor(item.group);
  const height = Math.round(width * 0.6);

  const animatedStyle = useAnimatedStyle(() => {
    const input = [(index - 1) * snap, index * snap, (index + 1) * snap];
    return {
      opacity: interpolate(scrollX.value, input, [0.5, 1, 0.5], Extrapolation.CLAMP),
      transform: [
        { perspective: 900 },
        { translateY: interpolate(scrollX.value, input, [16, 0, 16], Extrapolation.CLAMP) },
        { rotateY: `${interpolate(scrollX.value, input, [42, 0, -42], Extrapolation.CLAMP)}deg` },
        { scale: interpolate(scrollX.value, input, [0.84, 1, 0.84], Extrapolation.CLAMP) },
      ],
    };
  });

  return (
    <Animated.View style={[{ width: snap, paddingHorizontal: GAP / 2 }, animatedStyle]}>
      <Pressable
        onPress={() => onSelect(item)}
        accessibilityRole="button"
        accessibilityLabel={`Play ${item.title}`}
        style={[
          styles.card,
          {
            height,
            experimental_backgroundImage: `linear-gradient(140deg, ${withAlpha(from, 0.95)} 0%, ${withAlpha(to, 0.85)} 100%)`,
            boxShadow: `0 18px 40px ${withAlpha(to, 0.35)}`,
          },
        ]}>
        <View style={styles.sheen} />
        <View style={styles.topRow}>
          <LiveBadge />
          <Text style={styles.group}>{item.group}</Text>
        </View>
        <View style={styles.body}>
          <View style={styles.plate}>
            <ChannelLogo
              key={item.logo}
              uri={item.logo}
              title={item.title}
              group={item.group}
              style={styles.logo}
              textSize={18}
            />
          </View>
          <View style={styles.info}>
            <Text numberOfLines={2} style={styles.title}>
              {item.title}
            </Text>
            <View style={styles.watch}>
              <Play size={13} color={colors.bg} fill={colors.bg} />
              <Text style={styles.watchText}>Watch now</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const Pagination = memo(function Pagination({ count, snap, scrollX }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: Math.min(count, 10) }, (_, index) => (
        <Dot key={index} index={index} snap={snap} scrollX={scrollX} />
      ))}
    </View>
  );
});

const Dot = memo(function Dot({ index, snap, scrollX }) {
  const style = useAnimatedStyle(() => {
    const input = [(index - 1) * snap, index * snap, (index + 1) * snap];
    return {
      width: interpolate(scrollX.value, input, [6, 22, 6], Extrapolation.CLAMP),
      opacity: interpolate(scrollX.value, input, [0.35, 1, 0.35], Extrapolation.CLAMP),
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
});

const styles = StyleSheet.create({
  track: { paddingVertical: 10 },
  card: {
    borderRadius: radii.xl,
    padding: 16,
    overflow: 'hidden',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  sheen: {
    ...StyleSheet.absoluteFillObject,
    experimental_backgroundImage:
      'linear-gradient(160deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.28) 100%)',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  group: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  body: { flexDirection: 'row', alignItems: 'flex-end', gap: 14 },
  plate: {
    width: 92,
    height: 92,
    borderRadius: radii.lg,
    backgroundColor: colors.plate,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
  },
  logo: { width: 74, height: 60 },
  info: { flex: 1, gap: 10 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  watch: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: '#fff',
  },
  watchText: { color: colors.bg, fontSize: 13, fontWeight: '800' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 6 },
  dot: { height: 6, borderRadius: 3, backgroundColor: '#fff' },
});
