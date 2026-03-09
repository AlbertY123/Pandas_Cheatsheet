// Simple localhost server for the cheatsheet (no dependencies)
// Run: node serve_cheatsheet.js
// Then open: http://127.0.0.1:8787/

const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = '127.0.0.1';
const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const ROOT = __dirname;
const DEFAULT_FILE = 'index.html';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function safeResolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const rel = decoded === '/' ? '/' + DEFAULT_FILE : decoded;
  const joined = path.join(ROOT, rel);
  const resolved = path.resolve(joined);
  const rootResolved = path.resolve(ROOT);
  if (!resolved.startsWith(rootResolved)) return null; // prevent .. traversal
  return resolved;
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400);
    return res.end('Bad Request');
  }

  const filePath = safeResolve(req.url);
  if (!filePath) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const ctype = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': ctype,
      // Allow clipboard + other APIs on localhost without being blocked by cross-origin
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cache-Control': 'no-store'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Cheatsheet server running at http://${HOST}:${PORT}/`);
  console.log(`Serving: ${path.join(ROOT, DEFAULT_FILE)}`);
});
