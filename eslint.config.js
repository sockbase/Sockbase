import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import stylisticJSX from '@stylistic/eslint-plugin-jsx'
import importPlugin from 'eslint-plugin-import'
import tseslint from 'typescript-eslint'

export default tseslint.config([
  {
    ignores: ['**/lib/**', '**/dist/**']
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error', {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/triple-slash-reference': 'off'
    }
  },
  stylistic.configs['recommended-flat'],
  {
    rules: {
      ...stylistic.configs['recommended-flat'].rules,
      '@stylistic/semi': 'error',
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/eol-last': 'error',
      '@stylistic/multiline-ternary': ['error', 'always-multiline'],
      '@stylistic/member-delimiter-style': 'off',
      '@stylistic/prop-types': 'off',
      '@stylistic/array-bracket-spacing': ['error', 'never'],
      '@stylistic/comma-spacing': ['error', { after: true }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/comma-dangle': ['error', 'never'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/operator-linebreak': ['error', 'before', { overrides: { '=': 'after' } }],
      '@stylistic/react-in-jsx-scope': 'off',
      '@stylistic/jsx-tag-spacing': ['error', { beforeSelfClosing: 'always' }],
      '@stylistic/jsx-indent': 'off',
      '@stylistic/jsx-indent-props': 'off',
      '@stylistic/jsx-closing-bracket-location': 'off',
      '@stylistic/jsx-one-expression-per-line': 'off'
    }
  },
  {
    ...stylisticJSX.configs['all-flat'],
    rules: {
      ...stylisticJSX.configs['all-flat'].rules,
      '@stylistic/jsx/jsx-indent': 'off',
      '@stylistic/jsx/jsx-indent-props': 'off',
      '@stylistic/jsx/jsx-closing-bracket-location': 'off',
      '@stylistic/jsx/jsx-newline': 'off',
      '@stylistic/jsx/jsx-one-expression-per-line': 'off'
    }
  },
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    settings: {
      typescript: { }
    },
    rules: {
      'import/no-unresolved': 'off',
      'import/no-named-as-default': 'off',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'unknown',
            'parent',
            'sibling',
            'index',
            'object',
            'type'
          ],
          pathGroups: [
            {
              pattern: '{react,react-dom/**,react-router-dom,react-icons/**,styled-components}',
              group: 'builtin',
              position: 'before'
            }
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {
            order: 'asc'
          }
        }
      ]
    }
  }
])
