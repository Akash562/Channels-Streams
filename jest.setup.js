/* eslint-env jest */
// Mocks for native modules so the app can render under Jest.

require('react-native-gesture-handler/jestSetup');

jest.mock('react-native-worklets', () => ({
  scheduleOnRN: (fn, ...args) => fn(...args),
  runOnJS: fn => fn,
}));

// Lightweight Reanimated stand-in: animations resolve to their end values and
// layout animations (FadeIn, ZoomIn…) become no-op chainable objects.
jest.mock('react-native-reanimated', () => {
  const RN = require('react-native');
  const chain = new Proxy(function () {}, { get: () => chain, apply: () => chain });
  const Animated = {
    View: RN.View,
    Text: RN.Text,
    Image: RN.Image,
    ScrollView: RN.ScrollView,
    FlatList: RN.FlatList,
    createAnimatedComponent: component => component,
  };
  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    useSharedValue: value => ({ value }),
    useAnimatedStyle: () => ({}),
    useAnimatedScrollHandler: () => () => {},
    useReducedMotion: () => true,
    withTiming: value => value,
    withSpring: value => value,
    withRepeat: value => value,
    withDelay: (_delay, value) => value,
    withSequence: (...values) => values[values.length - 1],
    cancelAnimation: () => {},
    interpolate: () => 0,
    interpolateColor: () => 'transparent',
    Easing: chain,
    Extrapolation: { CLAMP: 'clamp' },
    FadeIn: chain,
    FadeInDown: chain,
    FadeOut: chain,
    ZoomIn: chain,
    ZoomOut: chain,
  };
});

jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

jest.mock('@op-engineering/op-sqlite', () => ({
  open: () => ({ executeSync: () => ({ rows: [], rowsAffected: 0 }) }),
}));

jest.mock('react-native-orientation-director', () => ({
  __esModule: true,
  default: { lockTo: jest.fn(), unlock: jest.fn() },
  Orientation: { portrait: 1, landscapeRight: 2, landscapeLeft: 4, landscape: 5 },
}));

jest.mock('react-native-haptic-feedback', () => ({ trigger: jest.fn() }));

jest.mock('react-native-video', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: View };
});

jest.mock('lottie-react-native', () => {
  const { View } = require('react-native');
  return { __esModule: true, default: View };
});

// Icons render as empty views in tests.
jest.mock('./src/components/icons', () => {
  const Stub = () => null;
  return new Proxy({ __esModule: true }, { get: (target, key) => target[key] ?? Stub });
});

jest.mock('./channels', () => ({
  channels: [
    { id: 1, title: 'Test Music', group: 'Music', logo: 'https://example.com/a.png', url: 'https://example.com/a.m3u8' },
    { id: 2, title: 'Test News', group: 'News', logo: '', url: 'https://example.com/b.m3u8' },
  ],
}));
