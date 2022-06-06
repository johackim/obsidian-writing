import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'src/main.js',
    output: [
        { format: 'cjs', file: 'main.js', exports: 'named' },
    ],
    external: ['obsidian', 'electron'],
    plugins: [
        nodeResolve(),
        babel({ babelHelpers: 'bundled' }),
        commonjs(),
        terser(),
    ],
};
