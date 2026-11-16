import React, { memo, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';

/**
 * Red "LIVE" pill with a softly pulsing dot.
 * tone="onDark" keeps the dark-surface look in both themes (used over video
 * and on the colored carousel cards).
 */
export const LiveBadge = memo(function LiveBadge({
  label = 'LIVE',
  compact = false,
  tone = 'auto',
  style,
}) {
  const { isDark } = useTheme();
  const variant = tone === 'onDark' || isDark ? dark : light;
  const pulse = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      return undefined;
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: 1300, easing: Easing.out(Easing.quad) }),
      -1,
      false,
    );
    return () => cancelAnimation(pulse);
  }, [pulse, reduceMotion]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.7, 0]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 2.6]) }],
  }));

  return (
    <View style={[styles.badge, variant.badge, compact && styles.compact, style]}>
      <View style={styles.dotWrap}>
        <Animated.View style={[styles.ring, variant.dot, ringStyle]} />
        <View style={[styles.dot, variant.dot]} />
      </View>
      <Text style={[styles.text, variant.text, compact && styles.textCompact]}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  compact: { paddingHorizontal: 7, paddingVertical: 3, gap: 5 },
  dotWrap: { width: 7, height: 7, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 7, height: 7, borderRadius: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  text: { fontSize: 11, fontWeight: '800', letterSpacing: 1.4 },
  textCompact: { fontSize: 10, letterSpacing: 1.2 },
});

const dark = StyleSheet.create({
  badge: { backgroundColor: 'rgba(255,59,92,0.16)', borderColor: 'rgba(255,59,92,0.55)' },
  dot: { backgroundColor: '#FF3B5C' },
  text: { color: '#FFD3DB' },
});

const light = StyleSheet.create({
  badge: { backgroundColor: 'rgba(225,29,72,0.09)', borderColor: 'rgba(225,29,72,0.35)' },
  dot: { backgroundColor: '#E11D48' },
  text: { color: '#BE123C' },
});
