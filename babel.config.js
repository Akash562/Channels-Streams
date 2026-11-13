module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Reanimated 4 animations run as worklets; this plugin must stay last.
  plugins: ['react-native-worklets/plugin'],
};
