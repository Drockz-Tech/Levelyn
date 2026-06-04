const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add support for ES module extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"];

// Force resolution of CommonJS formats to avoid import.meta errors in modern packages
config.resolver.unstable_conditionNames = ["browser", "require", "react-native"];

module.exports = withNativeWind(config, { input: "./global.css" });
