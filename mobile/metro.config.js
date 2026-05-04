const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support for absolute imports via @ alias (src/)
config.resolver.alias = {
  '@': `${__dirname}/src`,
};

module.exports = config;
