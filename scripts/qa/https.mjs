import https from 'node:https';
import http from 'node:http';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

// Local-only TLS proxy: verify the real CSP without stripping upgrade-insecure-requests.
const directory = mkdtempSync(join(tmpdir(), 'homepage-https-'));
const key = join(directory, 'key.pem');
const cert = join(directory, 'cert.pem');
execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', cert, '-days', '1', '-subj', '/CN=localhost'], { stdio: 'ignore' });
const server = https.createServer({ key: readFileSync(key), cert: readFileSync(cert) }, (request, response) => {
  const upstream = http.request({ hostname: '127.0.0.1', port: 3100, path: request.url, method: request.method, headers: request.headers }, incoming => {
    response.writeHead(incoming.statusCode || 502, incoming.headers);
    incoming.pipe(response);
  });
  upstream.on('error', () => { response.writeHead(502); response.end(); });
  request.pipe(upstream);
});
server.listen(3443, '127.0.0.1', () => console.log('QA HTTPS ready on https://localhost:3443'));
process.on('exit', () => rmSync(directory, { recursive: true, force: true }));
process.on('SIGTERM', () => server.close(() => process.exit()));
