/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest/presets/js-with-babel",
  testEnvironment: "node",
  transformIgnorePatterns: ["/node_modules/(?!(camelcase-keys|camelcase|quick-lru)/)"],
};
