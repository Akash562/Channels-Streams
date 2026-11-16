import React, { memo, useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { auroraPalettes, palettes, screenFade } from '../theme/tokens';

/**
 * Slowly drifting colored light behind the whole home screen, with a gentle
 * parallax against the list scroll. Light and dark versions are stacked and
 * crossfade when the theme changes. Motion stops when Reduce Motion is on or
 * while the player is open.
 */
const PATHS = [
  { size: 1.15, x: -0.32, y: -0.22, dx: 0.2, dy: 0.1, duration: 15000 },
  { size: 0.95, x: 0.42, y: 0.02, dx: -0.18, dy: 0.12, duration: 18000 },
  { size: 1.0, x: -0.12, y: 0.6, dx: 0.16, dy: -0.14, duration: 21000 },
];

function radial({ rgb, alpha }) {
  return [
    {
      type: 'radial-gradient',
      shape: 'circle',
      size: 'closest-side',
      position: { top: '50%', left: '50%' },
      colorStops: [
        { color: `rgba(${rgb},${alpha})`, positions: ['0%'] },
        { color: `rgba(${rgb},${alpha * 0.35})`, positions: ['45%'] },
        { color: `rgba(${rgb},0)`, positions: ['100%'] },
      ],
    },
  ];
}

const Blob = memo(function Blob({ path, color, width, height, animate, scrollY }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    if (!animate) {
      cancelAnimation(drift);
      return undefined;
    }
    drift.value = withRepeat(
      withTiming(1, { duration: path.duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(drift);
  }, [animate, drift, path.duration]);

  const size = width * path.size;

  const animatedStyle = useAnimatedStyle(() => {
    const parallax = scrollY ? Math.min(Math.max(scrollY.value, 0), 800) * 0.2 : 0;
    return {
      transform: [
        { translateX: path.x * width + drift.value * path.dx * width },
        { translateY: path.y * height + drift.value * path.dy * height - parallax },
        { scale: 1 + drift.value * 0.1 },
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
          experimental_backgroundImage: radial(color),
        },
        animatedStyle,
      ]}
    />
  );
});

/** One full aurora (three blobs plus the bottom fade) for a single theme. */
const AuroraLayer = memo(function AuroraLayer({ layerMode, progress, animate, scrollY }) {
  const { width, height } = useWindowDimensions();
  const isDarkLayer = layerMode === 'dark';

  const layerStyle = useAnimatedStyle(() => ({
    opacity: isDarkLayer ? progress.value : 1 - progress.value,
  }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, layerStyle]}>
      {PATHS.map((path, index) => (
        <Blob
          key={index}
          path={path}
          color={auroraPalettes[layerMode][index]}
          width={width}
          height={height}
          animate={animate}
          scrollY={scrollY}
        />
      ))}
      <View
        style={[styles.fade, { experimental_backgroundImage: screenFade(palettes[layerMode].bg) }]}
      />
    </Animated.View>
  );
});

export const AuroraBackground = memo(function AuroraBackground({ scrollY, paused = false }) {
  const { mode, progress } = useTheme();
  const reduceMotion = useReducedMotion();
  const animate = !paused && !reduceMotion;

  const rootStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [palettes.light.bg, palettes.dark.bg],
    ),
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.root, rootStyle]}>
      {['light', 'dark'].map(layerMode => (
        <AuroraLayer
          key={layerMode}
          layerMode={layerMode}
          progress={progress}
          // Only the visible theme's light keeps drifting.
          animate={animate && layerMode === mode}
          scrollY={scrollY}
        />
      ))}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob: { position: 'absolute', top: 0 },
  fade: {
    ...StyleSheet.absoluteFillObject,
    top: '35%',
  },
});
