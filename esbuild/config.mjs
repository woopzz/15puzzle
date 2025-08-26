import * as esbuild from 'esbuild'
import { pluginCleanup } from './plugins/cleanup.mjs';
import { pluginHtmlGenerator } from './plugins/htmlgen.mjs';

await esbuild.build({
    outdir: './dist',
    entryPoints: ['./src/index.js'],
    entryNames: '[dir]/bundle.[name]-[hash]',
    bundle: true,
    minify: true,
    format: 'esm',
    metafile: true,
    plugins: [pluginCleanup, pluginHtmlGenerator],
    loader: {
        '.wasm': 'file',
    }
});
