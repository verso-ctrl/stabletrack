import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.barnkeep.app',
  appName: 'BarnKeep',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#f5f5f4', // stone-100
      androidSplashResourceName: 'splash',
      showSpinner: true,
      spinnerColor: '#f59e0b', // amber-500
    },
    StatusBar: {
      style: 'light',
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
