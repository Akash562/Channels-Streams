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
import { colors, radii } from '../theme/tokens';

/** Frosted search pill that glows violet while focused. */
export const SearchBar = memo(function SearchBar({ value, onChangeText }) {
  const focus = useSharedValue(0);

  const onFocus = useCallback(() => {
    focus.value = withTiming(1, { duration: 220 });
  }, [focus]);
  const onBlur = useCallback(() => {
    focus.value = withTiming(0, { duration: 260 });
  }, [focus]);

  const frameStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focus.value,
      [0, 1],
      ['rgba(255,255,255,0.10)', 'rgba(167,139,250,0.9)'],
    ),
    backgroundColor: interpolateColor(
      focus.value,
      [0, 1],
      ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.10)'],
    ),
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
        selectionColor={colors.violetSoft}
        cursorColor={colors.violetSoft}
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

const styles = StyleSheet.create({
  frame: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.lg,
    boxShadow: '0 0 28px rgba(139,92,246,0.45)',
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
