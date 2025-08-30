import { ESLint } from 'eslint';
import stylisticPlugin from '@stylistic/eslint-plugin-js';

export default [
	{
		files: ['**/*.js'],
		ignores: ['node_modules/**', 'vendor/**', 'eslint.config.js', 'dist/**'],
		languageOptions: {
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
		plugins: {
			'@stylistic': stylisticPlugin,
		},
		rules: {
			'object-curly-newline': 'off',
			'padding-line-between-statements': [
				'error',
				{
					blankLine: 'always',
					prev: '*',
					next: 'return'
				},
			],
			'no-whitespace-before-property': 'error',
			'@stylistic/indent': ['error', 'tab', {
				'SwitchCase': 1,
				'FunctionExpression': {
					'parameters': 1,
					'body': 1
				},
				'MemberExpression': 1,
				'offsetTernaryExpressions': true
			}],
			'@stylistic/quotes': [
				'error',
				'single'
			],
			'@stylistic/space-in-parens': 'off',
			'@stylistic/array-bracket-spacing': 'off',
			'@stylistic/object-curly-spacing': [
				'error',
				'always'
			],
			'@stylistic/computed-property-spacing': 'off',
			'@stylistic/space-before-function-paren': 'off',
			'@stylistic/no-nested-ternary': 'off',
			'@stylistic/space-unary-ops': 'off',
			'@stylistic/semi': [
				'warn',
				'always'
			],
			'@stylistic/brace-style': [
				'warn',
				'stroustrup',
				{
					'allowSingleLine': false
				}
			],
			'max-len': 'off',
			'no-multiple-empty-lines': [
				'error',
				{
					'max': 2,
					'maxEOF': 1,
					'maxBOF': 0
				}
			],
			'block-spacing': 'error'
		}
	},
];
