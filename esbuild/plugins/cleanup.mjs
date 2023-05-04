import { rm } from 'fs/promises';

export const pluginCleanup = {
    name: 'cleanup',
    setup(build) {
        build.onStart(async () => {
            try {
                const outdir = build.initialOptions.outdir;
                if (!outdir) return;

                console.debug(`Clean up ${outdir}`);
                await rm(outdir, { recursive: true });
            } catch (e) {
                console.error('An error during cleanup.', e);
            }
        });
    },
}
