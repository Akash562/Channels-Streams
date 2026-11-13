import React, { memo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { accentFor } from '../theme/tokens';

function initials(title = '') {
  return (
    title
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase() || 'TV'
  );
}

/**
 * Channel logo that fades in once loaded. If the logo URL is missing or
 * fails, shows the channel's initials on its category gradient instead.
 */
export const ChannelLogo = memo(function ChannelLogo({ uri, title, group, style, textSize = 22 }) {
  const [failed, setFailed] = useState(!uri);
  const opacity = useSharedValue(0);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (failed) {
    const [from, to] = accentFor(group);
    return (
      <View
        style={[
          styles.fallback,
          { experimental_backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` },
          style,
        ]}>
        <Text style={[styles.initials, { fontSize: textSize }]}>{initials(title)}</Text>
      </View>
    );
  }

  return (
    <Animated.Image
      source={{ uri }}
      style={[style, fadeStyle]}
      resizeMode="contain"
      onLoad={() => {
        opacity.value = withTiming(1, { duration: 280 });
      }}
      onError={() => setFailed(true)}
      accessibilityIgnoresInvertColors
    />
  );
});

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  initials: { color: '#fff', fontWeight: '900', letterSpacing: 1 },
});
