import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { getSetting, setSetting } from '../db/settings';
import { palettes } from './tokens';

/**
 * Light / dark theme. Light is the default; the user's choice is saved in
 * SQLite and read synchronously at startup, so a saved dark theme never
 * flashes light first.
 */
const DEFAULT_MODE = 'light';
const STORAGE_KEY = 'theme';

const ThemeContext = createContext(null);

function readSavedMode() {
  try {
    const saved = getSetting(STORAGE_KEY);
    return saved === 'dark' || saved === 'light' ? saved : DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(readSavedMode);
  // 0 = light, 1 = dark. Animated so the background can crossfade.
  const progress = useSharedValue(mode === 'dark' ? 1 : 0);

  const setMode = useCallback(
    next => {
      setModeState(next);
      progress.value = withTiming(next === 'dark' ? 1 : 0, { duration: 450 });
      try {
        setSetting(STORAGE_KEY, next);
      } catch (error) {
        console.warn('Could not save theme', error);
      }
    },
    [progress],
  );

  const toggleMode = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === 'dark',
      colors: palettes[mode],
      progress,
      setMode,
      toggleMode,
    }),
    [mode, progress, setMode, toggleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used inside <ThemeProvider>');
  }
  return theme;
}

/**
 * Builds a StyleSheet from the active theme and rebuilds it only when the
 * theme changes. Pass a factory defined at module level:
 *   const makeStyles = ({ colors }) => StyleSheet.create({ ... });
 */
export function useStyles(factory) {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
