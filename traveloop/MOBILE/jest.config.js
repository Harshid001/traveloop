module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(expo-modules-core|expo|@expo|expo-secure-store|expo-local-authentication|react-native|@react-native|@react-navigation)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/'],
};