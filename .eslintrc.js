module.exports = {
  parser: '@babel/eslint-parser',
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['jest'],
  globals: {
    process: true,
    console: true,
    module: true,
    Promise: true,
    exports: true,
    Buffer: true,
    globalThis: true,
    fetch: true,
    URLSearchParams: true,
    TextEncoder: true,
    ArrayBuffer: true,
  },
  env: {
    'jest/globals': true,
    es6: true,
  },
};
