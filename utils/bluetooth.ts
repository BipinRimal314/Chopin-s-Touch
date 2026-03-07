/**
 * Bluetooth audio detection.
 *
 * Bluetooth headphones add ~150-300ms latency which makes real-time
 * piano practice unusable. We detect Bluetooth output and warn the user.
 */

/**
 * Check if audio is currently routed through a Bluetooth device.
 * Uses navigator.mediaDevices.enumerateDevices() where available.
 * Returns false if the API is unavailable (fails safe — no false warnings).
 */
export async function isBluetoothAudioActive(): Promise<boolean> {
  if (!navigator.mediaDevices?.enumerateDevices) return false;

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some(
      (d) =>
        d.kind === 'audiooutput' &&
        d.label.toLowerCase().includes('bluetooth'),
    );
  } catch {
    return false;
  }
}
