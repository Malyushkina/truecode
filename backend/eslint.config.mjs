// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import v8 from 'node:v8';

// Полифилл structuredClone для старых окружений Node
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = (obj) => v8.deserialize(v8.serialize(obj));
}

// Полифилл AbortSignal.prototype.throwIfAborted для старых Node
try {
  if (
    typeof globalThis.AbortSignal !== 'undefined' &&
    !('throwIfAborted' in globalThis.AbortSignal.prototype)
  ) {
    // eslint-disable-next-line no-extend-native
    globalThis.AbortSignal.prototype.throwIfAborted =
      function throwIfAborted() {
        if (this.aborted) {
          const reason = /** @type {any} */ (this).reason;
          const err =
            reason instanceof Error
              ? reason
              : new Error(String(reason ?? 'This operation was aborted'));
          // @ts-ignore
          err.name = 'AbortError';
          throw err;
        }
      };
  }
} catch {}

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  {
    files: ['**/*.e2e-spec.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
);
