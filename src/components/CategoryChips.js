import React, { memo, useCallback, useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { categoryIcon } from './categoryIcon';
import { useStyles, useTheme } from '../theme/ThemeProvider';
import { gradients, radii, springs } from '../theme/tokens';
import { haptic } from '../utils/haptics';

const CHIP_HEIGHT = 40;
// Room inside the scroll area for the selected chip's glow, so it isn't cut
// off into a hard-edged band. Pulled back with a negative margin so the
// visible spacing stays the same.
const GLOW_ROOM = 16;

/**
 * Horizontally scrolling category filters. A glowing gradient pill springs
 * from the old chip to the new one, and the row scrolls to keep it in view.
 */
export const CategoryChips = memo(function CategoryChips({ categories, active, onChange }) {
  const { colors } = useTheme();
  const styles = useStyles(makeStyles);
  const scrollRef = useRef(null);
  const layouts = useRef({});
  const x = useSharedValue(0);
  const width = useSharedValue(0);
  const ready = useSharedValue(0);

  const moveIndicator = useCallback(
    (category, animated) => {
      const layout = layouts.current[category];
      if (!layout) {
        return;
      }
      if (animated) {
        x.value = withSpring(layout.x, springs.snappy);
        width.value = withSpring(layout.width, springs.snappy);
      } else {
        x.value = layout.x;
        width.value = layout.width;
        ready.value = withTiming(1, { duration: 200 });
      }
    },
    [ready, width, x],
  );

  useEffect(() => {
    moveIndicator(active, true);
    const layout = layouts.current[active];
    if (layout) {
      scrollRef.current?.scrollTo({ x: Math.max(0, layout.x - 48), animated: true });
    }
  }, [active, moveIndicator]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: ready.value,
    width: width.value,
    transform: [{ translateX: x.value }],
  }));

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroller}
      contentContainerStyle={styles.row}>
      <Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]} />
      {categories.map(category => {
        const Icon = categoryIcon(category);
        const selected = category === active;
        return (
          <Pressable
            key={category}
            onLayout={event => {
              layouts.current[category] = event.nativeEvent.layout;
              if (category === active) {
                moveIndicator(category, false);
              }
            }}
            onPress={() => {
              if (!selected) {
                haptic('selection');
                onChange(category);
              }
            }}
            style={[styles.chip, selected && styles.chipSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${category} channels`}>
            <Icon size={15} color={selected ? '#fff' : colors.textMuted} strokeWidth={2.3} />
            <Text style={[styles.text, selected && styles.textSelected]}>{category}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

const makeStyles = ({ colors, isDark }) =>
  StyleSheet.create({
    scroller: { marginVertical: -GLOW_ROOM + 4 },
    row: {
      paddingHorizontal: 20,
      paddingVertical: GLOW_ROOM,
      gap: 8,
    },
    indicator: {
      position: 'absolute',
      left: 0,
      top: GLOW_ROOM,
      height: CHIP_HEIGHT,
      borderRadius: radii.pill,
      experimental_backgroundImage: gradients.accent,
      boxShadow: isDark ? '0 6px 14px rgba(139,92,246,0.5)' : '0 6px 14px rgba(139,92,246,0.32)',
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      height: CHIP_HEIGHT,
      paddingHorizontal: 16,
      borderRadius: radii.pill,
      backgroundColor: colors.glass,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.glassBorderStrong,
    },
    chipSelected: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
    text: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
    textSelected: { color: '#fff' },
  });
