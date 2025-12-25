import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.50609f3acfd4495c84c965bb20170cd3',
  appName: 'LibreArm',
  webDir: 'dist',
  server: {
    url: 'https://50609f3a-cfd4-495c-84c9-65bb20170cd3.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
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
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    }
  }
};

export default config;