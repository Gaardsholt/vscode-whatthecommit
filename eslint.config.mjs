import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'no-throw-literal': 'error',
      'no-unused-expressions': 'error',
      'curly': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'class',
          format: ['PascalCase'],
        },
      ],
      'semi': ['error', 'always'],
      'eqeqeq': 'error',
    },
  },
);
