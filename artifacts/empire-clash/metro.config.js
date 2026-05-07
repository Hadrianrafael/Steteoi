const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const workspaceRoot = path.resolve(__dirname, "../..");
config.watchFolders = [workspaceRoot];

// Block volatile directories (Replit temp skill folders, etc.)
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const blocked = [
  path.join(workspaceRoot, ".local"),
  path.join(workspaceRoot, "node_modules", ".cache"),
];
config.resolver = config.resolver ?? {};
const prev = config.resolver.blockList;
const prevRe = prev
  ? Array.isArray(prev)
    ? prev
    : [prev]
  : [];
config.resolver.blockList = [
  ...prevRe,
  ...blocked.map((p) => new RegExp(`^${escape(p)}(/.*)?$`)),
];

module.exports = config;
