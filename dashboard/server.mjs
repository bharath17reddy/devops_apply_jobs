#!/usr/bin/env node

/**
 * dashboard/server.mjs — Simple HTTP server for career-ops dashboard
 *
 * Serves the tracker UI and provides API endpoints for automation.
 *
 * Usage:
 *   node dashboard/server.mjs [--port=3000]
 */

import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { execFile } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.argv.find(arg => arg.startsWith('--port='))?.split('=')[1] || 3000;

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/') {
    try {
      const html = await readFile(join(__dirname, 'tracker.html'), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (err) {
      res.writeHead(500);
      res.end('Error loading tracker.html');
    }
  } else if (req.method === 'POST' && url.pathname === '/auto-apply') {
    // Run auto-apply.mjs --mark
    execFile('node', [join(__dirname, '..', 'auto-apply.mjs'), '--mark'], { cwd: join(__dirname, '..') }, (error, stdout, stderr) => {
      if (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message, stderr }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, output: stdout }));
      }
    });
  } else if (req.method === 'GET' && url.pathname === '/pipeline.json') {
    try {
      const json = await readFile(join(__dirname, 'pipeline.json'), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(json);
    } catch (err) {
      res.writeHead(500);
      res.end('Error loading pipeline.json');
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Dashboard server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to view the pipeline tracker.`);
});