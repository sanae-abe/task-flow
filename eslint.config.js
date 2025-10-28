import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import prettier from 'eslint-plugin-prettier';
import security from 'eslint-plugin-security';

export default [
  // グローバル設定
  {
    ignores: [
      'dist',
      'build',
      'node_modules',
      '*.config.js',
      '*.config.ts',
      'coverage',
      '.eslintrc.js'
    ]
  },

  // 基本設定
  js.configs.recommended,

  // TypeScript基本設定
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        // React 19 JSX変換対応
        React: 'readonly',
        // Node.js globals
        NodeJS: 'readonly',
        // Browser globals
        EventListener: 'readonly',
        IDBTransactionMode: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': react,
      'react-hooks': reactHooks,
      'prettier': prettier,
      'security': security
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      // TypeScript関連ルール
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // React関連ルール（React 19対応）
      'react/jsx-uses-react': 'off', // React 19では不要
      'react/react-in-jsx-scope': 'off', // React 19では不要
      'react/jsx-props-no-spreading': ['warn', {
        html: 'enforce',
        custom: 'ignore',
        explicitSpread: 'ignore'
      }],
      'react/jsx-key': ['error', {
        checkFragmentShorthand: true,
        checkKeyMustBeforeSpread: true
      }],
      'react/self-closing-comp': ['error', {
        component: true,
        html: true
      }],
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-pascal-case': 'error',
      'react/prop-types': 'off', // TypeScriptを使用するため無効

      // React Hooks
      ...reactHooks.configs.recommended.rules,

      // 一般的なルール
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-unused-vars': 'off', // TypeScriptルールを使用
      'no-undef': 'off', // TypeScriptで解決
      'no-case-declarations': 'off', // switch文での宣言を許可

      // 未使用変数を緩和
      'no-unused-expressions': ['error', {
        allowShortCircuit: true,
        allowTernary: true
      }],
      'no-duplicate-imports': 'error',
      'prefer-template': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'object-shorthand': 'error',

      // セキュリティルール
      ...security.configs.recommended.rules
    }
  },

  // テストファイル専用設定（Vitest対応）
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        // Vitest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off'
    }
  },

  // React TSXファイル専用設定
  {
    files: ['**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off'
    }
  },

  // Shadcn/UI コンポーネント専用設定
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react/jsx-props-no-spreading': 'off'
    }
  },

  // 設定ファイル専用設定
  {
    files: ['**/*.config.{js,ts}', 'vite.config.*', 'vitest.config.*'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-console': 'off'
    }
  }
];