/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: 'Karpo',
  slug: 'karpo',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    bundleIdentifier: 'com.karpo.app',
    supportsTablet: true,
    config: {
      googleMapsApiKey: process.env.MAPS_SDK_IOS_API_KEY
    }
  },
  android: {
    package: 'com.karpo.app',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    config: {
      googleMaps: {
        apiKey: process.env.MAPS_SDK_ANDROID_API_KEY
      }
    }
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: ['@config-plugins/detox'],
  extra: {
    eas: {
      projectId: '42364973-7a1b-4f7f-9b73-8ac9720318d6'
    }
  }
}
