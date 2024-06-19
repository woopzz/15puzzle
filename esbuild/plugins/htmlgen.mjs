import { resolve as resolvePath } from 'path';
import { writeFile } from 'fs/promises';

export const pluginHtmlGenerator = {
    name: 'htmlgen',
    setup(build) {
        build.onEnd(async (result) => {
            console.debug('Generate HTML');

            const outdir = build.initialOptions.outdir;
            if (!outdir) return;

            const outputs = result.metafile.outputs;
            const [js_fnames, css_fnames] = get_js_css_file_names(Object.keys(outputs));
            await writeFile(
                resolvePath(outdir, 'index.html'),
                minifyHtml(renderHtml(js_fnames, css_fnames)),
            );
        });
    },
}

function get_js_css_file_names(pathes) {
    const js_fnames = [];
    const css_fnames = [];

    for (let path of pathes) {
        const fname = path.split('/').pop();
        if (fname.endsWith('.js')) {
            js_fnames.push(fname);
        } else if (fname.endsWith('.css')) {
            css_fnames.push(fname);
        }
    }

    return [js_fnames, css_fnames];
}

function renderHtml(js_fnames, css_fnames) {
    const js = js_fnames.map(fname => `<script type="module" defer="defer" src="${fname}"></script>`).join('');
    const css = css_fnames.map(fname => `<link rel="stylesheet" href="${fname}">`).join('');
    return `
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>15 puzzle</title>
            ${js}${css}
        </head>

        <body>
            <h1>15 puzzle</h1>
            <div class="field border">
                <div class="box border user-select_none"></div>
                <div class="box border user-select_none"></div>
                <div class="box border user-select_none"></div>
                <div class="box border user-select_none"></div>
                <div class="box border user-select_none"></div>
                <div class="box border user-select_none"></div>
                <div class="box border user-select_none"></div>
                <div class="box border user-select_none"></div>
                <div class="box border user-select_none"></div>
                <div class="box border user-select_none"></div>
                <div class="box border user-select_none"></div>
                <div class="box border user-select_none"></div>
                <div class="box border user-select_none"></div>
                <div class="box border user-select_none"></div>
                <div class="box border user-select_none"></div>
                <div class="box border user-select_none"></div>
            </div>
            <h2 class="won-msg">Gratz! You won.</h2>
            <div class="buttons-panel">
                <div class="hint button user-select_none">Hint?</div>
                <div class="shuffle button user-select_none">Shuffle</div>
            </div>
        </body>

        </html>
    `;
}

function minifyHtml(html) {
    return html.replace(/\s\B/gm, '');
}
