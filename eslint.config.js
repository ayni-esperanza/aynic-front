import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', '*.config.js', '*.config.ts'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // TypeScript rules 
      '@typescript-eslint/no-explicit-any': 'warn', // Solo warning en lugar de error
      '@typescript-eslint/no-unused-vars': 'warn', // Solo warning
      '@typescript-eslint/no-empty-function': 'off', // Permitir funciones vacías
      '@typescript-eslint/no-non-null-assertion': 'off', // Permitir ! operator
      '@typescript-eslint/ban-ts-comment': 'off', // Permitir @ts-ignore
      '@typescript-eslint/prefer-as-const': 'off', // No forzar as const
      '@typescript-eslint/no-inferrable-types': 'off', // Permitir tipos explícitos
      '@typescript-eslint/no-empty-interface': 'off', // Permitir interfaces vacías

      // JavaScript rules 
      'no-unused-vars': 'off', // Desactivar (TypeScript ya lo maneja)
      'no-console': 'off', // Permitir console.log
      'no-debugger': 'warn', // Solo warning para debugger
      'no-empty': 'warn', // Solo warning para bloques vacíos
      'prefer-const': 'warn', // Solo warning
      'no-var': 'warn', // Solo warning para var
      'no-undef': 'off', // TypeScript ya maneja esto mejor

      // Reglas de estilo 
      'indent': 'off', // No forzar indentación específica
      'quotes': 'off', // Permitir comillas simples y dobles
      'semi': 'off', // No forzar punto y coma
      'comma-dangle': 'off', // Permitir trailing commas opcionales
      'object-curly-spacing': 'off', // No forzar espacios en objetos
      'array-bracket-spacing': 'off', // No forzar espacios en arrays
      'space-before-function-paren': 'off', // Espacios antes de paréntesis opcionales

      // Reglas específicas modificadas
      'eqeqeq': 'off', // Permitir == además de ===
      'curly': 'off', // No forzar llaves en if/for de una línea
      'brace-style': 'off', // Estilo de llaves libre
      'camelcase': 'off', // No forzar camelCase
      'new-cap': 'off', // No forzar mayúsculas en constructores
      'no-underscore-dangle': 'off', // Permitir _ en nombres
      'no-plusplus': 'off', // Permitir ++ y --
      'no-continue': 'off', // Permitir continue
      'no-param-reassign': 'off', // Permitir reasignar parámetros
      'no-shadow': 'off', // Permitir variables shadow
      'import/prefer-default-export': 'off', // No forzar export default
      'class-methods-use-this': 'off', // Métodos sin this permitidos

      // Reglas React más permisivas
      'react/prop-types': 'off', // TypeScript ya maneja tipos
      'react/jsx-props-no-spreading': 'off', // Permitir {...props}
      'react/jsx-filename-extension': 'off', // Permitir JSX en .js
      'react/function-component-definition': 'off', // Estilo de componentes libre
      'react/jsx-no-useless-fragment': 'off', // Permitir <> vacíos
      'react/require-default-props': 'off', // No forzar defaultProps
      'react/jsx-no-constructed-context-values': 'off', // Valores de contexto dinámicos OK
    },
  }
);