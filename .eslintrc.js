module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  globals: {
    // React 19 JSX変換対応
    React: 'readonly',
    // Node.js globals
    NodeJS: 'readonly',
    // Browser globals
    EventListener: 'readonly',
    IDBTransactionMode: 'readonly'
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
    '@typescript-eslint/no-explicit-any': 'warn', // warningに変更
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
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

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
    'object-shorthand': 'error'
  },
  overrides: [
    // TypeScriptファイル専用設定
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        // TypeScriptでは型チェックが行われるため、これらを無効化
        'no-undef': 'off',
        'no-unused-vars': 'off'
      }
    },
    // テストファイル専用設定（Vitest対応）
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      env: {
        node: true
      },
      globals: {
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
      files: ['**/*.config.js', '**/*.config.ts', 'vite.config.*', 'vitest.config.*'],
      env: {
        node: true
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off'
      }
    }
  ],
  settings: {
    react: {
      version: 'detect'
    }
  }
};