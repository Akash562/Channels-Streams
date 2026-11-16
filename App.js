import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RNOrientationDirector, { Orientation } from 'react-native-orientation-director';

import { HomeScreen } from './src/screens/HomeScreen';
import { ThemeProvider } from './src/theme/ThemeProvider';

export default function App() {
  // The channel list is portrait-only; the player switches to landscape itself.
  useEffect(() => {
    RNOrientationDirector.lockTo(Orientation.portrait);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <HomeScreen />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
