import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bipinrimal.chopinstouch',
  appName: "Chopin's Touch",
  webDir: 'dist',
  server: {
    // No external server — fully client-side from bundled files
    androidScheme: 'https',
  },
  ios: {
    // Landscape orientation for piano keyboard
    preferredContentMode: 'desktop',
  },
};

export default config;
