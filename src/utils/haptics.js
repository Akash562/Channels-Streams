import { trigger } from 'react-native-haptic-feedback';

/** Light haptic tick. Never throws, so a device without haptics just stays silent. */
export function haptic(type = 'selection') {
  try {
    trigger(type);
  } catch {
    // Haptics are optional.
  }
}
