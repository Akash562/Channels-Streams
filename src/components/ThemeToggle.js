import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Moon, Sun } from './icons';
import { useStyles, useTheme } from '../theme/ThemeProvider';
import { springs } from '../theme/tokens';
import { haptic } from '../utils/haptics';

/**
 * Round glass button that switches between light and dark.
 * Shows a moon in light mode and a sun in dark mode; the icons spin and
 * cross over as the theme animates.
 */
export const ThemeToggle = memo(function ThemeToggle({ style }) {
  const { isDark, progress, toggleMode, colors } = useTheme();
  const styles = useStyles(makeStyles);
  const press = useSharedValue(1);

  const onPress = useCallback(() => {
    press.value = withSequence(withTiming(0.82, { duration: 90 }), withSpring(1, springs.bouncy));
    haptic('impactLight');
    toggleMode();
  }, [press, toggleMode]);

  const buttonStyle = useAnimatedStyle(() => ({ transform: [{ scale: press.value }] }));
  const moonStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { rotate: `${interpolate(progress.value, [0, 1], [0, 90])}deg` },
      { scale: interpolate(progress.value, [0, 1], [1, 0.4]) },
    ],
  }));
  const sunStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { rotate: `${interpolate(progress.value, [0, 1], [-90, 0])}deg` },
      { scale: interpolate(progress.value, [0, 1], [0.4, 1]) },
    ],
  }));

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={style}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>
      <Animated.View style={[styles.button, buttonStyle]}>
        <Animated.View style={[styles.icon, moonStyle]}>
          <Moon size={19} color={colors.text} strokeWidth={2.3} />
        </Animated.View>
        <Animated.View style={[styles.icon, sunStyle]}>
          <Sun size={20} color={colors.text} strokeWidth={2.3} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
});

const makeStyles = ({ colors, isDark }) =>
  StyleSheet.create({
    button: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.glassStrong,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.glassBorderStrong,
      ...(isDark ? null : { boxShadow: colors.cardShadow }),
    },
    icon: { position: 'absolute' },
  });
