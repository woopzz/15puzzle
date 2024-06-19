import * as esbuild from 'esbuild'
import { pluginCleanup } from './plugins/cleanup.mjs';
import { pluginHtmlGenerator } from './plugins/htmlgen.mjs';

await esbuild.build({
    outdir: './dist',
    entryPoints: ['./src/index.ts'],
    entryNames: '[dir]/bundle.[name]-[hash]',
    tsconfig: './tsconfig.json',
    bundle: true,
    minify: true,
    format: 'esm',
    metafile: true,
    plugins: [pluginCleanup, pluginHtmlGenerator],
    loader: {
        '.wasm': 'file',
    }
});
