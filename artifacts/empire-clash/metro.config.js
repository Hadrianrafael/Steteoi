const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const workspaceRoot = path.resolve(__dirname, "../..");
config.watchFolders = [workspaceRoot];

// ─── Block volatile directories ───────────────────────────────────────────
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const blocked = [
  path.join(workspaceRoot, ".local"),
  path.join(workspaceRoot, "node_modules", ".cache"),
];
config.resolver = config.resolver ?? {};
const prev = config.resolver.blockList;
const prevRe = prev ? (Array.isArray(prev) ? prev : [prev]) : [];
config.resolver.blockList = [
  ...prevRe,
  ...blocked.map((p) => new RegExp(`^${escape(p)}(/.*)?$`)),
];

// ─── Resolve workspace libs ───────────────────────────────────────────────
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// ─── Web stub for native-only AdMob SDK ──────────────────────────────────
// react-native-google-mobile-ads uses codegenNativeComponent which crashes
// the web bundler. Substitute a no-op stub when targeting web.
const ADMOB_STUB = path.resolve(__dirname, "lib/admob-web-stub.ts");
const prevResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === "web" &&
    moduleName === "react-native-google-mobile-ads"
  ) {
    return { filePath: ADMOB_STUB, type: "sourceFile" };
  }
  if (prevResolve) return prevResolve(context, moduleName, platform);
  return context.resolveRequest(context, moduleName, platform);
};

// ─── Bundle optimizations (production AAB) ────────────────────────────────
config.transformer = config.transformer ?? {};

// Inline requires: defers module evaluation until first use → faster cold start
config.transformer.inlineRequires = true;

// Asset extensions
config.resolver.assetExts = [
  ...(config.resolver.assetExts ?? []),
  "bin",
  "lottie",
];

module.exports = config;
