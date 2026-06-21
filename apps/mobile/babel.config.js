module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated v4 moved its babel plugin to react-native-worklets. MUST be last.
    plugins: ['react-native-worklets/plugin'],
  };
};
