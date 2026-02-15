import globals from 'globals'
import js from '@eslint/js'
import vue from 'eslint-plugin-vue'

export default [
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.{js,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      quotes: ['error', 'single', { avoidEscape: true }],
      'vue/html-quotes': ['error', 'double'],
      semi: ['error', 'never'],
      'vue/html-indent': ['error', 2],
      'vue/max-attributes-per-line': ['error', { singleline: 4 }],
      'vue/multi-word-component-names': 'off'
    }
  }
]
