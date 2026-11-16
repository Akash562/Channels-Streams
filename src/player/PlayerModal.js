import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Video from 'react-native-video';
import LottieView from 'lottie-react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import RNOrientationDirector, { Orientation } from 'react-native-orientation-director';
import {
  ChevronLeft,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Sun,
  Volume2,
  VolumeX,
  WifiOff,
} from '../components/icons';

import { HeartButton } from '../components/HeartButton';
import { LiveBadge } from '../components/LiveBadge';
import { gradients, palettes, radii } from '../theme/tokens';
import { haptic } from '../utils/haptics';

// The player keeps its dark, cinematic look in both themes.
const colors = palettes.dark;

// Brightness is simulated with a black overlay, so it never goes fully dark.
const MAX_DIM = 0.85;
// A swipe across ~60% of the screen height moves a level from 0 to 1.
const SWIPE_RANGE = 0.6;
const CONTROLS_HIDE_DELAY = 3500;

const clamp01 = value => {
  'worklet';
  return Math.min(Math.max(value, 0), 1);
};

/**
 * Fullscreen landscape player. Mounts its content only while a channel is
 * selected, so orientation locks and timers are tied to the player's lifetime.
 */
export function PlayerModal({ channel, playlist, onSelect, onClose, isFavorite, onToggleFavorite }) {
  return (
    <Modal
      visible={!!channel}
      animationType="fade"
      supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
      hardwareAccelerated>
      {channel ? (
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.fill}>
            <PlayerContent
              channel={channel}
              playlist={playlist}
              onSelect={onSelect}
              onClose={onClose}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
            />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      ) : null}
    </Modal>
  );
}

function PlayerContent({ channel, playlist, onSelect, onClose, isFavorite, onToggleFavorite }) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Gesture state lives on the UI thread so the meters move at full frame rate.
  const brightness = useSharedValue(1);
  const volumeLevel = useSharedValue(1);
  const lastSentVolume = useSharedValue(1);
  const side = useSharedValue(1); // 0 = brightness (left), 1 = volume (right)
  const lastY = useSharedValue(0);
  const hudOpacity = useSharedValue(0);
  const controlsOpacity = useSharedValue(1);

  const hasPlayableUrl = !!channel.url?.startsWith('http');
  const showError = error || !hasPlayableUrl;
  const index = playlist.findIndex(item => item.key === channel.key);
  const canSwitch = playlist.length > 1 && index !== -1;

  // Landscape while the player is open, portrait again when it closes.
  useEffect(() => {
    RNOrientationDirector.lockTo(Orientation.landscape);
    return () => RNOrientationDirector.lockTo(Orientation.portrait);
  }, []);

  // A new channel starts fresh.
  useEffect(() => {
    setLoading(true);
    setError(false);
    setPaused(false);
    setControlsVisible(true);
  }, [channel.key]);

  useEffect(() => {
    controlsOpacity.value = withTiming(controlsVisible ? 1 : 0, { duration: 220 });
  }, [controlsOpacity, controlsVisible]);

  // Hide the controls a few seconds after playback settles.
  useEffect(() => {
    if (!controlsVisible || paused || loading || showError) {
      return undefined;
    }
    const timer = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_DELAY);
    return () => clearTimeout(timer);
  }, [controlsVisible, paused, loading, showError, channel.key]);

  const toggleControls = useCallback(() => setControlsVisible(visible => !visible), []);

  const applyVolume = useCallback(value => {
    setVolume(value);
    if (value > 0) {
      setMuted(false);
    }
  }, []);

  const gesture = useMemo(() => {
    const pan = Gesture.Pan()
      .activeOffsetY([-12, 12])
      .failOffsetX([-24, 24])
      .onBegin(event => {
        side.value = event.x < width / 2 ? 0 : 1;
        lastY.value = 0;
      })
      .onStart(() => {
        hudOpacity.value = withTiming(1, { duration: 120 });
      })
      .onUpdate(event => {
        const delta = -(event.translationY - lastY.value) / (height * SWIPE_RANGE);
        lastY.value = event.translationY;
        if (side.value === 0) {
          brightness.value = clamp01(brightness.value + delta);
        } else {
          volumeLevel.value = clamp01(volumeLevel.value + delta);
          if (Math.abs(volumeLevel.value - lastSentVolume.value) >= 0.02) {
            lastSentVolume.value = volumeLevel.value;
            scheduleOnRN(applyVolume, volumeLevel.value);
          }
        }
      })
      .onFinalize(() => {
        hudOpacity.value = withDelay(600, withTiming(0, { duration: 260 }));
        if (side.value === 1) {
          lastSentVolume.value = volumeLevel.value;
          scheduleOnRN(applyVolume, volumeLevel.value);
        }
      });

    const tap = Gesture.Tap()
      .maxDuration(260)
      .onEnd((_event, success) => {
        if (success) {
          scheduleOnRN(toggleControls);
        }
      });

    return Gesture.Race(pan, tap);
  }, [
    applyVolume,
    brightness,
    height,
    hudOpacity,
    lastSentVolume,
    lastY,
    side,
    toggleControls,
    volumeLevel,
    width,
  ]);

  const dimStyle = useAnimatedStyle(() => ({ opacity: (1 - brightness.value) * MAX_DIM }));
  const controlsStyle = useAnimatedStyle(() => ({ opacity: controlsOpacity.value }));
  const brightnessHudStyle = useAnimatedStyle(() => ({
    opacity: side.value === 0 ? hudOpacity.value : 0,
  }));
  const volumeHudStyle = useAnimatedStyle(() => ({
    opacity: side.value === 1 ? hudOpacity.value : 0,
  }));
  const brightnessFill = useAnimatedStyle(() => ({ height: `${brightness.value * 100}%` }));
  const volumeFill = useAnimatedStyle(() => ({ height: `${volumeLevel.value * 100}%` }));

  const step = useCallback(
    direction => {
      if (!canSwitch) {
        return;
      }
      haptic('selection');
      onSelect(playlist[(index + direction + playlist.length) % playlist.length]);
    },
    [canSwitch, index, onSelect, playlist],
  );

  const retry = useCallback(() => {
    setError(false);
    setLoading(true);
    setRetryKey(key => key + 1); // remounts the Video so it reconnects
  }, []);

  const toggleMute = useCallback(() => {
    haptic('selection');
    setMuted(value => !value);
  }, []);

  const lastTap = useRef(0);
  const togglePause = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 250) {
      return; // ignore accidental double taps
    }
    lastTap.current = now;
    haptic('impactLight');
    setPaused(value => !value);
  }, []);

  const padH = Math.max(insets.left, insets.right, 20);

  return (
    <View style={styles.root}>
      <StatusBar hidden />

      <GestureDetector gesture={gesture}>
        <View style={styles.fill} collapsable={false}>
          {hasPlayableUrl && !error && (
            <Video
              key={`${channel.key}-${retryKey}`}
              source={{ uri: channel.url }}
              style={StyleSheet.absoluteFill}
              resizeMode="contain"
              repeat
              controls={false}
              paused={paused}
              muted={muted}
              volume={volume}
              ignoreSilentSwitch="ignore"
              onLoadStart={() => setLoading(true)}
              onLoad={() => setLoading(false)}
              onBuffer={({ isBuffering }) => setLoading(isBuffering)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
            />
          )}
          <Animated.View pointerEvents="none" style={[styles.dim, dimStyle]} />
        </View>
      </GestureDetector>

      {loading && !showError && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          pointerEvents="none"
          style={styles.center}>
          <LottieView source={require('../assets/loading.json')} autoPlay loop style={styles.loader} />
          <Text style={styles.tuning}>Tuning in to {channel.title}…</Text>
        </Animated.View>
      )}

      {/* Brightness meter (left) and volume meter (right) shown while swiping. */}
      <Animated.View pointerEvents="none" style={[styles.hud, { left: padH + 8 }, brightnessHudStyle]}>
        <Sun size={18} color="#fff" strokeWidth={2.4} />
        <View style={styles.hudTrack}>
          <Animated.View style={[styles.hudFill, brightnessFill]} />
        </View>
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.hud, { right: padH + 8 }, volumeHudStyle]}>
        <Volume2 size={18} color="#fff" strokeWidth={2.4} />
        <View style={styles.hudTrack}>
          <Animated.View style={[styles.hudFill, volumeFill]} />
        </View>
      </Animated.View>

      {/* Controls overlay. Empty areas pass touches through to the gesture layer. */}
      <Animated.View
        pointerEvents={controlsVisible ? 'box-none' : 'none'}
        style={[StyleSheet.absoluteFill, controlsStyle]}>
        <View pointerEvents="box-none" style={[styles.topBar, { paddingHorizontal: padH }]}>
          <IconButton label="Close player" onPress={onClose}>
            <ChevronLeft size={24} color="#fff" strokeWidth={2.4} />
          </IconButton>
          <View style={styles.titleBlock}>
            <View style={styles.titleRow}>
              <Text numberOfLines={1} style={styles.title}>
                {channel.title}
              </Text>
              <LiveBadge compact tone="onDark" />
            </View>
            <Text style={styles.subtitle}>
              {channel.group}
              {canSwitch ? `  ·  ${index + 1} of ${playlist.length}` : ''}
            </Text>
          </View>
          <View style={styles.glassCircle}>
            <HeartButton
              active={isFavorite}
              onPress={() => onToggleFavorite(channel)}
              size={20}
              color="#fff"
            />
          </View>
          <IconButton label={muted ? 'Unmute' : 'Mute'} onPress={toggleMute}>
            {muted || volume === 0 ? (
              <VolumeX size={20} color="#fff" strokeWidth={2.4} />
            ) : (
              <Volume2 size={20} color="#fff" strokeWidth={2.4} />
            )}
          </IconButton>
        </View>

        {!showError && (
          <View pointerEvents="box-none" style={styles.centerControls}>
            {canSwitch && (
              <IconButton label="Previous channel" onPress={() => step(-1)} size={54}>
                <SkipBack size={22} color="#fff" fill="#fff" />
              </IconButton>
            )}
            <IconButton label={paused ? 'Play' : 'Pause'} onPress={togglePause} size={76} accent>
              {paused ? (
                <Play size={30} color="#fff" fill="#fff" style={styles.playNudge} />
              ) : (
                <Pause size={30} color="#fff" fill="#fff" />
              )}
            </IconButton>
            {canSwitch && (
              <IconButton label="Next channel" onPress={() => step(1)} size={54}>
                <SkipForward size={22} color="#fff" fill="#fff" />
              </IconButton>
            )}
          </View>
        )}

        <View pointerEvents="none" style={[styles.bottomBar, { paddingHorizontal: padH }]}>
          <Text style={styles.hint}>Swipe up or down: left side for brightness, right side for volume</Text>
        </View>
      </Animated.View>

      {showError && (
        <Animated.View entering={ZoomIn.springify().damping(16)} style={styles.center}>
          <View style={styles.errorCard}>
            <View style={styles.errorIcon}>
              <WifiOff size={26} color={colors.live} strokeWidth={2.2} />
            </View>
            <Text style={styles.errorTitle}>This channel can't be played right now</Text>
            <Text style={styles.errorText}>
              {hasPlayableUrl
                ? 'The stream may be offline or your connection dropped.'
                : 'This channel has no valid stream address.'}
            </Text>
            <View style={styles.errorActions}>
              {hasPlayableUrl && (
                <Pressable onPress={retry} style={[styles.pill, styles.pillAccent]} accessibilityRole="button">
                  <RotateCcw size={16} color="#fff" strokeWidth={2.6} />
                  <Text style={styles.pillText}>Try again</Text>
                </Pressable>
              )}
              {canSwitch && (
                <Pressable onPress={() => step(1)} style={styles.pill} accessibilityRole="button">
                  <SkipForward size={16} color="#fff" fill="#fff" />
                  <Text style={styles.pillText}>Next channel</Text>
                </Pressable>
              )}
              <Pressable onPress={onClose} style={styles.pill} accessibilityRole="button">
                <Text style={styles.pillText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

function IconButton({ children, onPress, label, size = 44, accent = false }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.88, { duration: 90 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 160 });
      }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Animated.View
        style={[
          styles.glassCircle,
          { width: size, height: size, borderRadius: size / 2 },
          accent && styles.accentCircle,
          style,
        ]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  root: { flex: 1, backgroundColor: '#000' },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: { width: 110, height: 110 },
  tuning: { color: colors.textMuted, fontSize: 14, fontWeight: '600', marginTop: 4 },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 18,
    paddingBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    experimental_backgroundImage: gradients.topScrim,
  },
  titleBlock: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.3, flexShrink: 1 },
  subtitle: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  centerControls: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 36,
    paddingBottom: 16,
    alignItems: 'center',
    experimental_backgroundImage: gradients.bottomScrim,
  },
  hint: { color: colors.textFaint, fontSize: 12, fontWeight: '600' },
  glassCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  accentCircle: {
    experimental_backgroundImage: gradients.accent,
    borderColor: 'rgba(255,255,255,0.4)',
    boxShadow: '0 10px 30px rgba(139,92,246,0.55)',
  },
  playNudge: { marginLeft: 4 },
  hud: {
    position: 'absolute',
    top: '50%',
    marginTop: -88,
    width: 52,
    height: 176,
    borderRadius: 26,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(15,12,30,0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  hudTrack: {
    flex: 1,
    width: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  hudFill: {
    width: '100%',
    borderRadius: 4,
    experimental_backgroundImage: 'linear-gradient(0deg, #8B5CF6 0%, #EC4899 100%)',
  },
  errorCard: {
    width: 420,
    maxWidth: '86%',
    alignItems: 'center',
    gap: 10,
    padding: 24,
    borderRadius: radii.xl,
    backgroundColor: 'rgba(20,17,38,0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glassBorderStrong,
  },
  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,59,92,0.14)',
  },
  errorTitle: { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  errorText: { color: colors.textMuted, fontSize: 14, textAlign: 'center' },
  errorActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 6 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  pillAccent: { experimental_backgroundImage: gradients.accent, borderColor: 'transparent' },
  pillText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
