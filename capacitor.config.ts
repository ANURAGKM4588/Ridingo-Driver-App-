import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ridingo.driver',
  appName: 'RIDINGO DRIVER',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#090D16',
      overlaysWebView: true
    }
  }
};

export default config;
