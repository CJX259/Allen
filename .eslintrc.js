module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
    'node': true,
  },
  'extends': [
    'plugin:react/recommended',
    'google',
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    },
    'ecmaVersion': 'latest',
  },
  'plugins': [
    'react',
    '@typescript-eslint',
  ],
  'rules': {
    'object-curly-spacing': [0, 'never'],
    'require-jsdoc': 0,
  },
};
