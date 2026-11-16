import React, { memo, useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { ChannelLogo } from './ChannelLogo';
import { HeartButton } from './HeartButton';
import { useStyles } from '../theme/ThemeProvider';
import { accentFor, radii, springs, withAlpha } from '../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const MAX_TILT = 14; // degrees

/**
 * Glass channel card. On press it tilts in 3D toward the finger, scales down
 * slightly and lights up a glow in the channel's category colors. Cards fade
 * up in a short stagger when they first appear.
 */
export const ChannelCard = memo(function ChannelCard({
  item,
  index,
  isFavorite,
  onPress,
  onToggleFavorite,
  animateEntry,
}) {
  const styles = useStyles(makeStyles);
  const size = useRef({ width: 1, height: 1 });
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const pressed = useSharedValue(0);
  const [from, to] = accentFor(item.group);

  const handlePressIn = useCallback(
    event => {
      const { locationX, locationY } = event.nativeEvent;
      const { width, height } = size.current;
      tiltY.value = withSpring((locationX / width - 0.5) * MAX_TILT, springs.snappy);
      tiltX.value = withSpring(-(locationY / height - 0.5) * MAX_TILT, springs.snappy);
      pressed.value = withSpring(1, springs.snappy);
    },
    [pressed, tiltX, tiltY],
  );

  const handlePressOut = useCallback(() => {
    tiltX.value = withSpring(0, springs.soft);
    tiltY.value = withSpring(0, springs.soft);
    pressed.value = withSpring(0, springs.soft);
  }, [pressed, tiltX, tiltY]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 700 },
      { rotateX: `${tiltX.value}deg` },
      { rotateY: `${tiltY.value}deg` },
      { scale: 1 - pressed.value * 0.045 },
    ],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: pressed.value }));

  return (
    <Animated.View
      style={styles.cell}
      entering={
        animateEntry
          ? FadeInDown.delay(Math.min(index, 9) * 55)
              .springify()
              .damping(18)
          : undefined
      }>
      <AnimatedPressable
        onLayout={event => {
          size.current = event.nativeEvent.layout;
        }}
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, cardStyle]}
        accessibilityRole="button"
        accessibilityLabel={`Play ${item.title}`}
        accessibilityHint={`${item.group} channel`}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glow,
            { boxShadow: `0 0 0 1.5px ${withAlpha(from, 0.9)}, 0 14px 30px ${withAlpha(to, 0.4)}` },
            glowStyle,
          ]}
        />
        <View style={styles.plate}>
          <ChannelLogo
            key={item.logo}
            uri={item.logo}
            title={item.title}
            group={item.group}
            style={styles.logo}
          />
        </View>
        <View style={styles.meta}>
          <View style={styles.metaText}>
            <Text numberOfLines={1} style={styles.title}>
              {item.title}
            </Text>
            <View style={styles.groupRow}>
              <View style={[styles.dot, { backgroundColor: from }]} />
              <Text numberOfLines={1} style={styles.group}>
                {item.group}
              </Text>
            </View>
          </View>
          <HeartButton active={isFavorite} onPress={() => onToggleFavorite(item)} />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
});

const makeStyles = ({ colors, isDark }) =>
  StyleSheet.create({
    cell: { flex: 1, padding: 6 },
    card: {
      borderRadius: radii.lg,
      padding: 8,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.cardBorder,
      ...(isDark ? null : { boxShadow: colors.cardShadow }),
    },
    glow: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: radii.lg,
    },
    plate: {
      height: 96,
      borderRadius: radii.md,
      backgroundColor: colors.plate,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.plateBorder,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    logo: { width: '78%', height: 64 },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 10,
      paddingLeft: 4,
    },
    metaText: { flex: 1, gap: 3 },
    title: { color: colors.text, fontSize: 14, fontWeight: '700', letterSpacing: -0.1 },
    groupRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3 },
    group: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  });
