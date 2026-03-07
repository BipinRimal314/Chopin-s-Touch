import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * Light haptic tap for piano key presses.
 * No-ops silently on web (non-Capacitor) environments.
 */
export async function tapHaptic(): Promise<void> {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Not available (web browser, unsupported device)
  }
}

/**
 * Medium haptic for note success feedback.
 */
export async function successHaptic(): Promise<void> {
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch {}
}
