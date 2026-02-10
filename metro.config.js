// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
  // 웹에서 zustand 등 패키지가 ESM(.mjs)의 import.meta를 사용하는 문제 방지
  // react-native 조건을 추가하여 CJS 버전으로 resolve 되도록 함
  unstable_conditionsByPlatform: {
    ...config.resolver.unstable_conditionsByPlatform,
    web: [
      'browser',
      'react-native',
      ...(config.resolver.unstable_conditionsByPlatform?.web ?? []),
    ],
  },
};

module.exports = config;
