const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Monorepo: include workspace root so shared libs resolve correctly
const workspaceRoot = path.resolve(__dirname, "../..");
config.watchFolders = [workspaceRoot];

module.exports = config;
