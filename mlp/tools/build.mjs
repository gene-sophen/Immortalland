import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, 'src'), { recursive: true });
await cp(join(root, 'index.html'), join(dist, 'index.html'));
await cp(join(root, 'styles.css'), join(dist, 'styles.css'));
await cp(join(root, 'src'), join(dist, 'src'), { recursive: true });
console.log('Built static prototype to mlp/dist');
