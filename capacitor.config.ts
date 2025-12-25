import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.librearm.app',
  appName: 'LibreArm',
  webDir: 'dist',
  // Remove or comment out the server block for production builds
  // server: {
  //   url: 'https://50609f3a-cfd4-495c-84c9-65bb20170cd3.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#e8f4f8',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      androidScaleType: 'CENTER_CROP',
    },
  },
  android: {
    buildOptions: {
      // For release builds, set these via environment variables or gradle.properties
      keystorePath: process.env.KEYSTORE_PATH,
      keystorePassword: process.env.KEYSTORE_PASSWORD,
      keystoreAlias: process.env.KEYSTORE_ALIAS,
      keystoreAliasPassword: process.env.KEYSTORE_ALIAS_PASSWORD,
    }
  },
  ios: {
    scheme: 'LibreArm',
  }
};

export default config;