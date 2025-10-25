// babel.config.js (root)
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["expo-router/babel"], // (add "nativewind/babel" later, not now)
  };
};
