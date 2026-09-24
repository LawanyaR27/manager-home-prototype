import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';

const root = import.meta.dirname;
const port = Number(process.env.PORT ?? 4173);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

async function resolve(pathname) {
  const requested = decodeURIComponent(pathname.split('?')[0]);
  const candidate = normalize(join(root, requested === '/' ? 'onboarding.html' : requested));
  // Refuse anything that escapes the prototype folder.
  if (candidate !== root && !candidate.startsWith(root + sep)) return null;
  const info = await stat(candidate).catch(() => null);
  if (info?.isDirectory()) return resolve(join(requested, 'index.html'));
  return info?.isFile() ? candidate : null;
}

createServer(async (request, response) => {
  const file = await resolve(new URL(request.url, 'http://localhost').pathname);
  if (!file) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  response.writeHead(200, {
    'content-type': types[extname(file)] ?? 'application/octet-stream',
    // Prototype edits must show up on a plain reload, without cache-busting query strings.
    'cache-control': 'no-store, must-revalidate',
  });
  createReadStream(file).pipe(response);
}).listen(port, () => {
  console.log(`Manager Home prototype: http://localhost:${port}/`);
});
