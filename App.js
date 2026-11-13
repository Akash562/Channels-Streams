import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RNOrientationDirector, { Orientation } from 'react-native-orientation-director';

import { HomeScreen } from './src/screens/HomeScreen';
import { colors } from './src/theme/tokens';

export default function App() {
  // The channel list is portrait-only; the player switches to landscape itself.
  useEffect(() => {
    RNOrientationDirector.lockTo(Orientation.portrait);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <HomeScreen />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
