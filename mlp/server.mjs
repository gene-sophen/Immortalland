import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('.', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };

createServer(async (req, res) => {
  const raw = decodeURIComponent((req.url || '/').split('?')[0]);
  const safe = normalize(raw).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
  let file = join(root, safe || 'index.html');
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch {
    try {
      const body = await readFile(join(root, 'index.html'));
      res.writeHead(200, { 'Content-Type': types['.html'], 'Cache-Control': 'no-store' });
      res.end(body);
    } catch {
      res.writeHead(404).end('Not found');
    }
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`三乂川 MLP：http://127.0.0.1:${port}`);
});
