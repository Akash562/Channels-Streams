import React, { memo, useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, gradients } from '../theme/tokens';

/**
 * Slowly drifting colored light behind the whole home screen.
 * Each blob is a soft radial gradient moved on the UI thread, with a gentle
 * parallax against the list scroll. Motion stops when Reduce Motion is on or
 * while the player is open.
 */
const BLOBS = [
  { rgb: '139,92,246', alpha: 0.5, size: 1.15, x: -0.32, y: -0.22, dx: 0.2, dy: 0.1, duration: 15000 },
  { rgb: '236,72,153', alpha: 0.34, size: 0.95, x: 0.42, y: 0.02, dx: -0.18, dy: 0.12, duration: 18000 },
  { rgb: '34,211,238', alpha: 0.22, size: 1.0, x: -0.12, y: 0.6, dx: 0.16, dy: -0.14, duration: 21000 },
];

const Blob = memo(function Blob({ blob, width, height, animate, scrollY }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!animate) {
      cancelAnimation(progress);
      return undefined;
    }
    progress.value = withRepeat(
      withTiming(1, { duration: blob.duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(progress);
  }, [animate, blob.duration, progress]);

  const size = width * blob.size;

  const animatedStyle = useAnimatedStyle(() => {
    const parallax = scrollY ? Math.min(Math.max(scrollY.value, 0), 800) * 0.2 : 0;
    return {
      transform: [
        { translateX: blob.x * width + progress.value * blob.dx * width },
        { translateY: blob.y * height + progress.value * blob.dy * height - parallax },
        { scale: 1 + progress.value * 0.1 },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.blob,
        {
          left: (width - size) / 2,
          width: size,
          height: size,
          experimental_backgroundImage: [
            {
              type: 'radial-gradient',
              shape: 'circle',
              size: 'closest-side',
              position: { top: '50%', left: '50%' },
              colorStops: [
                { color: `rgba(${blob.rgb},${blob.alpha})`, positions: ['0%'] },
                { color: `rgba(${blob.rgb},${blob.alpha * 0.35})`, positions: ['45%'] },
                { color: `rgba(${blob.rgb},0)`, positions: ['100%'] },
              ],
            },
          ],
        },
        animatedStyle,
      ]}
    />
  );
});

export const AuroraBackground = memo(function AuroraBackground({ scrollY, paused = false }) {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const animate = !paused && !reduceMotion;

  return (
    <View pointerEvents="none" style={styles.root}>
      {BLOBS.map(blob => (
        <Blob
          key={blob.rgb}
          blob={blob}
          width={width}
          height={height}
          animate={animate}
          scrollY={scrollY}
        />
      ))}
      <View style={styles.fade} />
    </View>
  );
});

const styles = StyleSheet.create({
  blob: { position: 'absolute', top: 0 },
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  fade: {
    ...StyleSheet.absoluteFillObject,
    top: '35%',
    experimental_backgroundImage: gradients.screenFade,
  },
});
