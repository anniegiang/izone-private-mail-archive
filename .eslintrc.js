module.exports = {
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 8,
  },
  env: {
    node: true,
  },
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
  },
};
