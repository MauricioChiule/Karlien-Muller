import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    files: ['**/*.rules'],
    plugins: {
      'firebase-security-rules': firebaseRulesPlugin
    },
    languageOptions: {
      ecmaVersion: 2020,
    }
  },
  firebaseRulesPlugin.configs['flat/recommended']
];
