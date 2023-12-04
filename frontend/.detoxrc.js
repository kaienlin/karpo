/** @type {Detox.DetoxConfig} */
module.exports = {
  logger: {
    level: process.env.CI ? 'debug' : undefined
  },
  testRunner: {
    $0: 'jest',
    args: {
      config: 'e2e/jest.config.js',
      _: ['e2e']
    }
  },
  artifacts: {
    plugins: {
      log: process.env.CI ? 'failing' : undefined,
      screenshot: 'failing'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: { type: 'iPhone 15' }
    },
    emulator: {
      type: 'android.emulator',
      device: { avdName: 'pixel_4' }
    }
  },
  apps: {
    'ios.karpo': {
      type: 'ios.app',
      build: 'eas build -p ios --profile preview',
      binaryPath: 'ios/Karpo.app'
    },
    'android.karpo': {
      type: 'android.apk',
      build: 'eas build -p android --profile preview',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk'
    }
  },
  configurations: {
    'ios.sim': {
      device: 'simulator',
      app: 'ios.karpo'
    },
    'android.sim': {
      device: 'emulator',
      app: 'android.karpo'
    }
  }
}
