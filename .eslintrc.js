module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['standard-with-typescript', 'plugin:react/recommended', 'prettier'],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', 'packages/*/tsconfig.json'],
  },
  plugins: ['react'],
  rules: {},
  settings: {
    react: {
      version: '18',
    },
  },
}
