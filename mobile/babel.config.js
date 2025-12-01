module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Adicione plugins se necessário
      'react-native-reanimated/plugin', // Se usar react-native-reanimated
    ],
  };
};