module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env.local',
          safe: false,
          allowUndefined: false,
        },
      ],
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@components': ['./src/components'],
            '@screens': ['./src/screens'],
            '@store': ['./src/store'],
            '@utils': ['./src/utils'],
            '@api': ['./src/api'],
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
