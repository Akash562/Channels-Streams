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
import { Heart } from './icons';
import { colors, springs } from '../theme/tokens';
import { haptic } from '../utils/haptics';

/** Favorite toggle: squash-and-bounce on tap, plus a burst ring when favoriting. */
export const HeartButton = memo(function HeartButton({
  active,
  onPress,
  size = 18,
  color = colors.textMuted,
  style,
}) {
  const scale = useSharedValue(1);
  const burst = useSharedValue(1);

  const handlePress = useCallback(() => {
    scale.value = withSequence(withTiming(0.68, { duration: 90 }), withSpring(1, springs.bouncy));
    if (!active) {
      burst.value = 0;
      burst.value = withTiming(1, { duration: 560 });
    }
    haptic(active ? 'selection' : 'impactLight');
    onPress();
  }, [active, burst, onPress, scale]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: interpolate(burst.value, [0, 0.15, 1], [0, 0.9, 0]),
    transform: [{ scale: interpolate(burst.value, [0, 1], [0.5, 1.9]) }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Remove from favorites' : 'Add to favorites'}
      accessibilityState={{ selected: active }}
      style={[styles.button, style]}>
      <Animated.View pointerEvents="none" style={[styles.ring, ringStyle]} />
      <Animated.View style={iconStyle}>
        <Heart
          size={size}
          color={active ? colors.heart : color}
          fill={active ? colors.heart : 'transparent'}
          strokeWidth={2.2}
        />
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.heart,
  },
});
