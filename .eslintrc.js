module.exports = {
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 9,
  },
  ecmaFeatures: {
    modules: true,
  },
  env: {
    node: true,
    es6: true,
  },
  rules: {
    quotes: ['error', 'single', { avoidEscape: false }],
    semi: ['error', 'always'],
  },
};
