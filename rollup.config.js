import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
    input: 'src/main.js',
    output: [
        {
            file: 'dist/bundle.js',
            format: 'iife'
        },
        {
            file: 'dist/bundle.min.js',
            format: 'iife',
            plugins: [terser()]
        }
    ],
    plugins: [
        resolve(),
        commonjs({transformMixedEsModules:true})
    ]
}