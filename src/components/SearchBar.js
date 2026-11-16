import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import Animated, {
  ZoomIn,
  ZoomOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Search, X } from './icons';
import { useStyles, useTheme } from '../theme/ThemeProvider';
import { radii } from '../theme/tokens';

/** Frosted search pill that glows violet while focused. */
export const SearchBar = memo(function SearchBar({ value, onChangeText }) {
  const { colors, isDark } = useTheme();
  const styles = useStyles(makeStyles);
  const focus = useSharedValue(0);

  const onFocus = useCallback(() => {
    focus.value = withTiming(1, { duration: 220 });
  }, [focus]);
  const onBlur = useCallback(() => {
    focus.value = withTiming(0, { duration: 260 });
  }, [focus]);

  const { searchBorder, searchBorderFocus, searchBg, searchBgFocus } = colors;
  const frameStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.value, [0, 1], [searchBorder, searchBorderFocus]),
    backgroundColor: interpolateColor(focus.value, [0, 1], [searchBg, searchBgFocus]),
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: focus.value }));

  return (
    <Animated.View style={[styles.frame, frameStyle]}>
      <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]} />
      <Search size={18} color={colors.textMuted} strokeWidth={2.2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="Search channels or categories"
        placeholderTextColor={colors.textFaint}
        selectionColor={colors.accent}
        cursorColor={colors.accent}
        keyboardAppearance={isDark ? 'dark' : 'light'}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        style={styles.input}
        accessibilityLabel="Search channels"
      />
      {value.length > 0 && (
        <Animated.View entering={ZoomIn.duration(160)} exiting={ZoomOut.duration(120)}>
          <Pressable
            onPress={() => onChangeText('')}
            hitSlop={12}
            style={styles.clear}
            accessibilityRole="button"
            accessibilityLabel="Clear search">
            <X size={14} color={colors.bg} strokeWidth={3} />
          </Pressable>
        </Animated.View>
      )}
    </Animated.View>
  );
});

const makeStyles = ({ colors, isDark }) =>
  StyleSheet.create({
    frame: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      height: 52,
      paddingHorizontal: 16,
      borderRadius: radii.lg,
      borderWidth: 1,
      ...(isDark ? null : { boxShadow: colors.cardShadow }),
    },
    glow: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: radii.lg,
      boxShadow: colors.focusGlow,
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      fontWeight: '500',
      paddingVertical: 0,
    },
    clear: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.textMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
