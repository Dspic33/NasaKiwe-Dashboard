const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Agregamos soporte para archivos .ico
config.resolver.assetExts.push('ico');

module.exports = config;
