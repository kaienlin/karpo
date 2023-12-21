module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '~/assets': './assets',
            '~/components': './src/components',
            '~/navigation': './src/navigation',
            '~/redux': './src/redux',
            '~/screens': './src/screens',
            '~/services': './src/services',
            '~/types': './src/types',
            '~/utils': './src/utils',
            '~/hooks': './src/hooks'
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      ],
      'module:react-native-dotenv',
      'react-native-reanimated/plugin'
    ]
  }
}
