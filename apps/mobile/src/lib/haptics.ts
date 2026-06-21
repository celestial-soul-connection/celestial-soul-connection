/**
 * haptics — thin wrapper so taps feel tactile and premium. Respects the active
 * feel preset (feel.motion.haptics) and degrades silently on web/unsupported.
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const haptic = {
  light() {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  medium() {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  success() {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
};
