module.exports = {
  env: {
    browser: true,
    es6: true,
    'jest/globals': true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    }
  },
  settings: {
    react: {
      version: "detect"
    }
  },
  extends: [
    "plugin:react/recommended", // Uses the recommended rules from @eslint-plugin-react
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from @typescript-eslint/eslint-plugin
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
    "plugin:jsx-a11y/recommended",
    'plugin:jest/recommended',
  ],
  plugins: ['@typescript-eslint', 'react', 'jest', 'enzyme'],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    "prettier/prettier": 0,
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/no-inferrable-types": 0,
    "@typescript-eslint/no-namespace": 0,
    "@typescript-eslint/ban-types": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "@typescript-eslint/no-var-requires":0,
    "react/display-name": 1,
    "react/no-children-prop": 0,
    "react/jsx-key": 0,
    "react/prop-types": 0,
    "prefer-const": 0,
    "no-var": 0,
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'warn',
    'jest/no-mocks-import': 'warn',
    'jest/no-standalone-expect': 'warn',
    'jest/no-test-callback': 'warn',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'warn',
    'jest/valid-expect-in-promise': 'warn',
    'jsx-a11y/aria-role': 'warn',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/interactive-supports-focus': 'warn',
    'jsx-a11y/no-autofocus': 'warn',
    'jsx-a11y/no-redundant-roles': 'warn',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
  },
};
