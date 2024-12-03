import reactJSXRuntime from 'eslint-plugin-react/configs/jsx-runtime.js'
import reactRecommended from 'eslint-plugin-react/configs/recommended.js'
import tseslint from 'typescript-eslint'
import rootConfig from '../../eslint.config.js'

export default tseslint.config([
  ...rootConfig,
  reactRecommended,
  reactJSXRuntime,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    settings: {
      react: {
        version: 'detect'
      }
    },
    languageOptions: {
      ...reactRecommended.languageOptions,
      ...reactJSXRuntime.languageOptions
    },
    rules: {
      ...reactRecommended.rules,
      ...reactJSXRuntime.rules,
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-closing-bracket-location': ['error', 'after-props'],
      'react/function-component-definition': [
        2,
        {
          namedComponents: 'arrow-function'
        }
      ]
    }
  }
])
